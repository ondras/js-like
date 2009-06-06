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
 * Can a being move to this cell?
 */
RPG.Cells.BaseCell.prototype.isFree = function() {
	if (this.flags & RPG.CELL_BLOCKED) { return false; }
	if (this._being) { return false; }
	return true;
}
RPG.Cells.BaseCell.prototype.describe = function(who) {
	return this._description;
}

/**
 * @class Dungeon map
 */
RPG.Engine.Map = OZ.Class();
RPG.Engine.Map.prototype.init = function(size) {
	this.size = size;
	this.data = [];
	for (var i=0;i<this.size.x;i++) {
		var col = [];
		for (var j=0;j<this.size.y;j++) {
			col.push(null);
		}
		this.data.push(col);
	}
}
/**
 * Locate being
 */
RPG.Engine.Map.prototype.find = function(being) {
	for (var i=0;i<this.size.x;i++) {
		for (var j=0;j<this.size.y;j++) {
			var cell = this.data[i][j];
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
	for (var i=0;i<this.size.x;i++) {
		for (var j=0;j<this.size.y;j++) {
			var b = this.data[i][j].getBeing();
			if (b) { all.push(b); }
		}
	}
	return all;
}
/**
 * Map size
 */
RPG.Engine.Map.prototype.getSize = function() {
	return this.size;
}
RPG.Engine.Map.prototype.setCell = function(coords, cell) {
	this.data[coords.x][coords.y] = cell;
}
RPG.Engine.Map.prototype.at = function(coords) {
	return this.data[coords.x][coords.y];
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
RPG.Engine.Map.prototype.valid = function(coords) {
	var size = this.size;
	if (Math.min(coords.x, coords.y) < 0) { return false; }
	if (coords.x >= size.x) { return false; }
	if (coords.y >= size.y) { return false; }
	return true;
}
RPG.Engine.Map.prototype.isBlocked = function(coords) {
	return this.data[coords.x][coords.y].flags & RPG.CELL_BLOCKED;
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
		if (this.data[current.x][current.y].flags & RPG.CELL_BLOCKED) { return false; }
	}
	
	return true;
}
