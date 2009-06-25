/**
 * @class Orc
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.Orc = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.Orc.prototype.init = function() {
	this.parent(new RPG.Races.Orc());
}

/**
 * @class Human
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.Human = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.Human.prototype.init = function() {
	this.parent(new RPG.Races.Human());
}

/**
 * @class God, useful for debugging.
 */
RPG.Beings.God = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.God.prototype.init = function() {
	this.parent(new RPG.Races.Human());
}

RPG.Beings.God.prototype.sightDistance = function() {
	return Number.POSITIVE_INFINITY;
}

RPG.Beings.God.prototype.canSee = function(coords) {
	return true;
}
