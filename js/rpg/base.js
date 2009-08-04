/**
 * @class Basic feat. Implements ModifierInterface, since a feat can influent other feat (Strength influences MaxHP...).
 * However, feats modify other feats byt adding/multiplying their own (modified) value.
 * @augments RPG.Misc.ModifierInterface
 */
RPG.Feats.BaseFeat = OZ.Class().implement(RPG.Misc.ModifierInterface);
RPG.Feats.BaseFeat.prototype.init = function(baseValue) {
	this._name = "";
	this._abbr = "";
	this._value = null;
	this._modifiers = {};
	this.setValue(baseValue);
}
RPG.Feats.BaseFeat.prototype.baseValue = function() {
	return this._value;
};
RPG.Feats.BaseFeat.prototype.setValue = function(baseValue) {
	this._value = baseValue;
};
RPG.Feats.BaseFeat.prototype.getName = function() {
	return this._name;
};
RPG.Feats.BaseFeat.prototype.getAbbr = function() {
	return this._abbr;
};

/**
 * Returns a feat value, modified by modifierHolder.
 */
RPG.Feats.BaseFeat.prototype.modifiedValue = function(modifierHolder) {
	var feat = this._findConstant();
	var total = this._value + modifierHolder.getModifier(feat, modifierHolder);
	return Math.max(0, total);
}

RPG.Feats.BaseFeat.prototype.standardModifier = function(modifierHolder) {
	var value = this.modifiedValue(modifierHolder);
	var num = (value-11)*10/21;
	return Math.round(num);
}

/**
 * Finds the correct feat constant
 */
RPG.Feats.BaseFeat.prototype._findConstant = function() {
	for (var p in RPG.Feats) {
		if (RPG.Feats[p] == this.constructor) { return p; }
	}
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
RPG.Items.BaseItem.flags.abstr4ct = true;
RPG.Items.BaseItem.prototype.init = function() {
	this._initVisuals();
	this._descriptionPlural = null;
	this._modifiers = {};
	this._amount = 1;
}

/**
 * @see RPG.Misc.SerializableInterface#clone
 */
RPG.Items.BaseItem.prototype.clone = function() {
	var clone = new this.constructor();
	for (var p in this) { clone[p] = this[p]; }

	/* copy modifiers to avoid references */
	clone._modifiers = {};
	for (var feat in this._modifiers) {
		clone._modifiers[feat] = this._modifiers[feat];
	}

	return clone;
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
	
	/* if owner knows original item, let him know also the cloned version */
	var im = RPG.World.getPC().itemMemory();
	if (im.remembers(this)) {
		im.remember(clone);
	}
	
	return clone;
}

RPG.Items.BaseItem.prototype.getAmount = function() {
	return this._amount;
}

RPG.Items.BaseItem.prototype.setAmount = function(amount) {
	this._amount = amount;
	return this;
}

/**
 * Items are described with respect to PC's itemMemory
 * @see RPG.Visual.VisualInterface#describe
 */
RPG.Items.BaseItem.prototype.describe = function() {
	var im = RPG.World.getPC().itemMemory();
	var s = this._describePlural();
	if (im.remembers(this)) {
		var mods = this._describeModifiers();
		if (mods) { s += " " + mods; }
	}
	return s;
}

RPG.Items.BaseItem.prototype._describePlural = function() {
	if (this._amount == 1) {
		return this._description;
	} else {
		var plural = this._descriptionPlural || (this._description + "s");
		return "heap of " + this._amount + " " + plural;
	}
}

RPG.Items.BaseItem.prototype._describeModifiers = function() {
	var dv = this.getModifier(RPG.FEAT_DV);
	var pv = this.getModifier(RPG.FEAT_PV);
	if (dv !== null || pv !== null) {
		dv = dv || 0;
		pv = pv || 0;
		if (dv > 0) { dv = "+"+dv; }
		if (pv > 0) { pv = "+"+pv; }
		return "["+dv+","+pv+"]";
	}
	return "";
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
	var im = RPG.World.getPC().itemMemory();
	
	for (var i=0;i<listOfItems.length;i++) {
		var item = listOfItems[i];
		if (item.isSameAs(this)) {
			/* merge! */
			item.setAmount(item.getAmount() + this.getAmount());
			
			if (im.remembers(this)) { 
				/* this item was remembered, mark the heap as remembered as well */
				im.remember(item); 
				/* item disappears, remove from memory */
				im.forget(this);
			}
			return true;
		}
	}
	
	listOfItems.push(this);
	return false;
}

/**
 * @class Basic race
 * @augments RPG.Visual.VisualInterface
 */
RPG.Races.BaseRace = OZ.Class().implement(RPG.Visual.VisualInterface);
RPG.Races.BaseRace.prototype.init = function() {
	this._initVisuals();
	this._slots = [];
	this._headSlot = null;
	this._meleeSlot = null;
	this._rangedSlot = null;
	this._kickSlot = null;
	
	this._defaults = {};
}

RPG.Races.BaseRace.prototype.getDefaults = function() {
	return this._defaults;
}

RPG.Races.BaseRace.prototype.getSlots = function() {
	return this._slots;
}

RPG.Races.BaseRace.prototype.getMeleeSlot = function() {
	return this._meleeSlot;
}

RPG.Races.BaseRace.prototype.getRangedSlot = function() {
	return this._rangedSlot;
}

RPG.Races.BaseRace.prototype.getFeetSlot = function() {
	return this._feetSlot;
}

RPG.Races.BaseRace.prototype.getHeadSlot = function() {
	return this._headSlot;
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

/** 
 * @class Basic action
 */
RPG.Actions.BaseAction = OZ.Class();

/**
 * @param {?} source Something that performs this action
 * @param {?} target Action target
 * @param {?} params Any params necessary
 */
RPG.Actions.BaseAction.prototype.init = function(source, target, params) {
	this._source = source;
	this._target = target;
	this._params = params;
	this._tookTime = true;
}
RPG.Actions.BaseAction.prototype.getSource = function() {
	return this._source;
}
RPG.Actions.BaseAction.prototype.getTarget = function() {
	return this._target;
}
/**
 * @returns {bool} Did this action took some time?
 */
RPG.Actions.BaseAction.prototype.tookTime = function() {
	return this._tookTime;
}
/**
 * Process this action
 */
RPG.Actions.BaseAction.prototype.execute = function() {
}

RPG.Actions.BaseAction.prototype._describeLocal = function() {
	var pc = RPG.World.getPC();
	var cell = pc.getCell();
	
	var f = cell.getFeature();
	if (f && f.knowsAbout(pc)) {
		RPG.UI.buffer.message("You see " + f.describeA() + ".");
	}
	
	var items = cell.getItems();
	if (items.length > 1) {
		RPG.UI.buffer.message("Several items are lying here.");
	} else if (items.length == 1) {
		var item = items[0];
		var str = item.describeA(pc).capitalize();
		str += " is lying here.";
		RPG.UI.buffer.message(str);
	}
}

RPG.Actions.BaseAction.prototype._describeRemote = function(coords) {
	var map = RPG.World.getMap();
	var pc = RPG.World.getPC();
	
	if (!pc.canSee(coords)) {
		RPG.UI.buffer.message("You do not see that place.");
		return;
	}
	
	var cell = map.at(coords);
	
	var b = cell.getBeing();
	if (b) {
		if (b == pc) {
			RPG.UI.buffer.message("You see yourself. You are " + b.woundedState() + " wounded.");
		} else {
			var str = "";
			str += "You see " + b.describeA()+". ";
			str += b.describeHe().capitalize() + " is " + b.woundedState() + " wounded. ";
			if (b.isHostile(pc)) {
				str += b.describeThe().capitalize() + " is hostile.";
			} else {
				str += b.describeThe().capitalize() + " does not seem to be hostile.";
			}
			RPG.UI.buffer.message(str);
		}
		return;
	}
	
	var arr = [];
	
	var f = cell.getFeature();
	if (f && f.knowsAbout(pc)) {
		arr.push(f.describeA());
	}
	
	var items = cell.getItems();
	if (items.length > 1) {
		arr.push("several items");
	} else if (items.length > 0) {
		arr.push(items[0].describeA(pc));
	}
	
	if (!arr.length) {
		arr.push(cell.describeA());
	}

	RPG.UI.buffer.message("You see " + arr.join(" and ")+".");
}


/**
 * @class Body part - place for an item
 * @augments RPG.Misc.SerializableInterface
 */
RPG.Slots.BaseSlot = OZ.Class().implement(RPG.Misc.SerializableInterface);
RPG.Slots.BaseSlot.prototype.init = function(name, allowed) {
	this._item = null;
	this._being = null;
	this._name = name;
	this._allowed = allowed;
}

RPG.Slots.BaseSlot.prototype.setBeing = function(being) {
	this._being = being;
	return this;
}

RPG.Slots.BaseSlot.prototype.filterAllowed = function(itemList) {
	var arr = [];
	for (var i=0;i<itemList.length;i++) {
		var item = itemList[i];
		for (var j=0;j<this._allowed.length;j++) {
			var allowed = this._allowed[j];
			if (item instanceof allowed) { arr.push(item); }
		}
	}
	return arr;
}

RPG.Slots.BaseSlot.prototype.setItem = function(item) {
	this._item = item;
}

RPG.Slots.BaseSlot.prototype.getItem = function() {
	return this._item;
}

RPG.Slots.BaseSlot.prototype.getName = function() {
	return this._name;
}
