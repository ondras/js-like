/**
 * @class Basic per-turn effect
 * @augments RPG.Effects.BaseEffect
 */
RPG.Effects.TurnCounter = OZ.Class().extend(RPG.Effects.BaseEffect);
RPG.Effects.TurnCounter.prototype.init = function(being) {
	this.parent(being);
	this._turns = 0;
}

RPG.Effects.TurnCounter.prototype.go = function() {
	this._turns++;
	RPG.UI.status.updateRounds(this._turns); 
}


/**
 * @class HP Regen
 * @augments RPG.Effects.BaseEffect
 */
RPG.Effects.Regeneration = OZ.Class().extend(RPG.Effects.BaseEffect);
RPG.Effects.Regeneration.prototype.go = function() {
	var hp = this._being.getStat(RPG.STAT_HP);
	var max = this._being.getFeat(RPG.FEAT_MAX_HP);
	if (max == hp) { return; }
	
	var regen = this._being.getFeat(RPG.FEAT_REGEN_HP);
	var amount = 0;
	amount += Math.floor(regen / 100);
	amount += Math.randomPercentage() <= (regen % 100);
	
	if (amount) {
		this._being.adjustStat(RPG.STAT_HP, amount); 
	}
}

/**
 * @class Mana Regen
 * @augments RPG.Effects.BaseEffect
 */
RPG.Effects.ManaRegeneration = OZ.Class().extend(RPG.Effects.BaseEffect);
RPG.Effects.ManaRegeneration.prototype.go = function() {
	var mana = this._being.getStat(RPG.STAT_MANA);
	var max = this._being.getFeat(RPG.FEAT_MAX_MANA);
	if (max == mana) { return; }

	var regen = this._being.getFeat(RPG.FEAT_REGEN_MANA);
	var amount = 0;
	amount += Math.floor(regen / 100);
	amount += Math.randomPercentage() <= (regen % 100);
	
	if (amount) {
		this._being.adjustStat(RPG.STAT_MANA, amount); 
	}
}
