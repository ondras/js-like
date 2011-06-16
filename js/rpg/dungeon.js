/**
 * @class Map cell
 * @augments RPG.Misc.IEnterable
 * @augments RPG.Visual.IVisual
 */
RPG.Cells.BaseCell = OZ.Class()
						.implement(RPG.Visual.IVisual)
						.implement(RPG.Misc.IEnterable);
RPG.Cells.BaseCell.visual = { path:"cells" };
RPG.Cells.BaseCell.prototype.init = function() {
	this._modifiers = {};
	this._blocks = RPG.BLOCKS_NOTHING;
	this._fake = false;
	this._cell = null;
	this._feature = null;
}

RPG.Cells.BaseCell.prototype.isFake = function() {
	return this._fake;
}

RPG.Cells.BaseCell.prototype.blocks = function(what) {
	return (this._blocks >= what);
}
/**
 * Called by map 
 */
RPG.Cells.BaseCell.prototype.hide = function(map, coords) {
	this._cell = map.getCell(coords);
	this._feature = map.getFeature(coords);
	map.setFeature(null, coords);
}

/**
 * Not called by map
 */
RPG.Cells.BaseCell.prototype.reveal = function(map, coords) {
	map.setCell(this._cell, coords);
	map.setFeature(this._feature, coords);
}

/**
 * @class Area, a logical subset of map
 * @augments RPG.Misc.IEnterable
 */
RPG.Areas.BaseArea = OZ.Class()
						.implement(RPG.Misc.IEnterable);

RPG.Areas.BaseArea.prototype.init = function() {
	this._map = null;
	this._modifiers = {};
	this._welcome = null;
}

/**
 * Area occupies all these coordinates
 * @returns {id[]} 
 */
RPG.Areas.BaseArea.prototype.getCoords = function() {
	return [];
}

RPG.Areas.BaseArea.prototype.setWelcome = function(text) {
	this._welcome = text;
	return this;
}

RPG.Areas.BaseArea.prototype.setMap = function(map) {
	this._map = map;
}

RPG.Areas.BaseArea.prototype.getMap = function() {
	return this._map;
}

/**
 * @see RPG.Misc.IEnterable#entering
 */
RPG.Areas.BaseArea.prototype.entering = function(being) {
	this.parent(being);
	if (this._welcome && being == RPG.Game.pc) { RPG.UI.buffer.message(this._welcome); }
}

/**
 * @class Room area
 * @augments RPG.Areas.BaseArea
 */
RPG.Areas.Room = OZ.Class().extend(RPG.Areas.BaseArea);

RPG.Areas.Room.prototype.init = function(corner1, corner2) {
	this.parent();
	this._corner1 = corner1.clone();
	this._corner2 = corner2.clone();
}

RPG.Areas.Room.prototype.getCorner1 = function() {
	return this._corner1;
}

RPG.Areas.Room.prototype.getCorner2 = function() {
	return this._corner2;
}

RPG.Areas.Room.prototype.getCenter = function() {
	var x = Math.round((this._corner1.x + this._corner2.x)/2);
	var y = Math.round((this._corner1.y + this._corner2.y)/2);
	return new RPG.Misc.Coords(x, y);
}

RPG.Areas.Room.prototype.getCoords = function() {
	var arr = [];
	for (var i=this._corner1.x; i<=this._corner2.x; i++) {
		for (var j=this._corner1.y; j<=this._corner2.y; j++) {
			arr.push(new RPG.Misc.Coords(i, j));
		}
	}
	return arr;
}

/**
 * @class Dungeon feature
 * @augments RPG.Visual.IVisual
 */
RPG.Features.BaseFeature = OZ.Class()
							.implement(RPG.Visual.IVisual)
							.implement(RPG.Misc.IEnterable);
RPG.Features.BaseFeature.visual = { path:"features" };
RPG.Features.BaseFeature.prototype.init = function() {
	this._coords = null;
	this._map = null;
	this._modifiers = {};
	this._blocks = RPG.BLOCKS_NOTHING;
}

RPG.Features.BaseFeature.prototype.setCoords = function(coords) {
	this._coords = coords.clone();
}

RPG.Features.BaseFeature.prototype.getCoords = function() {
	return this._coords;
}

RPG.Features.BaseFeature.prototype.setMap = function(map) {
	this._map = map;
}

RPG.Features.BaseFeature.prototype.getMap = function() {
	return this._map;
}

RPG.Features.BaseFeature.prototype.blocks = function(what) {
	return (this._blocks >= what);
}

/**
 * @class Dungeon map
 * @augments RPG.Misc.IEnterable
 */
RPG.Map = OZ.Class().implement(RPG.Misc.IEnterable);

RPG.Map.prototype.init = function(id, size, danger) {
	this._modifiers = {};
	this._id = id;
	this._welcome = "";
	this._sound = null;
	this._size = size.clone();
	this._danger = danger;
	this._cellTypes = [ /* 0 = default empty, 1 = default full */
		RPG.Cells.BaseCell,
		RPG.Cells.BaseCell
	];
	
	this._areas = [];
	this._areasByCoords = {};

	/* hashmaps */
	this._cells = {}; 
	this._beings = {}; 
	this._items = {}; 
	this._features = {}; 
	this._memory = {};
}
/*
RPG.Map.prototype.toJSON = function(handler) {
	var cache = {};
	var memory = {};
	for (var id in this._memory) {
		var m1 = this._memory[id];
		var m2 = {state:m1.state, data:[]};
		for (var i=0;i<m1.data.length;i++) {
			var visual = m1.data[i];
			var json = JSON.stringify(visual);
			if (json in cache) {
				m2.data.push(cache[json]);
			} else {
				m2.data.push(visual);
				cache[json] = id + "/" + i;
			}
		}
		memory[id] = m2;
	}
	return handler.toJSON(this, {exclude: "_memory", include:{_memory:memory}});
}

RPG.Map.prototype.revive = function() {
	var memory = {};
	for (var id in this._memory) {
		var m1 = this._memory[id];
		var m2 = {state:m1.state, data:[]};
		for (var i=0;i<m1.data.length;i++) {
			var visual = m1.data[i];
			if (typeof(visual) == "string") {
				var parts = visual.split("/");
				visual = this._memory[parts[0]].data[parts[1]];
			}
			m2.data.push(visual);
		}
		memory[id] = m2;
	}
	this._memory = memory;
}
*/
/**
 * Populates cells in this map based on an array of arrays of integers.
 * @param {int[][]} intMap
 */
RPG.Map.prototype.fromIntMap = function(intMap) {
	var w = intMap.length;
	var h = intMap[0].length;
	var tmpCells = [];

	/* first, create all cells */
	for (var i=0;i<w;i++) {
		tmpCells.push([]);
		for (var j=0;j<h;j++) {
			var cell = this._cellFromNumber(intMap[i][j]);
			tmpCells[i].push(cell);
		}
	}
	
	/* second, decide which should be included in this map */
	var coords = new RPG.Misc.Coords(0, 0);
	for (var x=0;x<w;x++) { 
		for (var y=0;y<h;y++) {
			coords.x = x;
			coords.y = y;
            var cell = tmpCells[x][y];

			/* passable section */
			if (!cell.blocks(RPG.BLOCKS_MOVEMENT)) {
				this.setCell(cell, coords);
				continue;
			}
			
			/* check neighbors; create nonpassable only if there is at least one passable neighbor */
			var ok = false;
			var neighbor = coords.clone();
			var minW = Math.max(0, x-1);
			var maxW = Math.min(w-1, x+1);
			var minH = Math.max(0, y-1);
			var maxH = Math.min(h-1, y+1);
			for (var i=minW;i<=maxW;i++) {
				for (var j=minH;j<=maxH;j++) {
					neighbor.x = i;
					neighbor.y = j;
					var neighborCell = tmpCells[i][j];
					if (!neighborCell.blocks(RPG.BLOCKS_MOVEMENT)) { ok = true; }
				}
			}
			
			if (ok) {
				this.setCell(cell, coords);
				continue;
			}
		}
	}
}

/**
 * @see RPG.Misc.IEnterable#entering
 */
RPG.Map.prototype.entering = function(being) {
	this.parent(being);
	if (being != RPG.Game.pc) { return; }
	
	if (this._sound) { RPG.UI.sound.playBackground(this._sound); }
	if (this._welcome) { RPG.UI.buffer.message(this._welcome); }
}

/**
 * @see RPG.Misc.IEnterable#leaving
 */
RPG.Map.prototype.leaving = function(being) {
	this.parent(being);
	if (being != RPG.Game.pc) { return; }

	for (var id in this._memory) {
		this._setMemory(id, RPG.MAP_REMEMBERED);
	}
}

/**
 * Every dungeon provides its default cell types, at least two
 * @returns {function[]}
 */
RPG.Map.prototype.getCellTypes = function() {
	return this._cellTypes;
}

RPG.Map.prototype.getID = function() {
	return this._id;
}

RPG.Map.prototype.getDanger = function() {
	return this._danger;
}

/**
 * Map size
 */
RPG.Map.prototype.getSize = function() {
	return this._size;
}

RPG.Map.prototype.setWelcome = function(text) {
	this._welcome = text;
	return this;
}

RPG.Map.prototype.setSound = function(sound) {
	this._sound = sound;
	return this;
}

RPG.Map.prototype.getSound = function() {
	return this._sound;
}

RPG.Map.prototype.getMemory = function(coords) {
	return this._memory[coords.x+","+coords.y];
}

RPG.Map.prototype.setMemory = function(coords, state) {
	this._setMemory(coords.x+","+coords.y, state);
}

RPG.Map.prototype._setMemory = function(id, state) {
	var m = {state:state, data:[]};
	this._memory[id] = m;
	
	if (state == RPG.MAP_UNKNOWN) { return; }
	m.data.push(this._cells[id]);
	
	if (this._beings[id] && state == RPG.MAP_VISIBLE) { /* being? */
		m.data.push(this._beings[id]);
	} else if (this._items[id] && this._items[id].length) {
		m.data.push(this._items[id][this._items[id].length-1]);
	} else if (this._features[id] && RPG.Game.pc.knowsFeature(this._features[id])) {
		m.data.push(this._features[id]);
	}
	
	/* convert to visuals */
	for (var i=0;i<m.data.length;i++) {
		m.data[i] = RPG.Visual.getVisual(m.data[i]);
	}
}

/**
 * Get all beings in this Map
 */ 
RPG.Map.prototype.getBeings = function() {
	var all = [];
	for (var hash in this._beings) { all.push(this._beings[hash]); }
	return all;
}

RPG.Map.prototype.getItems = function(coords) {
	return (this._items[coords.x+","+coords.y] || []);
}

RPG.Map.prototype.addItem = function(item, coords) {
	var id = coords.x+","+coords.y;
	if (!(id in this._items)) { this._items[id] = []; }
	item.mergeInto(this._items[id]);
}

RPG.Map.prototype.removeItem = function(item) {
	for (var hash in this._items) {
		var list = this._items[hash];
		var index = list.indexOf(item);
		if (index != -1) {
			list.splice(index, 1);
			if (!list.length) { delete this._items[hash]; }
			return;
		}
	}
	throw new Error("Cannot remove item '"+item+"'");
}

RPG.Map.prototype.getFeature = function(coords) {
	return this._features[coords.x+","+coords.y];
}

RPG.Map.prototype.setFeature = function(feature, coords) {
	var id = coords.x+","+coords.y;
	if (feature) {
		this._features[id] = feature;
		feature.setMap(this);
		feature.setCoords(coords);
	} else if (this._features[id]) {
		delete this._features[id];
	}
}

RPG.Map.prototype.getBeing = function(coords) {
	return this._beings[coords.x+","+coords.y];
}

RPG.Map.prototype.setBeing = function(being, coords, ignoreOldPosition) {
	var id = coords.x+","+coords.y;
	if (!being) { /* just remove being. it should be here. */
		var b = this._beings[id];
		if (b) {
			this.leaving(b);
			delete this._beings[id];
		}
		return;
	}
	
	var oldCoords = being.getCoords();
	var newCoords = coords;
	var oldMap = being.getMap();
	var newMap = this;
	var oldArea = (oldMap ? oldMap.getArea(oldCoords) : null);
	var newArea = this.getArea(newCoords);
	var oldCell = (oldMap ? oldMap.getCell(oldCoords) : null);
	var newCell = this.getCell(newCoords);
	var oldFeature = (oldMap ? oldMap.getFeature(oldCoords) : null);
	var newFeature = this.getFeature(newCoords);
	
	if (oldMap != newMap) { /* map change */
		if (oldMap) { oldMap.leaving(being); }
		this.entering(being);
		being.setMap(this);
	} else if (!ignoreOldPosition) { /* same map - remove being from old coords */
		delete this._beings[oldCoords.x+","+oldCoords.y];
	}
	
	if (oldArea != newArea) { /* area change */
		if (oldArea) { oldArea.leaving(being); }
		if (newArea) { newArea.entering(being); }
	}
	
	if (oldCell != newCell) { /* cell change */
		if (oldCell) { oldCell.leaving(being); }
		newCell.entering(being);
	}

	if (oldFeature != newFeature) { /* feature change */
		if (oldFeature) { oldFeature.leaving(being); }
		if (newFeature) { newFeature.entering(being); }
	}

	this._beings[id] = being;
	being.setCoords(coords);
}
	
RPG.Map.prototype.getCell = function(coords) {
	return this._cells[coords.x+","+coords.y];
}

RPG.Map.prototype.setCell = function(cell, coords) {
	var id = coords.x+","+coords.y;
	if (cell) {
		if (cell.isFake()) { cell.hide(this, coords); }
		this._cells[id] = cell;
	} else if (this._cells[id]) {
		delete this._cells[id];
	}
}

RPG.Map.prototype.isValid = function(coords) {
	if (Math.min(coords.x, coords.y) < 0) { return false; }
	if (coords.x >= this._size.x) { return false; }
	if (coords.y >= this._size.y) { return false; }
	return true;
}

/**
 * Return all features of a given type
 */
RPG.Map.prototype.getFeatures = function(ctor) {
	var arr = [];
	for (var id in this._features) {
		var f = this._features[id];
		if (f && f instanceof ctor) { arr.push(f); }
	}
	return arr;
}

/**
 * Add a new area. Areas may NOT overlap.
 * @param {RPG.Areas.BaseArea} area
 */
RPG.Map.prototype.addArea = function(area) {
	this._areas.push(area);
	area.setMap(this);
	var coords = area.getCoords();
	for (var i=0;i<coords.length;i++) {
		var id = coords[i].x+","+coords[i].y;
		this._areasByCoords[id] = area;
	}
}

/**
 * Returns list of rooms in this map
 * @returns {RPG.Areas.BaseArea[]}
 */
RPG.Map.prototype.getAreas = function() {
	return this._areas;
}

/**
 * Get area containing these coordinates
 */
RPG.Map.prototype.getArea = function(coords) {
	return this._areasByCoords[coords.x+","+coords.y];
}

RPG.Map.prototype.getFreeCoords = function(noItems) {
	var all = [];
	var c = new RPG.Misc.Coords();
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			c.x = i;
			c.y = j;
			var id = c.x+","+c.y;
			if (!(id in this._cells)) { continue; }
			if (id in this._features) { continue; }
			
			if (this.blocks(RPG.BLOCKS_MOVEMENT, c)) { continue; }
			
			var items = this._items[id];
			if (noItems && items && items.length) { continue; }
			
			all.push(c.clone());
		}
	}
	
	return all.random();
}

/**
 * Return array of coords forming a "circle", e.g. having constant radius from a center point
 * @param {RPG.Misc.Coords} center
 * @param {int} radius
 * @param {bool} includeInvalid Include "null" value where a cell does not exist?
 * @returns {RPG.Misc.Coords[]}
 */
RPG.Map.prototype.getCoordsInCircle = function(center, radius, includeInvalid) {
	var arr = [];
	var W = this._size.x;
	var H = this._size.y;
	var c = center.clone().plus(new RPG.Misc.Coords(radius, radius));
	
	var dirs = [RPG.N, RPG.W, RPG.S, RPG.E];
	
	var count = 8*radius;
	for (var i=0;i<count;i++) {
		if (c.x < 0 || c.y < 0 || c.x >= W || c.y >= H) {
			if (includeInvalid) { arr.push(null); }
		} else {
			if (this._cells[c.x+","+c.y]) {
				arr.push(c.clone());
			} else if (includeInvalid) {
				arr.push(null);
			}
		}
		
		var dir = dirs[Math.floor(i*dirs.length/count)];
		c.plus(RPG.DIR[dir]);
	}
	return arr;
}

/**
 * Line connecting two coords
 * @param {RPG.Misc.Coords} c1
 * @param {RPG.Misc.Coords} c2
 * @returns {RPG.Misc.Coords[]}
 */
RPG.Map.prototype.getCoordsInLine = function(c1, c2) {
	var result = [c1.clone()];
	
	var dx = c2.x-c1.x;
	var dy = c2.y-c1.y;
	if (Math.abs(dx) > Math.abs(dy)) {
		var major = "x";
		var minor = "y";
		var majorstep = dx > 0 ? 1 : -1;
		var minorstep = dy > 0 ? 1 : -1;
		var delta = Math.abs(dy/dx);
	} else {
		var major = "y";
		var minor = "x";
		var majorstep = dy > 0 ? 1 : -1;
		var minorstep = dx > 0 ? 1 : -1;
		var delta = Math.abs(dx/dy);
	}
	var error = 0;
	var current = c1.clone();
	while (current[major] != c2[major]) {
		current[major] += majorstep;
		error += delta;
		if (error + 0.001 > 0.5) {
			current[minor] += minorstep;
			error -= 1;
		}
		result.push(current.clone());
	}
	
	return result;
}

/**
 * Returns coords in a flood-filled area
 * @param {RPG.Misc.Coords} center
 * @param {int} radius
 */
RPG.Map.prototype.getCoordsInArea = function(center, radius) {
	var result = [];
	
	function go(x, depth) {
		var index = -1;
		for (var i=0;i<result.length;i++) {
			var item = result[i];
			if (!item[0].equals(x)) { continue; }
			if (item[1] <= depth) { 
				return; /* we have this one with better depth */
			} else {
				index = i;
			}
		}
		
		if (index == -1) {
			result.push([x, depth]); /* new node */
			if (depth == radius) { return; }
		} else {
			result[0][1] = depth; /* we had this one with worse depth */
		}
		
		/* check neighbors */
		for (var i=0;i<8;i++) {
			var n = x.neighbor(i);
			if (!n) { continue; }
			if (this.blocks(RPG.BLOCKS_LIGHT, n)) { continue; }
			arguments.callee.call(this, n, depth+1);
		}
		
	}
	
	go.call(this, center, 0);
	
	var arr = [];
	for (var i=0;i<result.length;i++) {
		arr.push(result[i][0]);
	}
	
	return arr;
}

/**
 * Returns first free coords closest to a coordinate
 * @param {RPG.Misc.Coords} center
 * @param {int} max radius
 */
RPG.Map.prototype.getClosestRandomFreeCoords = function(center, radius) {
	var sx = this._size.x;
	var sy = this._size.y;
	var max = radius * radius || (sx * sx + sy * sy);

	var coords = false;
	var r = 0;

	while (!coords && (r * r) < max) {
		var candidates = this.getCoordsInCircle(center, r, false);
		var avail = [];

		for (var j=0;j<candidates.length;j++) {
			var c = candidates[j];
			if (!this.blocks(RPG.BLOCKS_MOVEMENT, c)) { avail.push(c); }
		}

		if (avail.length) { coords = avail.random(); }

		r++;
	}

	return coords;
}

/**
 * Returns two free coords located in opposite corners
 */
RPG.Map.prototype.getCoordsInTwoCorners = function() {
	var corners = this._getCorners();

	var i1 = Math.floor(Math.random()*corners.length);
	var i2 = (i1+2) % corners.length;
	var indexes = [i1, i2];
	var result = [];

	for (var i=0;i<indexes.length;i++) {
		var center = corners[indexes[i]];
		var coords = this.getClosestRandomFreeCoords(center);
		if (coords) { result.push(coords) }
	}

	return result;
}

/**
 * Returns free coords most distant to a given coords
 * @param {RPG.Misc.Coords} coords Source, we want to get as far as possible
 */
RPG.Map.prototype.getFurthestFreeCoords = function(coords) {
	var corners = this._getCorners();

	/* find most distant corner */
	var max = -Infinity;
	var c = false;

	for (var i=0;i<corners.length;i++) {
		var corner = corners[i];
		var d = coords.distance(corner);
		if (d > max) { c = corner; max = d; }
	}

	return this.getClosestRandomFreeCoords(c);
}


RPG.Map.prototype.blocks = function(what, coords) {
	var id = coords.x+","+coords.y;

	var c = this._cells[id];
	if (!c) { return true; }
	if (c.blocks(what)) { return true; }

	if (this._beings[id] && what == RPG.BLOCKS_MOVEMENT) { return true; }
	if (this._features[id] && this._features[id].blocks(what)) { return true; }

	return false;
}

RPG.Map.prototype._cellFromNumber = function(celltype) {
    return RPG.Factories.cells.get(this._cellTypes[celltype]);
}

/**
 * Returns map corner coordinates
 * @returns {RPG.Misc.Coords[]}
 */
RPG.Map.prototype._getCorners = function() {
	return [
		new RPG.Misc.Coords(0, 0),
		new RPG.Misc.Coords(this._size.x-1, 0),
		new RPG.Misc.Coords(this._size.x-1, this._size.y-1),
		new RPG.Misc.Coords(0, this._size.y-1)
	];
}

/**
 * @class Dungeon map
 * @augments RPG.Map
 */
RPG.Map.Dungeon = OZ.Class().extend(RPG.Map);

RPG.Map.Dungeon.prototype.init = function(id, size, danger) {
	this.parent(id, size, danger);
	this._cellTypes[0] = RPG.Cells.Corridor;
	this._cellTypes[1] = RPG.Cells.Wall;
	this._rooms = [];
}

RPG.Map.Dungeon.prototype.addRoom = function(room) {
	this._rooms.push(room);
	this.addArea(room);
}

RPG.Map.Dungeon.prototype.getRooms = function() {
	return this._rooms;
}

/**
 * @class Village map
 * @augments RPG.Map
 */
RPG.Map.Village = OZ.Class().extend(RPG.Map);

RPG.Map.Village.prototype.init = function(id, size, danger) {
	this.parent(id, size, danger);
	this._cellTypes[0] = RPG.Cells.Grass;
	this._cellTypes[1] = RPG.Cells.Wall;
}

/**
 * @class Map decorator
 */
RPG.Decorators.BaseDecorator = OZ.Singleton();

RPG.Decorators.BaseDecorator.prototype.decorate = function(map) {
	return this;
}

/**
 * Return number of free neighbors
 */
RPG.Decorators.BaseDecorator.prototype._freeNeighbors = function(map, center) {
	var result = 0;
	var coords = map.getCoordsInCircle(center, 1, false);
	for (var i=0;i<coords.length;i++) {
		if (!map.blocks(RPG.BLOCKS_MOVEMENT, coords[i])) { result++; }
	}
	return result;
}

/**
 * @class Map generator
 */
RPG.Generators.BaseGenerator = OZ.Class();

RPG.Generators.BaseGenerator.prototype.init = function(size) {
	this._size = size;

	this._dug = 0;
	this._bitMap = null;
	this._rooms = [];
}

RPG.Generators.BaseGenerator.prototype.generate = function(id, danger) {
	this._blankMap();
	return this._convertToMap(id, danger);
}

RPG.Generators.BaseGenerator.prototype._convertToMap = function(id, danger) {
	var map = new RPG.Map.Dungeon(id, this._size, danger);
	map.fromIntMap(this._bitMap);
	
	for (var i=0;i<this._rooms.length;i++) {
		map.addRoom(this._rooms[i]);
	}
	this._bitMap = null;
	return map;
}

RPG.Generators.BaseGenerator.prototype._isValid = function(coords) {
	if (coords.x < 0 || coords.y < 0) { return false; }
	if (coords.x >= this._size.x || coords.y >= this._size.y) { return false; }
	return true;
}

/**
 * Return number of free neighbors
 */
RPG.Generators.BaseGenerator.prototype._freeNeighbors = function(center) {
	var result = 0;
	for (var i=-1;i<=1;i++) {
		for (var j=-1;j<=1;j++) {
			if (!i && !j) { continue; }
			var coords = new RPG.Misc.Coords(i, j).plus(center);
			if (!this._isValid(coords)) { continue; }
			if (!this._bitMap[coords.x][coords.y]) { result++; }
		}
	}
	return result;
}

RPG.Generators.BaseGenerator.prototype._blankMap = function() {
	this._rooms = [];
	this._bitMap = [];
	this._dug = 0;
	
	for (var i=0;i<this._size.x;i++) {
		this._bitMap.push([]);
		for (var j=0;j<this._size.y;j++) {
			this._bitMap[i].push(1);
		}
	}
}

RPG.Generators.BaseGenerator.prototype._digRoom = function(corner1, corner2) {
	var room = new RPG.Areas.Room(corner1, corner2);
	this._rooms.push(room);
	
	for (var i=corner1.x;i<=corner2.x;i++) {
		for (var j=corner1.y;j<=corner2.y;j++) {
			this._bitMap[i][j] = 0;
		}
	}
	
	this._dug += (corner2.x-corner1.x) * (corner2.y-corner1.y);
	return room;
}

/**
 * Randomly picked coords. Can represent top-left corner of a room minSize*minSize
 * @param {int} minSize
 */
RPG.Generators.BaseGenerator.prototype._generateCoords = function(minSize) {
	var padding = 2 + minSize - 1;
	var x = Math.floor(Math.random()*(this._size.x-padding)) + 1;
	var y = Math.floor(Math.random()*(this._size.y-padding)) + 1;
	return new RPG.Misc.Coords(x, y);
}

/**
 * Randomly picked bottom-right corner
 * @param {RPG.Misc.Coords} corner top-left corner
 * @param {int} minSize
 * @param {int} maxWidth
 * @param {int} maxHeight
 * FIXME does it really work right?
 */
RPG.Generators.BaseGenerator.prototype._generateSecondCorner = function(corner, minSize, maxWidth, maxHeight) {
	var availX = this._size.x - corner.x - minSize;
	var availY = this._size.y - corner.y - minSize;
	
	availX = Math.min(availX, maxWidth - minSize + 1);
	availY = Math.min(availY, maxHeight - minSize + 1);
	
	var x = Math.floor(Math.random()*availX) + minSize;
	var y = Math.floor(Math.random()*availY) + minSize;
	return new RPG.Misc.Coords(corner.x + x - 1, corner.y + y - 1);
}

/**
 * Can a given rectangle fit in a map?
 */
RPG.Generators.BaseGenerator.prototype._freeSpace = function(corner1, corner2) {
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=corner1.x; i<=corner2.x; i++) {
		for (var j=corner1.y; j<=corner2.y; j++) {
			c.x = i;
			c.y = j;
			if (!this._isValid(c)) { return false; }
			if (!this._bitMap[i][j]) { return false; }
		}
	}
	return true;
}
