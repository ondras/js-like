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

	this._modifiers[RPG.FEAT_MAX_HP] = this._drd();
	this._modifiers[RPG.FEAT_REGEN_HP] = this._drd();
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
	
	this._modifiers[RPG.FEAT_MAX_MANA] = arr;
	this._modifiers[RPG.FEAT_REGEN_MANA] = this._drd();
	this._modifiers[RPG.FEAT_DAMAGE_MAGIC] = this._drd();
}

/**
 * @class Dexterity attribute
 * @augments RPG.Feats.AdvancedFeat
 */
RPG.Feats[RPG.FEAT_DEXTERITY] = OZ.Class().extend(RPG.Feats.AdvancedFeat);
RPG.Feats[RPG.FEAT_DEXTERITY].name = "dexterity";
RPG.Feats[RPG.FEAT_DEXTERITY].prototype.init = function(owner, baseValue) {
	this.parent(owner, baseValue);
	
	var arr = this._drd();
	arr[0] *= 5;
	arr[1] *= 5;
	this._modifiers[RPG.FEAT_SPEED] = arr;
	this._modifiers[RPG.FEAT_HIT] = this._drd();
	this._modifiers[RPG.FEAT_DV] = this._drd();
}
