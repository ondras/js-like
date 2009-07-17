/**
 * @class Generic memory
 * @augments RPG.Misc.SerializableInterface
 */
RPG.Memory = OZ.Class().implement(RPG.Misc.SerializableInterface);

/**
 * @class Mapping memory
 * @augments RPG.Memory
 */
RPG.Memory.MapMemory = OZ.Class().extend(RPG.Memory);
RPG.Memory.MapMemory.prototype.init = function() {
	this._maps = {};
	this._current = null;
}

RPG.Memory.MapMemory.prototype.setMap = function(map) {
	if (this._current) { this._current.save(); }

	var id = map.getId();
	var m = null;
	if (id in this._maps) {
		m = this._maps[id];
	} else {
		m = new RPG.Memory.Map();
		m.setup(map);
		this._maps[id] = m;
	}
	
	this._current = m;
	this.updateComplete();
}

RPG.Memory.MapMemory.prototype.updateComplete = function() {
	this._current.load();
	this._current.updateVisible();
}

RPG.Memory.MapMemory.prototype.updateCoords = function(coords) {
	this._current.updateCoords(coords);
}

RPG.Memory.MapMemory.prototype.updateVisible = function() {
	this._current.updateVisible();
}

RPG.Memory.MapMemory.prototype.forget = function() {
	this._current = null;
	var map = RPG.World.getMap();
	var id = map.getId();
	delete this._maps[id];
	this.setMap(map);
}

/**
 * @class One memorized map
 */
RPG.Memory.Map = OZ.Class();

RPG.Memory.Map.prototype.init = function() {
	this.map = null;
	
	/* cached list of visible cells */
	this.visibleCells = [];
}

RPG.Memory.Map.prototype.setup = function(map) {
	this.map = map;
	this._data = [];
	var size = map.getSize();
	var c = new RPG.Misc.Coords();
	for (var i=0;i<size.x;i++) {
		this._data.push([]);
		for (var j=0;j<size.y;j++) {
			c.x = i;
			c.y = j;
			var cell = new RPG.Memory.Map.Cell();
			cell.setup(this, c);
			this._data[i].push(cell);
		}
	}
}

/**
 * The game states that these coordinates have changed and we need to update them.
 * Cell gets updated only if it is visible
 * @param {RPG.Misc.Coords} coords
 */
RPG.Memory.Map.prototype.updateCoords = function(coords) {
	var cell = this._data[coords.x][coords.y];
	if (cell.state == RPG.MAP_VISIBLE) { cell.update();	}
}

/**
 * Visible area has changed - need to refresh whole map subset. This is the _slowest_ part.
 */
RPG.Memory.Map.prototype.updateVisible = function() {
	/*
	var pc = RPG.World.getPC();
	var size = this.map.getSize();
	var coords = RPG.World.getPC().getCell().getCoords();
	var dist = pc.sightDistance();
	
	// first, walk through all visible and hide them if necessaray
	for (var i=this.visibleCells.length-1;i>=0;i--) {
		var cell = this.visibleCells[i];
		cell.update();
		if (cell.state != RPG.MAP_VISIBLE) { this.visibleCells.splice(i, 1); }
	}
	
	// second, check area around PC's current position to add new visible cells 
	var minX = Math.max(0, coords.x - dist);
	var maxX = Math.min(size.x-1, coords.x + dist);
	var minY = Math.max(0, coords.y - dist);
	var maxY = Math.min(size.y-1, coords.y + dist);
	
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=minX; i<=maxX; i++) {
		for (var j=minY; j<=maxY; j++) {
			this._data[i][j].update();
		}
	}*/

	var visible = RPG.World.getPC().visibleCoords();
	visible.push(RPG.World.getPC().getCell().getCoords());
	
	for (var i=this.visibleCells.length-1;i>=0;i--) {
		var cell = this.visibleCells[i];
		var ok = false;
		for (var j=0;j<visible.length;j++) {
			var vis = visible[j];
			if (vis.x == cell._coords.x && vis.y == cell._coords.y) { ok = true; }
		}
		if (!ok) { 
			cell.setState(RPG.MAP_REMEMBERED);
			this.visibleCells.splice(i, 1);
		}
	}
	
	this.visibleCells = [];
	for (var j=0;j<visible.length;j++) {
		var vis = visible[j];
		var cell = this._data[vis.x][vis.y];
		cell.setState(RPG.MAP_VISIBLE);
		this.visibleCells.push(cell);
	}

	
	
}

/**
 * Memorize what is available, we are leaving this map
 */
RPG.Memory.Map.prototype.save = function() {
	this.visibleCells = [];
	var size = this.map.getSize();
	for (var i=0;i<size.x;i++) {
		for (var j=0;j<size.y;j++) {
			this._data[i][j].save();
		}
	}
}

/**
 * Recall from memory, we just came to this map
 */
RPG.Memory.Map.prototype.load = function() {
	var size = this.map.getSize();
	RPG.UI.map.resize(size);
	for (var i=0;i<size.x;i++) {
		for (var j=0;j<size.y;j++) {
			this._data[i][j].load();
		}
	}
}

/**
 * @class Memory map cell
 * @augments RPG.Misc.SerializableInterface
 */
RPG.Memory.Map.Cell = OZ.Class().implement(RPG.Misc.SerializableInterface);
RPG.Memory.Map.Cell.prototype.init = function() {
	this.state = null;
	this._owner = null;
	this._remembered = [];
}
RPG.Memory.Map.Cell.prototype.setup = function(owner, coords) {
	this._owner = owner;
	this._coords = coords.clone();
	this.state = RPG.MAP_UNKNOWN;
}

/**
 * Update cell's status from the actual map
 */
RPG.Memory.Map.Cell.prototype.update = function() {
	var pc = RPG.World.getPC();
	if (pc.canSee(this._coords)) {
		if (this.state != RPG.MAP_VISIBLE) {
			this._owner.visibleCells.push(this);
		}
		this.setState(RPG.MAP_VISIBLE);
	} else if (this.state == RPG.MAP_VISIBLE) {
		this.setState(RPG.MAP_REMEMBERED);
	}
}

/**
 * Force state. No caching checks are performed, this is called only if the cell truly 
 * needs state change.
 * @param {int} state One of RPG.MAP_* constants
 */
RPG.Memory.Map.Cell.prototype.setState = function(state) {
	switch (state) {
		case RPG.MAP_VISIBLE:
			var stack = this._visibleStack();
			RPG.UI.map.redrawCoords(this._coords, stack, false);
		break;
		
		case RPG.MAP_REMEMBERED:
			/* clone everything into memory */
			this.save();
			RPG.UI.map.redrawCoords(this._coords, this._remembered, true);
		break;
		
		case RPG.MAP_UNKNOWN:
			/* completely erase memory cell */
			this._remembered = [];
			RPG.UI.map.redrawCoords(this._coords, [], false);
		break;
	}

	this.state = state;
}

/**
 * Prepare memory for leaving the map: switch all visible to remembered
 */
RPG.Memory.Map.Cell.prototype.save = function() {
	if (this.state != RPG.MAP_VISIBLE) { return; }
	this.state = RPG.MAP_REMEMBERED;
	this._remembered = this._rememberedStack();
}

/**
 * Load map from memory. Only remembered and unknown cells should be present
 */
RPG.Memory.Map.Cell.prototype.load = function() {
	switch (this.state) {
		case RPG.MAP_REMEMBERED:
			RPG.UI.map.redrawCoords(this._coords, this._remembered, true);
		break;

		case RPG.MAP_UNKNOWN:
			RPG.UI.map.redrawCoords(this._coords, [], false);
		break;
	}
}

/**
 * Get a stack of visible objects, typically a cell [+ something]
 */
RPG.Memory.Map.Cell.prototype._visibleStack = function() {
	var pc = RPG.World.getPC();
	var arr = [];
	var cell = this._owner.map.at(this._coords);
	
	/* add cell */
	arr.push(cell);
	
	/* being? */
	var b = cell.getBeing();
	if (b) {
		arr.push(b);
		return arr;
	}
	
	/* items? */
	var i = cell.getItems();
	if (i.length) {
		arr.push(i[i.length-1]);
		return arr;
	}
	
	/* feature? */
	var f = cell.getFeature();
	if (f && f.knowsAbout(pc)) {
		arr.push(f);
		return arr;
	}
	
	return arr;
}

/**
 * Get a stack of cloned remembered objects
 */
RPG.Memory.Map.Cell.prototype._rememberedStack = function() {
	var pc = RPG.World.getPC();
	var arr = [];
	var cell = this._owner.map.at(this._coords);
	
	/* add cell */
	var c = cell.clone();
	c.setBeing(null);
	arr.push(c);
	
	/* items? */
	var i = cell.getItems();
	if (i.length) {
		arr.push(i[i.length-1].clone());
		return arr;
	}
	
	/* feature? */
	var f = cell.getFeature();
	if (f && f.knowsAbout(pc)) {
		arr.push(f.clone());
		return arr;
	}
	
	return arr;
}

/**
 * @class Trap memory
 * @augments RPG.Memory
 */ 
RPG.Memory.TrapMemory = OZ.Class().extend(RPG.Memory);

RPG.Memory.TrapMemory.prototype.init = function() {
	this._data = [];
}

RPG.Memory.TrapMemory.prototype.remember = function(trap) {
	if (this.remembers(trap)) { return; }
	this._data.push(trap);
}

RPG.Memory.TrapMemory.prototype.remembers = function(trap) {
	return this._data.indexOf(trap) != -1;
}
