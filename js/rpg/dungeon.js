/**
 * @class Dungeon cell
 * @augments RPG.Misc.ModifierInterface
 * @augments RPG.Visual.VisualInterface
 */
RPG.Dungeon.BaseCell = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Misc.ModifierInterface);

RPG.Dungeon.BaseCell.prototype.init = function() {
	this._initVisuals();
	this._items = [];
	this._modifiers = [];
	this._being = null;
	this._feature = null;
	this.flags = 0;
}

RPG.Dungeon.BaseCell.prototype.addItem = function(item) {
	this._items.push(item);
}

RPG.Dungeon.BaseCell.prototype.removeItem = function(item) {
	var index = this._items.indexOf(item);
	if (index == -1) { throw new Error("Item not found"); }
	this._items.splice(index, 1);
}

RPG.Dungeon.BaseCell.prototype.getItems = function() {
	return this._items;
}

RPG.Dungeon.BaseCell.prototype.setBeing = function(being) {
	this._being = being || null;
}

RPG.Dungeon.BaseCell.prototype.getBeing = function() {
	return this._being;
}

RPG.Dungeon.BaseCell.prototype.setFeature = function(feature) {
	this._feature = feature;
}

RPG.Dungeon.BaseCell.prototype.getFeature = function() {
	return this._feature;
}

/**
 * Can a being move to this cell?
 */
RPG.Dungeon.BaseCell.prototype.isFree = function() {
	if (this._being) { return false; }
	if (this.flags & RPG.CELL_OBSTACLE) { return false; }
	if (this._feature && this._feature.flags & RPG.FEATURE_OBSTACLE) { return false; }
	return true;
}

/**
 * Can a being see through this cell?
 */
RPG.Dungeon.BaseCell.prototype.visibleThrough = function() {
	if (this.flags & RPG.CELL_SOLID) { return false; }
	if (this._feature && this._feature.flags & RPG.FEATURE_SOLID) { return false; }
	return true;
	return true;
}

/**
 * @class Room, a logical group of cells
 */
RPG.Dungeon.BaseRoom = OZ.Class();

/**
 * @param {RPG.Dungeon.Map} map
 * @param {RPG.Misc.Coords} corner1 top-left corner
 * @param {RPG.Misc.Coords} corner2 bottom-right corner
 */
RPG.Dungeon.BaseRoom.prototype.init = function(map, corner1, corner2) {
	this._map = map;
	this._corner1 = corner1.clone();
	this._corner2 = corner2.clone();
}

RPG.Dungeon.BaseRoom.prototype.getCorner1 = function() {
	return this._corner1;
}

RPG.Dungeon.BaseRoom.prototype.getCorner2 = function() {
	return this._corner2;
}

/**
 * @class Dungeon feature
 */
RPG.Dungeon.BaseFeature = OZ.Class()
							.implement(RPG.Visual.VisualInterface)

RPG.Dungeon.BaseFeature.prototype.init = function() {
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
RPG.Dungeon.Map.prototype.isFree = function(coords) {
	return this.at(coords).isFree();
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

RPG.Dungeon.Map.prototype.getFreeCoords = function() {
	var all = [];
	var c = new RPG.Misc.Coords();
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			c.x = i;
			c.y = j;
			var cell = this._data[i][j];
			if (cell.isFree() && !cell.getFeature() && cell.getItems().length == 0) { all.push(c.clone()); }
		}
	}
	
	var index = Math.floor(Math.random()*all.length);
	return all[index];
}
