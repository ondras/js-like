/**
 * @class Kick slot
 * @augments RPG.Slots.BaseSlot
 * @augments RPG.Misc.WeaponInterface
 */
RPG.Slots.Kick = OZ.Class()
						.extend(RPG.Slots.BaseSlot)
						.implement(RPG.Misc.WeaponInterface);
RPG.Slots.Kick.prototype.init = function(name) {
	this.parent(name, [RPG.Items.Boots]);
	this._hit = null;
	this._damage = null;
}

RPG.Slots.Kick.prototype.getHit = function() {
	return this._hit.modifiedValue(this._being);
}

RPG.Slots.Kick.prototype.getDamage = function() {
	return this._damage.modifiedValue(this._being);
}

/**
 * @class Melee-weapon-based slot
 * @augments RPG.Slots.BaseSlot
 * @augments RPG.Misc.WeaponInterface
 */
RPG.Slots.Melee = OZ.Class()
						.extend(RPG.Slots.BaseSlot)
						.implement(RPG.Misc.WeaponInterface);
RPG.Slots.Melee.prototype.init = function(name) {
	this.parent(name, [RPG.Items.Weapon]);
	this._hit = null;
	this._damage = null;
}

RPG.Slots.Melee.prototype.getHit = function() {
	if (this._item) {
		return this._item.getHit(this._being);
	} else {
		return this._hit.modifiedValue(this._being);
	}
}

RPG.Slots.Melee.prototype.getDamage = function() {
	if (this._item) {
		return this._item.getDamage(this._being);
	} else {
		return this._damage.modifiedValue(this._being);
	}
}
