/**
 * @class Orc
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.Orc = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.Orc.prototype.setup = function() {
	return this.parent(new RPG.Races.Orc());
}

/**
 * @class Human
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.Human = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.Human.prototype.setup = function() {
	return this.parent(new RPG.Races.Human());
}

/**
 * @class God, useful for debugging.
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.God = OZ.Class().extend(RPG.Beings.PC);

RPG.Beings.God.prototype.sightDistance = function() {
	return Number.POSITIVE_INFINITY;
}

RPG.Beings.God.prototype.canSee = function(coords) {
	return true;
}
