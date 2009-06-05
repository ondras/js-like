RPG.Cells.Corridor = OZ.Class().extend(RPG.Cells.BaseCell);
RPG.Cells.Corridor.prototype.describe = function(who) {
	return "corridor";
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
	this.flags = RPG.CELL_BLOCKED;
}
RPG.Cells.Wall.prototype.describe = function(who) {
	return "wall";
}
RPG.Cells.Wall.prototype.getChar = function(who) {
	var ch = this.parent(who);
	ch.setChar("#");
	return ch;
}
RPG.Cells.Wall.prototype.getImage = function(who) {
	return "wall";
}

RPG.Items.Weapon = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Weapon.prototype.describe = function(who) {
	return "weapon";
}
RPG.Items.Weapon.prototype.getChar = function(who) {
	var ch = this.parent(who);
	ch.setChar(")");
	return ch;
}
RPG.Items.Weapon.prototype.getImage = function(who) {
	return "weapon";
}

RPG.Items.Dagger = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Dagger.prototype.init = function() {
	this.parent();
	this.addModifier(RPG.Feats.Strength, RPG.MODIFIER_PLUS, 10);
}
RPG.Items.Dagger.prototype.describe = function(who) {
	return "dagger";
}
RPG.Items.Dagger.prototype.getImage = function(who) {
	return "dagger";
}
