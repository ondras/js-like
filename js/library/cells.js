RPG.Cells.Corridor = OZ.Class().extend(RPG.Cells.BaseCell);
RPG.Cells.Corridor.prototype.init = function() {
	this.parent();
	this._description = "floor section";
}
RPG.Cells.Corridor.prototype.getChar = function(who) {
	var ch = this.parent(who);
	ch.setChar(".");
	return ch;
}
RPG.Cells.Corridor.prototype.getImage = function(who) {
	return "corridor";
}

RPG.Cells.Wall = OZ.Class().extend(RPG.Cells.BaseCell);
RPG.Cells.Wall.prototype.init = function() {
	this.parent();
	this._description = "solid wall";
	this.flags = RPG.CELL_BLOCKED;
}
RPG.Cells.Wall.prototype.getChar = function(who) {
	var ch = this.parent(who);
	ch.setChar("#");
	return ch;
}
RPG.Cells.Wall.prototype.getImage = function(who) {
	return "wall";
}
