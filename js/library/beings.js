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
