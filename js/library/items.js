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
RPG.Items.Weapon.prototype.describe = function() {
	return "weapon";
}
RPG.Items.Weapon.prototype.getChar = function() {
	return ")";
}
RPG.Items.Weapon.prototype.getImage = function() {
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
RPG.Items.Dagger.prototype.describe = function() {
	return "dagger";
}
RPG.Items.Dagger.prototype.getImage = function() {
	return "dagger";
}

/**
 * @class Anything that can be eaten
 */
RPG.Items.Edible = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Edible.prototype.init = function() {
	this.parent();
	this.flags |= RPG.ITEM_EDIBLE;
	this._char = "%";
}

RPG.Items.Corpse = OZ.Class().extend(RPG.Items.Edible);
RPG.Items.Corpse.prototype.init = function(being) {
	this.parent();
	this._color = being.getColor();
	this._description = "corpse of "+being.describeA();
}
RPG.Items.Corpse.prototype.describe = function() {
	return this._description;
}
