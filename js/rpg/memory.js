RPG.Memory._maps = {};
RPG.Memory._current = null;

RPG.Memory.setMap = function(map) {
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
	this.updateMapComplete();
}

RPG.Memory.updateMapComplete = function() {
	this._current.load();
	this._current.updateVisible();
}

RPG.Memory.updateMapCoords = function(coords) {
	this._current.updateCoords(coords);
}

RPG.Memory.updateMapVisible = function() {
	this._current.updateVisible();
}

RPG.Memory.forgetMap = function() {
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
	this._size = null;
}

RPG.Memory.Map.prototype.setup = function(map) {
	this._map = map;
	this._data = [];
	var size = map.getSize();
	var c = new RPG.Misc.Coords();
	for (var i=0;i<size.x;i++) {
		this._data.push([]);
		for (var j=0;j<size.y;j++) {
			c.x = i;
			c.y = j;
			var cell = new RPG.Memory.Map.Cell();
			cell.setup(this._map, c);
			this._data[i].push(cell);
		}
	}
}

/**
 * The game states that these coordinates have changed and we need to update them
 * @param {RPG.Misc.Coords} coords
 */
RPG.Memory.Map.prototype.updateCoords = function(coords) {
	this._data[coords.x][coords.y].update();
	var pc = RPG.World.getPC();
}

/**
 * Visible area has changed - need to refresh whole map subset 
 */
RPG.Memory.Map.prototype.updateVisible = function() {
	var pc = RPG.World.getPC();
	var size = this._map.getSize();
	var coords = RPG.World.getPC().getCell().getCoords();
	var dist = pc.sightDistance();
	
	var minX = Math.max(0, coords.x - dist);
	var maxX = Math.min(size.x-1, coords.x + dist);
	var minY = Math.max(0, coords.y - dist);
	var maxY = Math.min(size.y-1, coords.y + dist);
	
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=0; i<size.x; i++) {
		for (var j=0; j<size.y; j++) {
			var tooFar = (i < minX || i > maxX || j < minY || j > maxY);
			this._data[i][j].update(tooFar);
		}
	}
}

/**
 * Memorize what is available, we are leaving this map
 */
RPG.Memory.Map.prototype.save = function() {
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
	var size = this._map.getSize();
	RPG.UI.resize(size);
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
	this._state = null;
	this._map = null;
	this._visible = [];
	this._remembered = [];
}
RPG.Memory.Map.Cell.prototype.setup = function(map, coords) {
	this._map = map;
	this._coords = coords.clone();
	this._state = RPG.MAP_UNKNOWN;
}

/**
 * Update cell's status from the actual map
 */
RPG.Memory.Map.Cell.prototype.update = function(isTooFar) {
	if (!isTooFar) {
		var pc = RPG.World.getPC();
		isTooFar = !pc.canSee(this._coords);
	}
	if (!isTooFar) {
		this.setState(RPG.MAP_VISIBLE);
	} else if (this._state == RPG.MAP_VISIBLE) {
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
			this._visible = stack;
			RPG.UI.redrawCoords(this._coords, this._visible, false);
		break;
		
		case RPG.MAP_REMEMBERED:
			/* clone everything into memory */
			this.save();
			RPG.UI.redrawCoords(this._coords, this._remembered, true);
		break;
		
		case RPG.MAP_UNKNOWN:
			/* completely erase memory cell */
			this._visible = [];
			this._remembered = [];
			RPG.UI.redrawCoords(this._coords, [], false);
		break;
	}

	this._state = state;
}

RPG.Memory.Map.Cell.prototype.save = function() {
	if (this._state != RPG.MAP_VISIBLE) { return; }
	this._state = RPG.MAP_REMEMBERED;
	this._remembered = this._rememberedStack();
	this._visible = [];
}

RPG.Memory.Map.Cell.prototype.load = function() {
	switch (this._state) {
		case RPG.MAP_VISIBLE:
			RPG.UI.redrawCoords(this._coords, this._visible, false);
		break;
		
		case RPG.MAP_REMEMBERED:
			RPG.UI.redrawCoords(this._coords, this._remembered, true);
		break;

		case RPG.MAP_UNKNOWN:
			RPG.UI.redrawCoords(this._coords, [], false);
		break;
	}
}

/**
 * Get a stack of visible objects, typically a cell [+ something]
 */
RPG.Memory.Map.Cell.prototype._visibleStack = function() {
	var arr = [];
	var cell = this._map.at(this._coords);
	
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
	if (f) {
		arr.push(f);
		return arr;
	}
	
	return arr;
}

/**
 * Get a stack of cloned remembered objects
 */
RPG.Memory.Map.Cell.prototype._rememberedStack = function() {
	var arr = [];
	var cell = this._map.at(this._coords);
	
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
	if (f) {
		arr.push(f.clone());
		return arr;
	}
	
	return arr;
}
