/**
 * @class Maximum hitpoints
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_MAXHP] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_MAXHP].prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._name = "Maximum Hitpoints";
	this._abbr = "MaxHP";
}

/**
 * @class Speed
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_SPEED] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_SPEED].prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._name = "Speed";
	this._abbr = "Spd";
}

/**
 * @class Defensive value
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_DV] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_DV].prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._name = "Defensive value";
	this._abbr = "DV";
}

/**
 * @class Protection value
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_PV] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_PV].prototype.init = function(baseValue) {
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
	var feat = this._findConstant();
	var plus = modifierHolder.getModifier(feat, modifierHolder);
	var rv = this._value;

	var mean = rv.mean + plus;
	var variance = rv.variance;
	return new RPG.Misc.RandomValue(mean, variance);
};

/**
 * @class Damage specification
 * @augments RPG.Feats.RandomValue
 */
RPG.Feats[RPG.FEAT_DAMAGE] = OZ.Class().extend(RPG.Feats.RandomValue);
RPG.Feats[RPG.FEAT_DAMAGE].prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._name = "Damage";
	this._abbr = "Dmg";
}

/**
 * @class To-hit specification
 * @augments RPG.Feats.RandomValue
 */
RPG.Feats[RPG.FEAT_HIT] = OZ.Class().extend(RPG.Feats.RandomValue);
RPG.Feats[RPG.FEAT_HIT].prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._name = "To-hit";
	this._abbr = "Hit";
}

/**
 * @class Strength attribute
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_STRENGTH] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_STRENGTH].prototype.init = function(baseValue) {
	this.parent(baseValue);
	this.addModifier(RPG.FEAT_DAMAGE, this.bind(this.standardModifier));
	this._name = "Strength";
	this._abbr = "Str";
}

/**
 * @class Toughness attribute
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_TOUGHNESS] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_TOUGHNESS].prototype.init = function(baseValue) {
	this.parent(baseValue);
	this.addModifier(RPG.FEAT_MAXHP, this.bind(this.standardModifier));
	this.addModifier(RPG.FEAT_PV, this.bind(this.standardModifier));
	this._name = "Toughness";
	this._abbr = "To";
}

/**
 * @class Intelligence attribute
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_INTELLIGENCE] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_INTELLIGENCE].prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._name = "Intelligence";
	this._abbr = "Int";
}

/**
 * @class Dexterity attribute
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_DEXTERITY] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_DEXTERITY].prototype.init = function(baseValue) {
	this.parent(baseValue);
	this.addModifier(RPG.FEAT_HIT, this.bind(this.standardModifier));
	this.addModifier(RPG.FEAT_DV, this.bind(this.standardModifier));
	this._name = "Dexterity";
	this._abbr = "Dex";
}
