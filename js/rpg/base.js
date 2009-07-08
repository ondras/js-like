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
 * Returns a feat value, modified by modifierHolder. This can be a number or an interval.
 */
RPG.Feats.BaseFeat.prototype.modifiedValue = function(modifierHolder) {
	var plus = modifierHolder.getModifier(this.constructor, RPG.MODIFIER_PLUS, modifierHolder);
	var times = modifierHolder.getModifier(this.constructor, RPG.MODIFIER_TIMES, modifierHolder);
	var value = this._value;
	if (value instanceof RPG.Misc.Interval) { 
		var min = value.min;
		var max = value.max;
		min = (min + plus) * times;
		max = (max + plus) * times;
		min = Math.max(0, min); 
		max = Math.max(0, max); 
		return new RPG.Misc.Interval(min, max);
	} else {
		var exact = (value + plus) * times;
		return Math.max(0, exact);
	}
};
RPG.Feats.BaseFeat.prototype.standardModifier = function(modifierHolder) {
	var value = this.modifiedValue(modifierHolder);
	var num = (value-11)*10/21;
	return Math.round(num);
}

/**
 * @class Basic item
 * @augments RPG.Visual.VisualInterface
 * @augments RPG.Misc.ModifierInterface
 */
RPG.Items.BaseItem = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Misc.ModifierInterface);
RPG.Items.BaseItem.prototype.init = function() {
	this._initVisuals();
	this._descriptionPlural = null;
	this._modifiers = [];
	this._amount = 1;
	this.flags = 0;
}

RPG.Items.BaseItem.prototype.clone = function() {
	var tmp = function() {};
	tmp.prototype = this.constructor.prototype;
	var clone = new tmp();
	for (var p in this) { clone[p] = this[p]; }
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
