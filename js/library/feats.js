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
 * @class Damage specification
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.Damage = OZ.Class().extend(RPG.Feats.BaseFeat);

/**
 * @class To-hit specification
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats.Hit = OZ.Class().extend(RPG.Feats.BaseFeat);

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
