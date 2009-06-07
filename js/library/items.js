/**
 * @class Generic weapon
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Weapon = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Weapon.prototype.init = function(hit, damage) {
	this.parent();
	this._hit = new RPG.Feats.Hit(hit || 0);
	this._damage = new RPG.Feats.Hit(damage || 0);
}
RPG.Items.Weapon.prototype.getHit = function(modifierHolder) {
	return this._hit.modifiedValue(modifierHolder);
}
RPG.Items.Weapon.prototype.getDamage = function(modifierHolder) {
	return this._damage.modifiedValue(modifierHolder);
}
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

/**
 * @class Dagger
 * @augments RPG.Items.Weapon
 */
RPG.Items.Dagger = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Dagger.prototype.init = function() {
	this.parent(2, 0);
//	this.addModifier(RPG.Feats.Strength, RPG.MODIFIER_PLUS, 10);
}
RPG.Items.Dagger.prototype.describe = function(who) {
	return "dagger";
}
RPG.Items.Dagger.prototype.getImage = function(who) {
	return "dagger";
}
