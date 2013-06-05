/**
 * @class Modifier interface: everything that holds feat modifiers have this
 */
RPG.IModifier = OZ.Class();

/**
 * Return modifiers for all feats
 */
RPG.IModifier.prototype.getModifiers = function() {
	return this._modifiers;
}
