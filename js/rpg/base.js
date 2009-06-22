/**
 * @class Basic feat. Implements ModifierInterface, since a feat can influent other feat (Strength influences MaxHP...).
 * However, feats modify other feats byt adding/multiplying their own (modified) value.
 * @augments RPG.Misc.ModifierInterface
 */
RPG.Feats.BaseFeat = OZ.Class().implement(RPG.Misc.ModifierInterface);
RPG.Feats.BaseFeat.prototype.init = function(baseValue) {
	this._value = baseValue;
	this._modifiers = [];
}
RPG.Feats.BaseFeat.prototype.baseValue = function() {
	return this._value;
};
RPG.Feats.BaseFeat.prototype.modifiedValue = function(modifierHolder) {
	var plus = modifierHolder.getModifier(this.constructor, RPG.MODIFIER_PLUS, modifierHolder);
	var times = modifierHolder.getModifier(this.constructor, RPG.MODIFIER_TIMES, modifierHolder);
	var value = this._value;
	if (value instanceof RPG.Misc.Dice) { value = value.roll(); }
	var exact = (value + plus) * times;
	return Math.max(0, exact);
};
RPG.Feats.BaseFeat.prototype.standardModifier = function(modifierHolder) {
	var value = this.modifiedValue(modifierHolder);
	var num = (value-11)*10/21;
	return num;
}

/**
 * @class Basic item
 * @augments RPG.Visual.VisualInterface
 * @augments RPG.Visual.DescriptionInterface
 * @augments RPG.Misc.ModifierInterface
 */
RPG.Items.BaseItem = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Visual.DescriptionInterface)
						.implement(RPG.Misc.ModifierInterface);
RPG.Items.BaseItem.prototype.init = function() {
	this._modifiers = [];
	this.flags = RPG.ITEM_PICKABLE;
}
RPG.Items.BaseItem.prototype.getChar = function() {
	return "?";
}
RPG.Items.BaseItem.prototype.getImage = function() {
	return "item";
}
RPG.Items.BaseItem.prototype.describe = function(who) {
	return "item";
}

/**
 * @class Basic race
 * @augments RPG.Visual.VisualInterface
 * @augments RPG.Visual.DescriptionInterface
 * @augments RPG.Misc.ModifierInterface
 */
RPG.Races.BaseRace = OZ.Class()
							.implement(RPG.Misc.ModifierInterface)
							.implement(RPG.Visual.VisualInterface)
							.implement(RPG.Visual.DescriptionInterface);
RPG.Races.BaseRace.prototype.init = function() {
	this._modifiers = [];
}
