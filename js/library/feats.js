/**
 * @class Strength attribute
 * @augments RPG.Feats.AdvancedFeat
 */
RPG.Feats[RPG.FEAT_STRENGTH] = OZ.Class().extend(RPG.Feats.AdvancedFeat);
RPG.Feats[RPG.FEAT_STRENGTH].label = "strength";
RPG.Feats[RPG.FEAT_STRENGTH].prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._modifiers[RPG.FEAT_DAMAGE] = this._drd();
}

/**
 * @class Toughness attribute
 * @augments RPG.Feats.AdvancedFeat
 */
RPG.Feats[RPG.FEAT_TOUGHNESS] = OZ.Class().extend(RPG.Feats.AdvancedFeat);
RPG.Feats[RPG.FEAT_TOUGHNESS].label = "toughness";
RPG.Feats[RPG.FEAT_TOUGHNESS].prototype.init = function(baseValue) {
	this.parent(baseValue);

	this._modifiers[RPG.FEAT_MAX_HP] = this._drd();
	this._modifiers[RPG.FEAT_REGEN_HP] = this._drd();
	this._modifiers[RPG.FEAT_PV] = this._drd();
}

/**
 * @class Magic attribute
 * @augments RPG.Feats.AdvancedFeat
 */
RPG.Feats[RPG.FEAT_MAGIC] = OZ.Class().extend(RPG.Feats.AdvancedFeat);
RPG.Feats[RPG.FEAT_MAGIC].label = "magic";
RPG.Feats[RPG.FEAT_MAGIC].prototype.init = function(baseValue) {
	this.parent(baseValue);
	var arr = this._drd();
	arr[0] = (arr[0]*3).round(3);
	arr[1] = (arr[1]*3).round(3);
	
	this._modifiers[RPG.FEAT_MAX_MANA] = arr;
	this._modifiers[RPG.FEAT_REGEN_MANA] = this._drd();
}

/**
 * @class Dexterity attribute
 * @augments RPG.Feats.AdvancedFeat
 */
RPG.Feats[RPG.FEAT_DEXTERITY] = OZ.Class().extend(RPG.Feats.AdvancedFeat);
RPG.Feats[RPG.FEAT_DEXTERITY].label = "dexterity";
RPG.Feats[RPG.FEAT_DEXTERITY].prototype.init = function(baseValue) {
	this.parent(baseValue);
	
	var arr = this._drd();
	arr[0] *= 5;
	arr[1] *= 5;
	this._modifiers[RPG.FEAT_SPEED] = arr;
	this._modifiers[RPG.FEAT_HIT] = this._drd();
	this._modifiers[RPG.FEAT_DV] = this._drd();
}

/**
 * @class Luck attribute
 * @augments RPG.Feats.BaseFeat
 */
RPG.Feats[RPG.FEAT_LUCK] = OZ.Class().extend(RPG.Feats.AdvancedFeat);
RPG.Feats[RPG.FEAT_LUCK].label = "luck";
