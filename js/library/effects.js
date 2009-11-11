/**
 * @class Basic per-turn effect
 * @augments RPG.Effects.BaseEffect
 */
RPG.Effects.TurnCounter = OZ.Class().extend(RPG.Effects.BaseEffect);
RPG.Effects.TurnCounter.prototype.init = function() {
	this.parent();
	this._turns = null;
}
RPG.Effects.TurnCounter.prototype.setBeing = function(being) {
	this.parent(being);
	this._turns = 0;
	return this;
}

RPG.Effects.TurnCounter.prototype.go = function() {
	this._turns++;
}

RPG.Effects.TurnCounter.prototype.getCount = function() {
	return this._turns;
}

/**
 * @class HP Regen
 * @augments RPG.Effects.BaseEffect
 */
RPG.Effects.Regeneration = OZ.Class().extend(RPG.Effects.BaseEffect);
RPG.Effects.Regeneration.prototype.go = function() {
	var hp = this._being.getStat(RPG.STAT_HP);
	var max = this._being.getFeat(RPG.FEAT_MAXHP);
	if (max == hp) { return; }
	/* FIXME */
	if (Math.random() < 0.2) { 
		this._being.adjustStat(RPG.STAT_HP, 1); 
	}
}

/**
 * @class Mana Regen
 * @augments RPG.Effects.BaseEffect
 */
RPG.Effects.ManaRegeneration = OZ.Class().extend(RPG.Effects.BaseEffect);
RPG.Effects.ManaRegeneration.prototype.go = function() {
	var mana = this._being.getStat(RPG.STAT_MANA);
	var max = this._being.getFeat(RPG.FEAT_MAXMANA);
	if (max == mana) { return; }

	/* FIXME */
	if (Math.random() < 0.2) { 
		this._being.adjustStat(RPG.STAT_MANA, 1); 
	}
}
