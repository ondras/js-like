/**
 * @class Generic weapon
 * @augments RPG.Items.BaseItem
 * @augments RPG.Misc.WeaponInterface
 */
RPG.Items.Weapon = OZ.Class().extend(RPG.Items.BaseItem).implement(RPG.Misc.WeaponInterface);
RPG.Items.Weapon.prototype.init = function(hit, damage) {
	this.parent();
	this.setHit(hit);
	this.setDamage(damage);
	this._char = ")";
	this._color = "lightgray";
}

/**
 * @class Dagger
 * @augments RPG.Items.Weapon
 */
RPG.Items.Dagger = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Dagger.prototype.init = function() {
	this.parent(0, new RPG.Misc.Interval(1, 4));
	this._image = "dagger";
	this._description = "dagger";
	this._descriptionPlural = "daggers";
}

/**
 * @class Klingon Ceremonial Sword
 * @augments RPG.Items.Weapon
 */
RPG.Items.KlingonSword = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.KlingonSword.prototype.init = function() {
	this.parent(10, 10);
	this._color = "gold";
	this._image = "klingon-sword";
	this._description = "Klingon ceremonial sword";
	this._descriptionPlural = "Klingon ceremonial swords";
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
	this._description = being.describe() + " corpse";
	this._descriptionPlural = being.describe() + " corpses";
}

/**
 * @class Gold, money
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Gold = OZ.Class().extend(RPG.Items.BaseItem);

RPG.Items.Gold.prototype.init = function() {
	this.parent();
	this._image = "gold";
	this._color = "gold";
	this._char = "$";
	this._description = "piece of gold";
	this._descriptionPlural = "pieces";
}

RPG.Items.Gold.prototype.describe = function() {
	if (this._amount == 1) {
		return this._description;
	} else {
		return "heap of gold ("+this._amount + " " + this._descriptionPlural + ")";
	}
}
