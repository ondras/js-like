/**
 * @class Basic per-turn effect: represents a condition for a being.
 * Effects have various qualities:
 *  - they may hold modifiers,
 *  - they are eneterable,
 *  - they may have a limited duration,
 *  - additionally, they can perform anything during being's turn
 * @augments RPG.IEnterable
 */
RPG.Effects.BaseEffect = OZ.Class().implement(RPG.IEnterable);
RPG.Effects.BaseEffect.prototype.init = function(turnsRemaining) {
	this._modifiers = {};
	this._being = null;
	this._turnsRemaining = turnsRemaining || 0;
}

RPG.Effects.BaseEffect.prototype.go = function() {
	if (this._turnsRemaining) {
		this._turnsRemaining--;
		if (!this._turnsRemaining) { this._being.removeEffect(this); }
	}
}

RPG.Effects.BaseEffect.prototype.entering = function(being) {
	this._being = being;
	return this.parent(being);
}
