/**
 * @class Maximum hitpoints
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.MaxHP = OZ.Class().extend(RPG.Feats.BaseFeat);

/**
 * @class Defensive value
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.DV = OZ.Class().extend(RPG.Feats.BaseFeat);

/**
 * @class Protection value
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.PV = OZ.Class().extend(RPG.Feats.BaseFeat);

/**
 * @class Enhanced, randomvalue-based feat. Does not modify other feats.
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.RandomValue = OZ.Class().extend(RPG.Feats.BaseFeat);

RPG.Feats.RandomValue.prototype.init = function(rv) {
	this._rv = rv;
}

RPG.Feats.RandomValue.prototype.baseValue = function() {
	return this._rv;
};

RPG.Feats.RandomValue.prototype.modifiedValue = function(modifierHolder) {
	var plus = modifierHolder.getModifier(this.constructor, RPG.MODIFIER_PLUS, modifierHolder);
	var times = modifierHolder.getModifier(this.constructor, RPG.MODIFIER_TIMES, modifierHolder);
	var rv = this._rv;

	var mean = rv.mean;
	var variance = rv.variance;
	mean = (mean + plus) * times;
	return new RPG.Misc.RandomValue(mean, variance);
};

/**
 * @class Damage specification
 * @augments RPG.Feats.RandomValue
 */
RPG.Feats.Damage = OZ.Class().extend(RPG.Feats.RandomValue);

/**
 * @class To-hit specification
 * @augments RPG.Feats.RandomValue
 */
RPG.Feats.Hit = OZ.Class().extend(RPG.Feats.RandomValue);

/**
 * @class Strength attribute
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.Strength = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats.Strength.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this.addModifier(RPG.Feats.Damage, RPG.MODIFIER_PLUS, this.bind(this.standardModifier));
}

/**
 * @class Toughness attribute
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.Toughness = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats.Toughness.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this.addModifier(RPG.Feats.MaxHP, RPG.MODIFIER_PLUS, this.bind(this.standardModifier));
	this.addModifier(RPG.Feats.PV, RPG.MODIFIER_PLUS, this.bind(this.standardModifier));
}

/**
 * @class Intelligence attribute
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.Intelligence = OZ.Class().extend(RPG.Feats.BaseFeat);

/**
 * @class Dexterity attribute
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.Dexterity = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats.Dexterity.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this.addModifier(RPG.Feats.Hit, RPG.MODIFIER_PLUS, this.bind(this.standardModifier));
	this.addModifier(RPG.Feats.DV, RPG.MODIFIER_PLUS, this.bind(this.standardModifier));
}
