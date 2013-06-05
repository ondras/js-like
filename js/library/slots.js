/**
 * @class Damaging slot
 * @augments RPG.Slots.BaseSlot
 * @augments RPG.Misc.IDamageDealer
 */
RPG.Slots.Damage = OZ.Class()
					.extend(RPG.Slots.BaseSlot)
					.implement(RPG.Misc.IDamageDealer);
RPG.Slots.Damage.prototype.init = function(name, allowed) {
	this.parent(name, allowed);
	this._hit = null;
	this._damage = null;
}

/**
 * @see RPG.Misc.IDamageDealer#getLuck
 */
RPG.Slots.Damage.prototype.getLuck = function() {
	return this._being.getFeat(RPG.FEAT_LUCK);
}

/**
 * @see RPG.Misc.IDamageDealer#getHit
 */
RPG.Slots.Damage.prototype.getHit = function() {
	return this._hit.add(this._being.getFeat(RPG.FEAT_HIT));
}

/**
 * @see RPG.Misc.IDamageDealer#getDamage
 */
RPG.Slots.Damage.prototype.getDamage = function() {
	return this._damage.add(this._being.getFeat(RPG.FEAT_DAMAGE));
}

RPG.Slots.Damage.prototype.setHit = function(hit) {
	this._hit = hit;
	return this;
}

RPG.Slots.Damage.prototype.setDamage = function(damage) {
	this._damage = damage;
	return this;
}

/**
 * @class Kick slot
 * @augments RPG.Slots.Damage
 */
RPG.Slots.Kick = OZ.Class().extend(RPG.Slots.Damage);

RPG.Slots.Kick.prototype.init = function(name) {
	this.parent(name, RPG.Items.Boots);
}

/**
 * @class Weapon-based slot. Deals damage itself, but when equipped with a weapon, deals damage with that weapon.
 * @augments RPG.Slots.Damage
 */
RPG.Slots.Weapon = OZ.Class().extend(RPG.Slots.Damage)
RPG.Slots.Weapon.prototype.init = function(name) {
	this.parent(name, RPG.Items.Weapon);
}

/**
 * @param {RPG.Items.Weapon}
 */
RPG.Slots.Weapon.prototype.setItem = function(item) {
	/* remove shield for dual-handed weapons */
	if (item && item.isDualHand()) { this._being.unequip(RPG.SLOT_SHIELD); }

	return this.parent(item);
}

RPG.Slots.Weapon.prototype.getHit = function() {
	var addedHit = new RPG.RandomValue(this._being.getFeat(RPG.FEAT_HIT), 0);
	return addedHit.add(this._item ? this._item.getHit() : this._hit);
}

RPG.Slots.Weapon.prototype.getDamage = function() {
	var addedDamage = new RPG.RandomValue(this._being.getFeat(RPG.FEAT_DAMAGE), 0);
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
 */
RPG.Slots.Projectile = OZ.Class().extend(RPG.Slots.BaseSlot);
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

