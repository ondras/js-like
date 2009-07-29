/**
 * @class Basic per-turn effect
 * @augments RPG.Effects.BaseEffect
 */
RPG.Effects.TurnCounter = OZ.Class().extend(RPG.Effects.BaseEffect);
RPG.Effects.TurnCounter.prototype.init = function(being) {
	this.parent(being);
	this._turns = null;
}
RPG.Effects.TurnCounter.prototype.setup = function() {
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
	var hp = this._being.getHP();
	var max = this._being.getFeat(RPG.FEAT_MAXHP);
	if (max == hp) { return; }
	
	if (Math.random() < 0.2) { this._being.adjustHP(1); }
}
