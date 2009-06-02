/**
 * Dungeon cell
 */
RPG.Cells.BaseCell = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Visual.DescriptionInterface)
						.implement(RPG.Misc.ModifierInterface);
RPG.Cells.BaseCell.prototype.init = function() {
	this._items = [];
	this._modifiers = [];
	this._being = null;
	this._flags = 0;
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
	var max = 3*Math.max(Math.abs(dx), Math.abs(dy));
	for (var i=1;i<max-1;i++) {
		var stepx = i*dx/max;
		var stepy = i*dy/max;
		var x = c1.x + stepx;
		var y = c1.y + stepy;
		var c = new RPG.Misc.Coords(Math.round(x), Math.round(y));
		if (this.at(c)._flags & RPG.CELL_BLOCKED) { return false; }
	}
	
	return true;
}
