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
 * @param {RPG.Dungeon.Map} map
 * @param {RPG.Misc.Coords} corner1 top-left corner
 * @param {RPG.Misc.Coords} corner2 bottom-right corner
 */
RPG.Rooms.BaseRoom = OZ.Class();

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

RPG.Rooms.BaseRoom.prototype.getCenter = function() {
	var x = Math.round((this._corner1.x + this._corner2.x)/2);
	var y = Math.round((this._corner1.y + this._corner2.y)/2);
	return new RPG.Misc.Coords(x, y);
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
RPG.Dungeon.Map.fromBitMap = function(id, bitMap, wall, corridor) {
	var width = bitMap.length;
	var height = bitMap[0].length;
	
	var coords = new RPG.Misc.Coords(width, height);
	var map = new RPG.Dungeon.Map(id, coords);
	
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

RPG.Dungeon.Map.prototype.init = function(id, size) {
	this._id = id;
	this._size = size.clone();
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

RPG.Dungeon.Map.prototype.getId = function() {
	return this._id;
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
			if (!cell) { continue; }
			if (!cell.isFree()) { continue; }
			if (cell.getFeature()) { continue; }
			if (noItems && cell.getItems().length) { continue; }
			all.push(c.clone());
		}
	}
	
	var index = Math.floor(Math.random()*all.length);
	return all[index];
}
