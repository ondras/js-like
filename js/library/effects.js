/**
 * @class Turn counter effect
 * @augments RPG.Effects.BaseEffect
 */
RPG.Effects.TurnCounter = OZ.Class().extend(RPG.Effects.BaseEffect);
RPG.Effects.TurnCounter.prototype.init = function(turnsRemaining) {
	this.parent(turnsRemaining);
	this._turns = 0;
}

RPG.Effects.TurnCounter.prototype.go = function() {
	this.parent();
	this._turns++;
	RPG.UI.status.updateRounds(this._turns); 
}


/**
 * @class HP Regen
 * @augments RPG.Effects.BaseEffect
 */
RPG.Effects.HPRegeneration = OZ.Class().extend(RPG.Effects.BaseEffect);
RPG.Effects.HPRegeneration.prototype.go = function() {
	this.parent();

	var hp = this._being.getStat(RPG.STAT_HP);
	var max = this._being.getFeat(RPG.FEAT_MAX_HP);
	if (max == hp) { return; } /* already at full hp */
	
	/* regen of 3.5 means: regen 3 + regen 1 with 50% chance */
	var regen = this._being.getFeat(RPG.FEAT_REGEN_HP);
	var amount = 0; 
	amount += Math.floor(regen / 100);
	amount += Math.randomPercentage() <= (regen % 100);
	
	if (amount) { this._being.adjustStat(RPG.STAT_HP, amount); }
}

/**
 * @class Mana Regen
 * @augments RPG.Effects.BaseEffect
 */
RPG.Effects.ManaRegeneration = OZ.Class().extend(RPG.Effects.BaseEffect);
RPG.Effects.ManaRegeneration.prototype.go = function() {
	this.parent();

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

/**
 * @class Temporary blindness
 * @augments RPG.Effects.BaseEffect
 */
RPG.Effects.Blindness = OZ.Class().extend(RPG.Effects.BaseEffect);
RPG.Effects.Blindness.prototype.init = function(turnsRemaining) {
	this.parent(turnsRemaining);
	this._modifiers[RPG.FEAT_SIGHT_RANGE] = -1e6;
}

RPG.Effects.Blindness.prototype.entering = function(being) {
	this.parent(being);
	if (being == RPG.Game.pc) { RPG.Game.pc.updateVisibility(); } 
}

RPG.Effects.Blindness.prototype.leaving = function(being) {
	this.parent(being);
	if (being == RPG.Game.pc) { RPG.Game.pc.updateVisibility(); }

	var canSee = RPG.Game.pc.canSee(being.getCoords());
	if (canSee) {
		var s = RPG.Misc.format("%A %is no longer blinded.", being);
		RPG.UI.buffer.message(s);
	}
}
