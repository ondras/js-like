/**
 * @class Dungeon cell
 * @augments RPG.Misc.IModifier
 * @augments RPG.Visual.IVisual
 * @augments RPG.Misc.ISerializable
 */
RPG.Cells.BaseCell = OZ.Class()
						.implement(RPG.Visual.IVisual)
						.implement(RPG.Misc.IModifier)
						.implement(RPG.Misc.ISerializable);
RPG.Cells.BaseCell.prototype.init = function() {
	this._initVisuals();
	this._items = [];
	this._modifiers = {};
	this._being = null;
	this._feature = null;
	this._map = null;
	this._room = null;
	this._type = RPG.BLOCKS_NOTHING;
}

RPG.Cells.BaseCell.prototype.addItem = function(item) {
	item.mergeInto(this._items);
}

RPG.Cells.BaseCell.prototype.removeItem = function(item) {
	var index = this._items.indexOf(item);
	if (index == -1) { throw new Error("Item not found"); }
	this._items.splice(index, 1);
}

RPG.Cells.BaseCell.prototype.getItems = function() {
	return this._items;
}

RPG.Cells.BaseCell.prototype.setBeing = function(being) {
	this._being = being || null;
	if (being) { 
		being.setCell(this); 
		if (this._feature) { this._feature.notify(being); }
	}
}

RPG.Cells.BaseCell.prototype.getBeing = function() {
	return this._being;
}

RPG.Cells.BaseCell.prototype.setMap = function(map) {
	this._map = map;
}

RPG.Cells.BaseCell.prototype.getMap = function() {
	return this._map;
}

RPG.Cells.BaseCell.prototype.setCoords = function(coords) {
	this._coords = coords.clone();
}

RPG.Cells.BaseCell.prototype.getCoords = function() {
	return this._coords;
}

RPG.Cells.BaseCell.prototype.setFeature = function(feature) {
	this._feature = feature;
	if (feature) { feature.setCell(this); }
}

RPG.Cells.BaseCell.prototype.getFeature = function() {
	return this._feature;
}

RPG.Cells.BaseCell.prototype.setRoom = function(room) {
	this._room = room;
	return this;
}

RPG.Cells.BaseCell.prototype.getRoom = function() {
	return this._room;
}

/**
 * Can a being move to this cell?
 */
RPG.Cells.BaseCell.prototype.isFree = function() {
	if (this._being) { return false; }
	if (this._type >= RPG.BLOCKS_MOVEMENT) { return false; }
	if (this._feature) { return this._feature.isFree(); }
	return true;
}

/**
 * Can a being see through this cell?
 */
RPG.Cells.BaseCell.prototype.visibleThrough = function() {
	if (this._type >= RPG.BLOCKS_LIGHT) { return false; }
	if (this._feature) { return this._feature.visibleThrough(); }
	return true;
}

/**
 * @class Room, a logical group of cells
 * @augments RPG.Misc.IModifier
 * @param {RPG.Dungeon.Map} map
 * @param {RPG.Misc.Coords} corner1 top-left corner
 * @param {RPG.Misc.Coords} corner2 bottom-right corner
 */
RPG.Rooms.BaseRoom = OZ.Class().implement(RPG.Misc.IModifier);

RPG.Rooms.BaseRoom.prototype.init = function(map, corner1, corner2) {
	this._map = map;
	this._modifiers = {};
	this._corner1 = corner1.clone();
	this._corner2 = corner2.clone();
	this._type = null;
}

RPG.Rooms.BaseRoom.prototype.getCorner1 = function() {
	return this._corner1;
}

RPG.Rooms.BaseRoom.prototype.getCorner2 = function() {
	return this._corner2;
}

RPG.Rooms.BaseRoom.prototype.getCenter = function() {
	var x = Math.round((this._corner1.x + this._corner2.x)/2);
	var y = Math.round((this._corner1.y + this._corner2.y)/2);
	return new RPG.Misc.Coords(x, y);
}

RPG.Rooms.BaseRoom.prototype.setType = function(type) {
	this._type = type;
	return this;
}

RPG.Rooms.BaseRoom.prototype.getType = function(type) {
	return this._type;
}

/**
 * @class Dungeon feature
 * @augments RPG.Visual.IVisual
 * @augments RPG.Misc.ISerializable
 */
RPG.Features.BaseFeature = OZ.Class()
							.implement(RPG.Visual.IVisual)
							.implement(RPG.Misc.ISerializable);
RPG.Features.BaseFeature.prototype.init = function() {
	this._cell = null;
	this._initVisuals();
	this._type = RPG.BLOCKS_NOTHING;
}

RPG.Features.BaseFeature.prototype.knowsAbout = function(being) {
	return true;
}

RPG.Features.BaseFeature.prototype.setCell = function(cell) {
	this._cell = cell;
}

RPG.Features.BaseFeature.prototype.getCell = function() {
	return this._cell;
}

/**
 * Notify feature that a being came here
 * @param {RPG.Beings.BaseBeing} being
 */
RPG.Features.BaseFeature.prototype.notify = function(being) {
}

/**
 * Can a being move to this feature?
 */
RPG.Features.BaseFeature.prototype.isFree = function() {
	return (this._type < RPG.BLOCKS_MOVEMENT);
}

/**
 * Can a being see through this feature?
 */
RPG.Features.BaseFeature.prototype.visibleThrough = function() {
	return (this._type < RPG.BLOCKS_LIGHT);
}

/**
 * @class Dungeon map
 * @augments RPG.Misc.ISerializable
 */
RPG.Dungeon.Map = OZ.Class().implement(RPG.Misc.ISerializable);

/**
 * Factory method. Creates map from an array of arrays of bools.
 * false = corridor, true = wall
 */
RPG.Dungeon.Map.fromBitMap = function(id, bitMap, danger, cells) {
	var wall = cells.wall;
	var corridor = cells.corridor;
	
	var width = bitMap.length;
	var height = bitMap[0].length;
	
	var coords = new RPG.Misc.Coords(width, height);
	var map = new RPG.Dungeon.Map(id, coords, danger);
	
	for (var x=0;x<width;x++) { 
		for (var y=0;y<height;y++) {
			coords.x = x;
			coords.y = y;
			if (!bitMap[x][y]) {
				/* create corridor */
				var cell = new corridor();
				map.setCell(coords, cell);
				continue;
			}
			
			/* check neighbors; create wall only if there is at least one corridor neighbor */
			var ok = false;
			var neighbor = coords.clone();
			for (var i=-1;i<=1;i++) {
				for (var j=-1;j<=1;j++) {
					neighbor.x = coords.x + i;
					neighbor.y = coords.y + j;
					if (map.isValid(neighbor) && !bitMap[neighbor.x][neighbor.y]) { ok = true; }
				}
			}
			
			if (ok) {
				/* okay, create wall */
				var cell = new wall();
				map.setCell(coords, cell);
				continue;
			}
			
		}
	}

	return map;
}

RPG.Dungeon.Map.prototype.init = function(id, size, danger) {
	this._id = id;
	this._size = size.clone();
	this._data = [];
	this._rooms = [];
	this._danger = danger;

	for (var i=0;i<this._size.x;i++) {
		var col = [];
		for (var j=0;j<this._size.y;j++) {
			col.push(null);
		}
		this._data.push(col);
	}
}

RPG.Dungeon.Map.prototype.getId = function() {
	return this._id;
}

RPG.Dungeon.Map.prototype.getDanger = function() {
	return this._danger;
}

/**
 * Get all beings in this Map
 */ 
RPG.Dungeon.Map.prototype.getBeings = function() {
	var all = [];
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			var cell = this._data[i][j];
			if (!cell) { continue; }
			var b = cell.getBeing();
			if (b) { all.push(b); }
		}
	}
	return all;
}

/**
 * Map size
 */
RPG.Dungeon.Map.prototype.getSize = function() {
	return this._size;
}

RPG.Dungeon.Map.prototype.setCell = function(coords, cell) {
	this._data[coords.x][coords.y] = cell;
	cell.setCoords(coords);
	cell.setMap(this);
}

RPG.Dungeon.Map.prototype.at = function(coords) {
	return this._data[coords.x][coords.y];
}

RPG.Dungeon.Map.prototype.isValid = function(coords) {
	var size = this._size;
	if (Math.min(coords.x, coords.y) < 0) { return false; }
	if (coords.x >= size.x) { return false; }
	if (coords.y >= size.y) { return false; }
	return true;
}

/**
 * Return all features of a given type
 */
RPG.Dungeon.Map.prototype.getFeatures = function(ctor) {
	var arr = [];
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			var cell = this._data[i][j];
			if (!cell) { continue; }
			var f = cell.getFeature();
			if (f && f instanceof ctor) { arr.push(f); }
		}
	}
	return arr;
}

/**
 * Add a new room
 * @param {RPG.Misc.Coords} corner1
 * @param {RPG.Misc.Coords} corner2
 */
RPG.Dungeon.Map.prototype.addRoom = function(corner1, corner2) {
	var room = new RPG.Rooms.BaseRoom(this, corner1, corner2);
	this._rooms.push(room);
	this._assignRoom(corner1, corner2, room);
	return room;
}

/**
 * Replace old room with a new one. They must have the same position.
 */
RPG.Dungeon.Map.prototype.replaceRoom = function(oldRoom, newRoom) {
	var index = this._rooms.indexOf(oldRoom);
	if (index == -1) { throw new Error("Cannot find room"); }
	this._rooms[index] = newRoom;
	this._assignRoom(newRoom.getCorner1(), newRoom.getCorner2(), newRoom);
	
}

RPG.Dungeon.Map.prototype.removeRoom = function(room) {
	var index = this._rooms.indexOf(room);
	if (index == -1) { throw new Error("Cannot find room"); }
	this._rooms.splice(index, 1);
	this._assignRoom(room.getCorner1(), room.getCorner2(), null);
}


/**
 * Returns list of rooms in this map
 * @returns {RPG.Rooms.BaseRoom[]}
 */
RPG.Dungeon.Map.prototype.getRooms = function() {
	return this._rooms;
}

/**
 * Is it possible to see from one cell to another?
 * @param {RPG.Misc.Coords} c1
 * @param {RPG.Misc.Coords} c2
 * @returns {bool}
 */
RPG.Dungeon.Map.prototype.lineOfSight = function(c1, c2) {
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
	while (1) {
		current[major] += majorstep;
		error += delta;
		if (error + 0.001 > 0.5) {
			current[minor] += minorstep;
			error -= 1;
		}
		if (current[major] == c2[major]) { return true; }
		if (!this._data[current.x][current.y].visibleThrough()) { return false; }
	}
	
	return true;
}

RPG.Dungeon.Map.prototype.getFreeCell = function(noItems) {
	var all = [];
	var c = new RPG.Misc.Coords();
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			c.x = i;
			c.y = j;
			var cell = this._data[i][j];
			if (!cell) { continue; }
			if (!cell.isFree()) { continue; }
			if (cell.getFeature()) { continue; }
			if (noItems && cell.getItems().length) { continue; }
			all.push(cell);
		}
	}
	
	var index = Math.floor(Math.random()*all.length);
	return all[index];
}

RPG.Dungeon.Map.prototype.cellsInCircle = function(center, radius, includeInvalid) {
	var arr = [];
	var W = this._size.x;
	var H = this._size.y;
	var c = center.clone();
	c.x += radius;
	c.y += radius;
	
	var dirs = [RPG.N, RPG.W, RPG.S, RPG.E];
	
	var count = 8*radius;
	for (var i=0;i<count;i++) {
		if (c.x < 0 || c.y < 0 || c.x >= W || c.y >= H) {
			if (includeInvalid) { arr.push(false); }
		} else {
			arr.push(this._data[c.x][c.y]);
		}
		
		var dir = dirs[Math.floor(i*dirs.length/count)];
		c.plus(RPG.DIR[dir]);
	}
	return arr;
}

RPG.Dungeon.Map.prototype._assignRoom = function(corner1, corner2, room) {
	for (var i=corner1.x;i<=corner2.x;i++) {
		for (var j=corner1.y;j<=corner2.y;j++) {
			this._data[i][j].setRoom(room);
		}
	}
}

/**
 * @class Map decorator
 */
RPG.Decorators.BaseDecorator = OZ.Class();

RPG.Decorators.BaseDecorator.getInstance = function() {
	if (!this._instance) { this._instance = new this(); }
	return this._instance;
}
RPG.Decorators.BaseDecorator.prototype.decorate = function(map) {
	return this;
}

/**
 * Return number of free neighbors
 */
RPG.Decorators.BaseDecorator.prototype._freeNeighbors = function(map, center) {
	var result = 0;
	var cells = map.cellsInCircle(center, 1, false);
	for (var i=0;i<cells.length;i++) {
		if (cells[i] instanceof RPG.Cells.Corridor) { result++; }
	}
	return result;
}

/**
 * @class Map generator
 */
RPG.Generators.BaseGenerator = OZ.Class();

RPG.Generators.BaseGenerator.prototype.init = function(size, options) {
	this._options = {
		wall: RPG.Cells.Wall,
		corridor: RPG.Cells.Corridor
	}
	for (var p in options) { this._options[p] = options[p]; }
	
	this._size = size;
	this._bitMap = null;
	this._rooms = [];
}

RPG.Generators.BaseGenerator.prototype.generate = function(id, danger) {
	this._blankMap();
	return this._dig(id, danger);
}

RPG.Generators.BaseGenerator.prototype._dig = function(id, danger) {
	var map = RPG.Dungeon.Map.fromBitMap(id, this._bitMap, danger, this._options);
	for (var i=0;i<this._rooms.length;i++) {
		map.addRoom(this._rooms[i][0], this._rooms[i][1]);
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
	for (var i=0;i<this._size.x;i++) {
		this._bitMap.push([]);
		for (var j=0;j<this._size.y;j++) {
			this._bitMap[i].push(1);
		}
	}
}

RPG.Generators.BaseGenerator.prototype._digRoom = function(corner1, corner2) {
	this._rooms.push([corner1, corner2]);
	
	for (var i=corner1.x;i<=corner2.x;i++) {
		for (var j=corner1.y;j<=corner2.y;j++) {
			this._bitMap[i][j] = 0;
		}
	}
	
}

RPG.Generators.BaseGenerator.prototype._generateCoords = function(minSize) {
	var padding = 2 + minSize - 1;
	var x = Math.floor(Math.random()*(this._size.x-padding)) + 1;
	var y = Math.floor(Math.random()*(this._size.y-padding)) + 1;
	return new RPG.Misc.Coords(x, y);
}

RPG.Generators.BaseGenerator.prototype._generateSize = function(corner, minSize, maxWidth, maxHeight) {
	var availX = this._size.x - corner.x - minSize;
	var availY = this._size.y - corner.y - minSize;
	
	availX = Math.min(availX, maxWidth - this._minSize + 1);
	availY = Math.min(availY, maxHeight - this._minSize + 1);
	
	var x = Math.floor(Math.random()*availX) + minSize;
	var y = Math.floor(Math.random()*availY) + minSize;
	return new RPG.Misc.Coords(x, y);
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
