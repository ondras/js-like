/**
 * Dungeon cell
 */
RPG.Cells.BaseCell = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Visual.DescriptionInterface)
						.implement(RPG.Misc.ModifierInterface);
RPG.Cells.BaseCell.prototype.init = function(level) {
	this._items = [];
	this._modifiers = [];
	this._being = null;
	this._level = null;
	this._flags = 0;
	this._coords = null;
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
RPG.Cells.BaseCell.prototype.setLevel = function(level, coords) {
	this._level = level;
	this._coords = coords;
}
RPG.Cells.BaseCell.prototype.getLevel = function() {
	return this._level;
}
RPG.Cells.BaseCell.prototype.setBeing = function(being) {
	this._being = being || null;
	if (being) { being.setCell(this); }
}
RPG.Cells.BaseCell.prototype.getBeing = function() {
	return this._being;
}
RPG.Cells.BaseCell.prototype.getCoords = function() {
	return this._coords;
}
RPG.Cells.BaseCell.prototype.isFree = function() {
	if (this._flags & RPG.CELL_BLOCKED) { return false; }
	if (this._being) { return false; }
	return true;
}

/**
 * Dungeon level
 */
RPG.Engine.Level = OZ.Class();
RPG.Engine.Level.prototype.init = function(size) {
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
RPG.Engine.Level.prototype.find = function(being) {
	for (var i=0;i<this.size.x;i++) {
		for (var j=0;j<this.size.y;j++) {
			var cell = this.data[i][j];
			if (cell.getBeing() == being) { return new RPG.Misc.Coords(i, j); } 
		}
	}
	throw new Error("Being not found");
}
RPG.Engine.Level.prototype.getBeings = function() {
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
 * Level size
 */
RPG.Engine.Level.prototype.getSize = function() {
	return this.size;
}
RPG.Engine.Level.prototype.setCell = function(coords, cell) {
	cell.setLevel(this, coords);
	this.data[coords.x][coords.y] = cell;
}
RPG.Engine.Level.prototype.at = function(coords) {
	return this.data[coords.x][coords.y];
}
RPG.Engine.Level.prototype.valid = function(coords) {
	var size = this.size;
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
RPG.Engine.Level.prototype.canSee = function(c1, c2) {
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
		if (this.at(current)._flags & RPG.CELL_BLOCKED) { return false; }
	}
	
	return true;
}
