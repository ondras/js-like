/**
 * @class Generic weapon
 * @augments RPG.Items.BaseItem
 * @augments RPG.Misc.IWeapon
 */
RPG.Items.Weapon = OZ.Class().extend(RPG.Items.BaseItem).implement(RPG.Misc.IWeapon);
RPG.Items.Weapon.factory.ignore = true;
RPG.Items.Weapon.prototype.init = function(hit, damage) {
	this.parent();
	this.setHit(hit);
	this.setDamage(damage);
	this._dualHand = false;
	this._char = ")";
	this._color = "lightgray";
}

RPG.Items.Weapon.prototype.isDualHand = function() {
	return this._dualHand;
}

RPG.Items.Weapon.prototype._describeModifiers = function() {
	var mods = this.parent();
	return "(" + this._hit.toString() + ", " + this._damage.toString() + ")" + (mods ? " "+mods : "");
}

/**
 * @class Dagger
 * @augments RPG.Items.Weapon
 */
RPG.Items.Dagger = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Dagger.prototype.init = function() {
	this.parent(new RPG.Misc.RandomValue(4, 1), new RPG.Misc.RandomValue(5, 3));
	this._image = "dagger";
	this._description = "dagger";
}

/**
 * @class Dagger
 * @augments RPG.Items.Weapon
 */
RPG.Items.OrcishDagger = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.OrcishDagger.prototype.init = function() {
	this.parent(new RPG.Misc.RandomValue(6, 1), new RPG.Misc.RandomValue(5, 3));
	this._image = "orcish-dagger";
	this._description = "orcish dagger";
}

/**
 * @class Club
 * @augments RPG.Items.Weapon
 */
RPG.Items.Club = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Club.prototype.init = function() {
	this.parent(new RPG.Misc.RandomValue(4, 1), new RPG.Misc.RandomValue(7, 3));
	this._color = "brown";
	this._image = "club";
	this._description = "club"; 
}

/**
 * @class Short sword
 * @augments RPG.Items.Weapon
 */
RPG.Items.ShortSword = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.ShortSword.prototype.init = function() {
	this.parent(new RPG.Misc.RandomValue(6, 1), new RPG.Misc.RandomValue(4, 2));
	
	this._color = "darkgray";
	this._image = "short-sword";
	this._description = "short sword"; 
}

/**
 * @class Long sword
 * @augments RPG.Items.Weapon
 */
RPG.Items.LongSword = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.LongSword.prototype.init = function() {
	this.parent(new RPG.Misc.RandomValue(6, 1), new RPG.Misc.RandomValue(6, 2));
	this._color = "darkgray";
	this._image = "long-sword";
	this._description = "long sword"; 
}

/**
 * @class Axe
 * @augments RPG.Items.Weapon
 */
RPG.Items.Axe = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Axe.prototype.init = function() {
	this.parent(new RPG.Misc.RandomValue(6, 1), new RPG.Misc.RandomValue(6, 2));
	this._color = "brown";
	this._image = "axe";
	this._description = "axe"; 
}

/**
 * @class Torch
 * @augments RPG.Items.Weapon
 */
RPG.Items.Torch = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.Torch.prototype.init = function() {
	this.parent(new RPG.Misc.RandomValue(4, 2), new RPG.Misc.RandomValue(4, 3));
	this._color = "gray";
	this._image = "torch";
	this._description = "torch"; 
	
	this._modifiers[RPG.FEAT_SIGHT_RANGE] = 1;
}

/**
 * @class Klingon Ceremonial Sword
 * @augments RPG.Items.Weapon
 */
RPG.Items.KlingonSword = OZ.Class().extend(RPG.Items.Weapon)
RPG.Items.KlingonSword.factory.ignore = true;
RPG.Items.KlingonSword.prototype.init = function() {
	this.parent(new RPG.Misc.RandomValue(10, 3), new RPG.Misc.RandomValue(10, 3));
	this._modifiers[RPG.FEAT_DV] = 1;
	this._modifiers[RPG.FEAT_PV] = 1;
	this._modifiers[RPG.FEAT_STRENGTH] = 2;
	this._dualHand = true;
	this._color = "gold";
	this._image = "klingon-sword";
	this._description = "Klingon ceremonial sword";
}
