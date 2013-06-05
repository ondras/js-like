/**
 * @class Interface for enterable objects (cells, areas, maps)
 * @augments RPG.IModifier
 */
RPG.IEnterable = OZ.Class().extend(RPG.IModifier);

/**
 * Called only when from != this
 * @param {RPG.Beings.BaseBeing} being Someone who just came here
 */
RPG.IEnterable.prototype.entering = function(being) {
	being.addModifiers(this);
};

/**
 * Called only when to != this
 * @param {RPG.Beings.BaseBeing} being Someone who is just leaving
 */
RPG.IEnterable.prototype.leaving = function(being) {
	being.removeModifiers(this);
};
