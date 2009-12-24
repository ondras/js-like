/**
 * @class Kick slot
 * @augments RPG.Slots.BaseSlot
 * @augments RPG.Misc.IWeapon
 */
RPG.Slots.Kick = OZ.Class()
					.extend(RPG.Slots.BaseSlot)
					.implement(RPG.Misc.IWeapon);
RPG.Slots.Kick.prototype.init = function(name) {
	this.parent(name, [RPG.Items.Boots]);
	this._hit = null;
	this._damage = null;
}

RPG.Slots.Kick.prototype.getHit = function() {
	return new RPG.Misc.RandomValue(this._hit.mean + this._being.getFeat(RPG.FEAT_HIT), this._hit.variance);
}

RPG.Slots.Kick.prototype.getDamage = function() {
	return new RPG.Misc.RandomValue(this._damage.mean + this._being.getFeat(RPG.FEAT_DAMAGE), this._damage.variance);
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
	this.parent(name, [RPG.Items.Weapon]);
	this._hit = null;
	this._damage = null;
}

RPG.Slots.Weapon.prototype.getHit = function() {
	var v = 0;
	var m = this._being.getFeat(RPG.FEAT_HIT);
	
	if (this._item) {
		v = this._item.getHit().variance;
		m += this._item.getHit().mean;
	} else {
		v = this._hit.variance;
		m += this._hit.mean;
	}

	return new RPG.Misc.RandomValue(m, v);
}

RPG.Slots.Weapon.prototype.getDamage = function() {
	var v = 0;
	var m = this._being.getFeat(RPG.FEAT_DAMAGE);
	
	if (this._item) {
		v = this._item.getDamage().variance;
		m += this._item.getDamage().mean;
	} else {
		v = this._damage.variance;
		m += this._damage.mean;
	}

	return new RPG.Misc.RandomValue(m, v);
}
