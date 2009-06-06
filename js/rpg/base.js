/**
 * Basic Feat. Implements ModifierInterface, since a feat can influent other feat (Strength influences MaxHP...).
 * However, feats modify other feats byt adding/multiplying their own (modified) value.
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
	return (value + plus) * times;
};
RPG.Feats.BaseFeat.prototype.getModifier = function(feat, type, modifierHolder) {
	for (var i=0;i<this._modifiers.length;i++) {
		var item = this._modifiers[i];
		if (item[0] == feat && item[1] == type) { return item[2] * this.modifiedValue(modifierHolder); }
	}
	return null;
}

RPG.Items.BaseItem = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Visual.DescriptionInterface)
						.implement(RPG.Misc.ModifierInterface);
RPG.Items.BaseItem.prototype.init = function() {
	this._modifiers = [];
	this.flags = RPG.ITEM_PICKABLE;
}
RPG.Items.BaseItem.prototype.getChar = function(who) {
	var ch = new RPG.Visual.Char();
	ch.setChar("?");
	ch.setColor("#a9a9a9");
	return ch;
}
RPG.Items.BaseItem.prototype.getImage = function(who) {
	return "item";
}
RPG.Items.BaseItem.prototype.describe = function(who) {
	return "item";
}

RPG.Races.BaseRace = OZ.Class()
							.implement(RPG.Misc.ModifierInterface)
							.implement(RPG.Visual.VisualInterface)
							.implement(RPG.Visual.DescriptionInterface);
RPG.Races.BaseRace.prototype.init = function() {
	this._modifiers = [];
}
