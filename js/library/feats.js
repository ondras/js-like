/**
 * @class Maximum hitpoints
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.MaxHP = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats.MaxHP.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._name = "Maximum Hitpoints";
	this._abbr = "MaxHP";
}

/**
 * @class Speed
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.Speed = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats.Speed.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._name = "Speed";
	this._abbr = "Spd";
}

/**
 * @class Defensive value
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.DV = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats.DV.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._name = "Defensive value";
	this._abbr = "DV";
}

/**
 * @class Protection value
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.PV = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats.PV.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._name = "Protective value";
	this._abbr = "PV";
}

/**
 * @class Enhanced, randomvalue-based feat. Does not modify other feats.
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.RandomValue = OZ.Class().extend(RPG.Feats.BaseFeat);

RPG.Feats.RandomValue.prototype.modifiedValue = function(modifierHolder) {
	var plus = modifierHolder.getModifier(this.constructor, modifierHolder);
	var rv = this._value;

	var mean = rv.mean + plus;
	var variance = rv.variance;
	return new RPG.Misc.RandomValue(mean, variance);
};

/**
 * @class Damage specification
 * @augments RPG.Feats.RandomValue
 */
RPG.Feats.Damage = OZ.Class().extend(RPG.Feats.RandomValue);
RPG.Feats.Damage.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._name = "Damage";
	this._abbr = "Dmg";
}

/**
 * @class To-hit specification
 * @augments RPG.Feats.RandomValue
 */
RPG.Feats.Hit = OZ.Class().extend(RPG.Feats.RandomValue);
RPG.Feats.Hit.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._name = "To-hit";
	this._abbr = "Hit";
}

/**
 * @class Strength attribute
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.Strength = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats.Strength.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this.addModifier(RPG.Feats.Damage, this.bind(this.standardModifier));
	this._name = "Strength";
	this._abbr = "Str";
}

/**
 * @class Toughness attribute
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.Toughness = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats.Toughness.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this.addModifier(RPG.Feats.MaxHP, this.bind(this.standardModifier));
	this.addModifier(RPG.Feats.PV, this.bind(this.standardModifier));
	this._name = "Toughness";
	this._abbr = "To";
}

/**
 * @class Intelligence attribute
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.Intelligence = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats.Intelligence.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._name = "Intelligence";
	this._abbr = "Int";
}

/**
 * @class Dexterity attribute
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.Dexterity = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats.Dexterity.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this.addModifier(RPG.Feats.Hit, this.bind(this.standardModifier));
	this.addModifier(RPG.Feats.DV, this.bind(this.standardModifier));
	this._name = "Dexterity";
	this._abbr = "Dex";
}
