/**
 * @class Head
 * @augments RPG.Slots.BaseSlot
 */
RPG.Slots.Head = OZ.Class().extend(RPG.Slots.BaseSlot);
RPG.Slots.Head.prototype.init = function() {
	this.parent();
	this._name = "Head";
	this._allowed = [];
}

/**
 * @class Feet slot
 * @augments RPG.Slots.BaseSlot
 * @augments RPG.Misc.WeaponInterface
 */
RPG.Slots.Feet = OZ.Class()
						.extend(RPG.Slots.BaseSlot)
						.implement(RPG.Misc.WeaponInterface);
RPG.Slots.Feet.prototype.init = function() {
	this.parent();
	this._name = "Feet";
	this._allowed = [];
	this._hit = null;
	this._damage = null;
}

RPG.Slots.Feet.prototype.getHit = function() {
	return this._hit.modifiedValue(this._being);
}

RPG.Slots.Feet.prototype.getDamage = function() {
	return this._damage.modifiedValue(this._being);
}

/**
 * @class Weapon-based slot
 * @augments RPG.Slots.BaseSlot
 * @augments RPG.Misc.WeaponInterface
 */
RPG.Slots.Weapon = OZ.Class()
						.extend(RPG.Slots.BaseSlot)
						.implement(RPG.Misc.WeaponInterface);
RPG.Slots.Weapon.prototype.init = function() {
	this.parent();
	this._allowed = [RPG.Items.Weapon];
	this._hit = null;
	this._damage = null;
}

RPG.Slots.Weapon.prototype.getHit = function() {
	if (this._item) {
		return this._item.getHit(this._being);
	} else {
		return this._hit.modifiedValue(this._being);
	}
}

RPG.Slots.Weapon.prototype.getDamage = function() {
	if (this._item) {
		return this._item.getDamage(this._being);
	} else {
		return this._damage.modifiedValue(this._being);
	}
}

/**
 * @class Hand slot
 * @augments RPG.Slots.Weapon
 */
RPG.Slots.Hand = OZ.Class().extend(RPG.Slots.Weapon);
RPG.Slots.Hand.prototype.init = function() {
	this.parent();
	this._name = "Hand";
}
