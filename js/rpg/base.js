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
/**
 * Returns a feat value, modified by modifierHolder.
 */
RPG.Feats.BaseFeat.prototype.modifiedValue = function(modifierHolder) {
	var plus = modifierHolder.getModifier(this.constructor, RPG.MODIFIER_PLUS, modifierHolder);
	var times = modifierHolder.getModifier(this.constructor, RPG.MODIFIER_TIMES, modifierHolder);
	var value = this._value;
	var exact = (value + plus) * times;
	return Math.max(0, exact);
}

RPG.Feats.BaseFeat.prototype.standardModifier = function(modifierHolder) {
	var value = this.modifiedValue(modifierHolder);
	var num = (value-11)*10/21;
	return Math.round(num);
}

/**
 * @class Basic item
 * @augments RPG.Visual.VisualInterface
 * @augments RPG.Misc.ModifierInterface
 * @augments RPG.Misc.SerializableInterface
 */
RPG.Items.BaseItem = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Misc.ModifierInterface)
						.implement(RPG.Misc.SerializableInterface);
						
RPG.Items.BaseItem.prototype.init = function() {
	this._initVisuals();
	this._descriptionPlural = null;
	this._modifiers = [];
	this._amount = 1;
	this.flags = 0;
}

/**
 * @see RPG.Misc.SerializableInterface#clone
 */
RPG.Items.BaseItem.prototype.clone = function() {
	var clone = new this.constructor();
	for (var p in this) { clone[p] = this[p]; }

	this._modifiers = [];
	/* copy modifiers to avoid references */
	for (var i=0;i<this._modifiers.length;i++) {
		var modifier = this._modifiers[i];
		var mod2 = [modifier[0], modifier[1], modifier[2]];
		clone._modifiers.push(mod2);
	}
	return this;
}

/**
 * Create an item which represent a subset of this item
 * @param {int} amount How many items do we subtract?
 * @returns {RPG.Items.BaseItem} Sub-heap
 */
RPG.Items.BaseItem.prototype.subtract = function(amount) {
	if (amount == 0 || amount >= this._amount) { throw new Error("Incorrect amount to subtract"); }
	var clone = this.clone();
	
	this.setAmount(this._amount - amount);
	clone.setAmount(amount);
	
	return clone;
}

RPG.Items.BaseItem.prototype.getAmount = function() {
	return this._amount;
}

RPG.Items.BaseItem.prototype.setAmount = function(amount) {
	this._amount = amount;
	return this;
}

RPG.Items.BaseItem.prototype.describe = function() {
	var plural = this._descriptionPlural || this._description + "s";
	if (this._amount == 1) {
		return this._description;
	} else {
		return "heap of " + this._amount + " " + plural;
	}
}

/**
 * Can this item be merged with other one? This is possible only when items are truly the same.
 * @param {RPG.Items.BaseItem}
 */
RPG.Items.BaseItem.prototype.isSameAs = function(item) {
	if (item.constructor != this.constructor) { return false; }
	return true;
}

/**
 * Merge this item into a list of items.
 * @param {RPG.Items.BaseItem[]} listOfItems
 * @returns {bool} Was this item merged? false = no, it was appended
 */
RPG.Items.BaseItem.prototype.mergeInto = function(listOfItems) {
	for (var i=0;i<listOfItems.length;i++) {
		var item = listOfItems[i];
		if (item.isSameAs(this)) {
			/* merge! */
			item.setAmount(item.getAmount() + this.getAmount());
			return true;
		}
	}
	
	listOfItems.push(this);
	return false;
}

/**
 * @class Basic race
 * @augments RPG.Visual.VisualInterface
 * @augments RPG.Misc.ModifierInterface
 */
RPG.Races.BaseRace = OZ.Class()
							.implement(RPG.Misc.ModifierInterface)
							.implement(RPG.Visual.VisualInterface)
RPG.Races.BaseRace.prototype.init = function() {
	this._initVisuals();
	this._modifiers = [];
}

/**
 * @class Basic per-turn effect
 * @augments RPG.Misc.SerializableInterface
 */
RPG.Effects.BaseEffect = OZ.Class().implement(RPG.Misc.SerializableInterface);
RPG.Effects.BaseEffect.prototype.init = function(being) {
	this._being = being;
}
RPG.Effects.BaseEffect.prototype.go = function() {
}

