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
	this.addModifier(RPG.Feats.MaxHP, RPG.MODIFIER_PLUS, 10);
	this.addModifier(RPG.Feats.Damage, RPG.MODIFIER_PLUS, 1);
}
