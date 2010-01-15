/**
 * @class Kick slot
 * @augments RPG.Slots.BaseSlot
 * @augments RPG.Misc.IWeapon
 */
RPG.Slots.Kick = OZ.Class()
					.extend(RPG.Slots.BaseSlot)
					.implement(RPG.Misc.IWeapon);
RPG.Slots.Kick.prototype.init = function(name) {
	this.parent(name, RPG.Items.Boots);
	this._hit = null;
	this._damage = null;
}

RPG.Slots.Kick.prototype.getHit = function() {
	var addedHit = new RPG.Misc.RandomValue(this._being.getFeat(RPG.FEAT_HIT), 0);
	return this._hit.add(addedHit);
}

RPG.Slots.Kick.prototype.getDamage = function() {
	var addedDamage = new RPG.Misc.RandomValue(this._being.getFeat(RPG.FEAT_DAMAGE), 0);
	return this._damage.add(addedDamage);
}

/**
 * @class Weapon-based slot
 * @augments RPG.Slots.BaseSlot
 * @augments RPG.Misc.IWeapon
 */
RPG.Slots.Weapon = OZ.Class()
					.extend(RPG.Slots.BaseSlot)
					.implement(RPG.Misc.IWeapon);
RPG.Slots.Weapon.prototype.init = function(name) {
	this.parent(name, RPG.Items.Weapon);
	this._hit = null;
	this._damage = null;
}

RPG.Slots.Weapon.prototype.setItem = function(item) {
	/* remove shield for dual-handed weapons */
	if (item && item.isDualHand()) { this._being.unequip(RPG.SLOT_SHIELD); }

	return this.parent(item);
}

RPG.Slots.Weapon.prototype.getHit = function() {
	var addedHit = new RPG.Misc.RandomValue(this._being.getFeat(RPG.FEAT_HIT), 0);
	return addedHit.add(this._item ? this._item.getHit() : this._hit);
}

RPG.Slots.Weapon.prototype.getDamage = function() {
	var addedDamage = new RPG.Misc.RandomValue(this._being.getFeat(RPG.FEAT_DAMAGE), 0);
	return addedDamage.add(this._item ? this._item.getDamage() : this._damage);
}

/**
 * @class Shield slot
 * @augments RPG.Slots.BaseSlot
 */
RPG.Slots.Shield = OZ.Class().extend(RPG.Slots.BaseSlot);
RPG.Slots.Shield.prototype.init = function(name) {
	this.parent(name, RPG.Items.Shield);
}

RPG.Slots.Shield.prototype.setItem = function(item) {
	/* remove dual-handed weapon if shield is equipped */
	if (item) {
		var weapon = this._being.getSlot(RPG.SLOT_WEAPON).getItem();
		if (weapon && weapon.isDualHand()) { this._being.unequip(RPG.SLOT_WEAPON); }
	}

	return this.parent(item);
}

/**
 * @class Projectile slot (rocks, arrows, ...)
 * This slot holds the whole heap of items, no subtracting is done.
 * @augments RPG.Slots.BaseSlot
 * @augments RPG.Misc.IWeapon
 */
RPG.Slots.Projectile = OZ.Class()
						.extend(RPG.Slots.BaseSlot);
RPG.Slots.Projectile.prototype.init = function(name) {
	this.parent(name, RPG.Items.Projectile);
}

RPG.Slots.Projectile.prototype.setItem = function(item) {
	if (item) { 
		if (this._being.hasItem(item)) { this._being.removeItem(item); } 
	}

	this._item = item;
	return item;
}

