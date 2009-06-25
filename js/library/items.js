/**
 * @class Generic weapon
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Weapon = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Weapon.prototype.init = function(hit, damage) {
	this.parent();
	this._hit = new RPG.Feats.Hit(hit || 0);
	this._damage = new RPG.Feats.Hit(damage || 0);
	this._char = ")";
	this._color = "lightgray";
}
RPG.Items.Weapon.prototype.getHit = function(modifierHolder) {
	return this._hit.modifiedValue(modifierHolder);
}
RPG.Items.Weapon.prototype.getDamage = function(modifierHolder) {
	return this._damage.modifiedValue(modifierHolder);
}

/**
 * @class Dagger
 * @augments RPG.Items.Weapon
 */
RPG.Items.Dagger = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Dagger.prototype.init = function() {
	this.parent(2, 0);
	this._image = "dagger";
	this._description = "dagger";
}

/**
 * @class Anything that can be eaten
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Edible = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Edible.prototype.init = function() {
	this.parent();
	this.flags |= RPG.ITEM_EDIBLE;
	this._char = "%";
}

/**
 * @class Corpse, after being dies
 * @augments RPG.Items.Edible
 */
RPG.Items.Corpse = OZ.Class().extend(RPG.Items.Edible);

/**
 * @param {RPG.Beings.BaseBeing} being The one who died
 */
RPG.Items.Corpse.prototype.init = function(being) {
	this.parent();
	this._image = "corpse";
	this._color = being.getColor();
	this._description = "corpse of "+being.describeA();
}

/**
 * @class Gold, money
 */
RPG.Items.Gold = OZ.Class().extend(RPG.Items.BaseItem);

RPG.Items.Gold.prototype.init = function() {
	this.parent();
	this._image = "gold";
	this._color = "gold";
	this._char = "$";
	this._description = "heap of gold";
}
