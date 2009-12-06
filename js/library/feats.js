/**
 * @class Maximum hitpoints
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_MAXHP] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_MAXHP].prototype.init = function(owner, baseValue) {
	this.parent(owner, baseValue);
}

/**
 * @class Maximum mana
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_MAXMANA] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_MAXMANA].prototype.init = function(owner, baseValue) {
	this.parent(owner, baseValue);
}

/**
 * @class Speed
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_SPEED] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_SPEED].prototype.init = function(owner, baseValue) {
	this.parent(owner, baseValue);
}

/**
 * @class Defensive value
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_DV] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_DV].prototype.init = function(owner, baseValue) {
	this.parent(owner, baseValue);
}

/**
 * @class Protection value
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_PV] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_PV].prototype.init = function(owner, baseValue) {
	this.parent(owner, baseValue);
}

/**
 * @class Damage specification
 * @augments RPG.Feats.RandomValue
 */
RPG.Feats[RPG.FEAT_DAMAGE] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_DAMAGE].prototype.init = function(owner, baseValue) {
	this.parent(owner, baseValue);
}

/**
 * @class To-hit specification
 * @augments RPG.Feats.RandomValue
 */
RPG.Feats[RPG.FEAT_HIT] = OZ.Class().extend(RPG.Feats.BaseFeat);
RPG.Feats[RPG.FEAT_HIT].prototype.init = function(owner, baseValue) {
	this.parent(owner, baseValue);
}

/**
 * @class Strength attribute
 * @augments RPG.Feats.AdvancedFeat
 */
RPG.Feats[RPG.FEAT_STRENGTH] = OZ.Class().extend(RPG.Feats.AdvancedFeat);
RPG.Feats[RPG.FEAT_STRENGTH].name = "strength";
RPG.Feats[RPG.FEAT_STRENGTH].prototype.init = function(owner, baseValue) {
	this.parent(owner, baseValue);
	this._modifiers[RPG.FEAT_DAMAGE] = this._drd();
}

/**
 * @class Toughness attribute
 * @augments RPG.Feats.AdvancedFeat
 */
RPG.Feats[RPG.FEAT_TOUGHNESS] = OZ.Class().extend(RPG.Feats.AdvancedFeat);
RPG.Feats[RPG.FEAT_TOUGHNESS].name = "toughness";
RPG.Feats[RPG.FEAT_TOUGHNESS].prototype.init = function(owner, baseValue) {
	this.parent(owner, baseValue);
	this._modifiers[RPG.FEAT_MAXHP] = this._drd();
	this._modifiers[RPG.FEAT_PV] = this._drd();
}

/**
 * @class Magic attribute
 * @augments RPG.Feats.AdvancedFeat
 */
RPG.Feats[RPG.FEAT_MAGIC] = OZ.Class().extend(RPG.Feats.AdvancedFeat);
RPG.Feats[RPG.FEAT_MAGIC].name = "magic";
RPG.Feats[RPG.FEAT_MAGIC].prototype.init = function(owner, baseValue) {
	this.parent(owner, baseValue);
	var arr = this._drd();
	arr[0] *= 3;
	arr[1] *= 3;
	
	this._modifiers[RPG.FEAT_MAXMANA] = arr;
}

/**
 * @class Dexterity attribute
 * @augments RPG.Feats.AdvancedFeat
 */
RPG.Feats[RPG.FEAT_DEXTERITY] = OZ.Class().extend(RPG.Feats.AdvancedFeat);
RPG.Feats[RPG.FEAT_DEXTERITY].name = "dexterity";
RPG.Feats[RPG.FEAT_DEXTERITY].prototype.init = function(owner, baseValue) {
	this.parent(owner, baseValue);
	
	this._modifiers[RPG.FEAT_HIT] = this._drd();
	this._modifiers[RPG.FEAT_DV] = this._drd();
	
	var arr = this._drd();
	arr[0] *= 5;
	arr[1] *= 5;
	this._modifiers[RPG.FEAT_SPEED] = arr;
}
