/**
 * @class Dungeon cell
 * @augments RPG.Misc.ModifierInterface
 * @augments RPG.Visual.DescriptionInterface
 * @augments RPG.Visual.VisualInterface
 */
RPG.Cells.BaseCell = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Visual.DescriptionInterface)
						.implement(RPG.Misc.ModifierInterface);
RPG.Cells.BaseCell.prototype.init = function() {
	this._items = [];
	this._modifiers = [];
	this._being = null;
	this._description = null;
	this._char = null;
	this._color = "gray";
	this._image = null;
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
/**
 * Can a being (move to / see through) this cell?
 */
RPG.Cells.BaseCell.prototype.isFree = function() {
	if (this.flags & RPG.CELL_BLOCKED) { return false; }
	if (this._being) { return false; }
	for (var i=0;i<this._items.length;i++) {
		var item = this._items[i];
		if (item.flags & RPG.ITEM_OBSTACLE) { return false; }
	}
	return true;
}
/**
 * @see RPG.Visual.DescriptionInterface#describe
 */
RPG.Cells.BaseCell.prototype.describe = function() {
	return this._description;
}
/**
 * @see RPG.Visual.VisualInterface#getColor
 */
RPG.Cells.BaseCell.prototype.getColor = function() {
	return this._color;
}
/**
 * @see RPG.Visual.VisualInterface#getChar
 */
RPG.Cells.BaseCell.prototype.getChar = function() {
	return this._char;
}
/**
 * @see RPG.Visual.VisualInterface#getImage
 */
RPG.Cells.BaseCell.prototype.getImage = function() {
	return this._image;
}
/**
 * Returns door at current cell, if present (false otherwise)
 */
RPG.Cells.BaseCell.prototype.getDoor = function() {
	for (var i=0;i<this._items.length;i++) {
		var item = this._items[i];
		if (item instanceof RPG.Items.Door) { return item; }
	}
	return false;
}

/**
 * @class Dungeon map
 */
RPG.Engine.Map = OZ.Class();
RPG.Engine.Map.prototype.init = function(size) {
	this._size = size;
	this._data = [];
	for (var i=0;i<this._size.x;i++) {
		var col = [];
		for (var j=0;j<this._size.y;j++) {
			col.push(null);
		}
		this._data.push(col);
	}
}
/**
 * Locate being
 */
RPG.Engine.Map.prototype.find = function(being) {
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			var cell = this._data[i][j];
			if (cell.getBeing() == being) { return new RPG.Misc.Coords(i, j); } 
		}
	}
	throw new Error("Being not found");
}
/**
 * Get all beings in this Map
 */ 
RPG.Engine.Map.prototype.getBeings = function() {
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
RPG.Engine.Map.prototype.getSize = function() {
	return this._size;
}
RPG.Engine.Map.prototype.setCell = function(coords, cell) {
	this._data[coords.x][coords.y] = cell;
}
RPG.Engine.Map.prototype.at = function(coords) {
	return this._data[coords.x][coords.y];
}
RPG.Engine.Map.prototype.setBeing = function(coords, being) {
	if (being) { 
		being.setMap(this);
		being.setCoords(coords); 
	}
	this.at(coords).setBeing(being);
}
RPG.Engine.Map.prototype.addItem = function(coords, item) {
	this.at(coords).addItem(item);
}
RPG.Engine.Map.prototype.isFree = function(coords) {
	return this.at(coords).isFree();
}
RPG.Engine.Map.prototype.isValid = function(coords) {
	var size = this._size;
	if (Math.min(coords.x, coords.y) < 0) { return false; }
	if (coords.x >= size.x) { return false; }
	if (coords.y >= size.y) { return false; }
	return true;
}

/**
 * Is it possible to see from one cell to another?
 * @param {RPG.Misc.Coords} c1
 * @param {RPG.Misc.Coords} c2
 * @returns {bool}
 */
RPG.Engine.Map.prototype.lineOfSight = function(c1, c2) {
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
		if (!this._data[current.x][current.y].isFree()) { return false; }
	}
	
	return true;
}

RPG.Engine.Map.prototype.getFreeCoords = function() {
	var all = [];
	var c = new RPG.Misc.Coords();
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			c.x = i;
			c.y = j;
			var cell = this._data[i][j];
			if (cell.isFree()) { all.push(c.clone()); }
		}
	}
	
	var index = Math.floor(Math.random()*all.length);
	return all[index];
}
