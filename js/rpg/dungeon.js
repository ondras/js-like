/**
 * @class Dungeon cell
 * @augments RPG.Misc.ModifierInterface
 * @augments RPG.Visual.VisualInterface
 */
RPG.Cells.BaseCell = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Misc.ModifierInterface);

RPG.Cells.BaseCell.prototype.init = function() {
	this._initVisuals();
	this._items = [];
	this._modifiers = [];
	this._being = null;
	this._feature = null;
	this.flags = 0;
}

RPG.Cells.BaseCell.prototype.addItem = function(item) {
	this._items.push(item);
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
}

RPG.Cells.BaseCell.prototype.getBeing = function() {
	return this._being;
}

RPG.Cells.BaseCell.prototype.setFeature = function(feature) {
	this._feature = feature;
}

RPG.Cells.BaseCell.prototype.getFeature = function() {
	return this._feature;
}

/**
 * Can a being move to this cell?
 */
RPG.Cells.BaseCell.prototype.isFree = function() {
	if (this._being) { return false; }
	if (this.flags & RPG.CELL_OBSTACLE) { return false; }
	if (this._feature && this._feature.flags & RPG.FEATURE_OBSTACLE) { return false; }
	return true;
}

/**
 * Can a being see through this cell?
 */
RPG.Cells.BaseCell.prototype.visibleThrough = function() {
	if (this.flags & RPG.CELL_SOLID) { return false; }
	if (this._feature && this._feature.flags & RPG.FEATURE_SOLID) { return false; }
	return true;
}

/**
 * @class Room, a logical group of cells
 */
RPG.Rooms.BaseRoom = OZ.Class();

/**
 * @param {RPG.Dungeon.Map} map
 * @param {RPG.Misc.Coords} corner1 top-left corner
 * @param {RPG.Misc.Coords} corner2 bottom-right corner
 */
RPG.Rooms.BaseRoom.prototype.init = function(map, corner1, corner2) {
	this._map = map;
	this._corner1 = corner1.clone();
	this._corner2 = corner2.clone();
}

RPG.Rooms.BaseRoom.prototype.getCorner1 = function() {
	return this._corner1;
}

RPG.Rooms.BaseRoom.prototype.getCorner2 = function() {
	return this._corner2;
}

/**
 * @class Dungeon feature
 */
RPG.Features.BaseFeature = OZ.Class()
							.implement(RPG.Visual.VisualInterface)
RPG.Features.BaseFeature.prototype.init = function(coords) {
	this._coords = coords.clone();
	this._initVisuals();
	this.flags = 0;
}


/**
 * @class Dungeon map
 */
RPG.Dungeon.Map = OZ.Class();
RPG.Dungeon.Map.prototype.init = function(size) {
	this._size = size;
	this._data = [];
	this._rooms = [];
	
	for (var i=0;i<this._size.x;i++) {
		var col = [];
		for (var j=0;j<this._size.y;j++) {
			col.push(null);
		}
		this._data.push(col);
	}
}

/**
 * Get all beings in this Map
 */ 
RPG.Dungeon.Map.prototype.getBeings = function() {
	var all = [];
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			var b = this._data[i][j].getBeing();
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
}
RPG.Dungeon.Map.prototype.at = function(coords) {
	return this._data[coords.x][coords.y];
}
RPG.Dungeon.Map.prototype.setBeing = function(coords, being) {
	if (being) { 
		being.setMap(this);
		being.setCoords(coords); 
	}
	this.at(coords).setBeing(being);
}
RPG.Dungeon.Map.prototype.addItem = function(coords, item) {
	this.at(coords).addItem(item);
}
RPG.Dungeon.Map.prototype.isValid = function(coords) {
	var size = this._size;
	if (Math.min(coords.x, coords.y) < 0) { return false; }
	if (coords.x >= size.x) { return false; }
	if (coords.y >= size.y) { return false; }
	return true;
}

/**
 * Add a new room
 * @param {function} ctor
 * @param {RPG.Misc.Coords} corner1
 * @param {RPG.Misc.Coords} corner2
 */
RPG.Dungeon.Map.prototype.addRoom = function(ctor, corner1, corner2) {
	var room = new ctor(this, corner1, corner2);
	this._rooms.push(room);
	return room;
}

/**
 * Returns list of rooms in this map
 * @returns {RPG.Dungeon.Room[]}
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

RPG.Dungeon.Map.prototype.getFreeCoords = function(noItems) {
	var all = [];
	var c = new RPG.Misc.Coords();
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			c.x = i;
			c.y = j;
			var cell = this._data[i][j];
			if (!cell.isFree()) { continue; }
			if (cell.getFeature()) { continue; }
			if (noItems && cell.getItems().length) { continue; }
			all.push(c.clone());
		}
	}
	
	var index = Math.floor(Math.random()*all.length);
	return all[index];
}
