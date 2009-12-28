/**
 * @class Basic feat, can be modified.
 */
RPG.Feats.BaseFeat = OZ.Class();
RPG.Feats.BaseFeat.prototype.init = function(owner, baseValue) {
	this._owner = owner;

	this._value = null;
	this._base = 0;
	this._modified = 0;
	
	this.setBase(baseValue);
}

RPG.Feats.BaseFeat.prototype.getValue = function() {
	return this._value;
}

RPG.Feats.BaseFeat.prototype.getBase = function() {
	return this._base;
}

RPG.Feats.BaseFeat.prototype.setBase = function(base) {
	this._base = base;
	this._value = Math.max(0, base + this._modified);
	return this._value;
}

RPG.Feats.BaseFeat.prototype.setModified = function(value) {
	this._modified = value;
	this._value = Math.max(0, this._base + value);
	return this._value;
}

/**
 * @class Advanced feat holds a value + modifies other feats.
 * @augments RPG.Feats.BaseFeat
 * @augments RPG.Misc.IModifier
 */
RPG.Feats.AdvancedFeat = OZ.Class()
							.extend(RPG.Feats.BaseFeat)
							.implement(RPG.Misc.IModifier);

/**
 * @param {number} baseValue
 * @param {RPG.Beings.BaseBeing} owner
 */
RPG.Feats.AdvancedFeat.prototype.init = function(owner, baseValue) {
	this.parent(owner, baseValue);
	this._modifiers = {};
}

RPG.Feats.AdvancedFeat.prototype.getModifier = function(feat) {
	var item = this._modifiers[feat];
	if (!item) { return 0; }
	return Math.round(item[0] + item[1]*this._value);
}

RPG.Feats.AdvancedFeat.prototype._drd = function() {
	return [-11*10/21, 10/21];
}

/**
 * @class Basic item
 * @augments RPG.Misc.IVisual
 * @augments RPG.Misc.IModifier
 * @augments RPG.Misc.ISerializable
 */
RPG.Items.BaseItem = OZ.Class()
						.implement(RPG.Misc.IVisual)
						.implement(RPG.Misc.IModifier)
						.implement(RPG.Misc.ISerializable);
RPG.Items.BaseItem.factory.ignore = true;
RPG.Items.BaseItem.prototype.init = function() {
	this._initVisuals();
	this._descriptionPlural = null;
	this._modifiers = {};
	this._amount = 1;
	this._uncountable = false;
	this._remembered = false;
}

/**
 * @see RPG.Misc.ISerializable#clone
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
 * Create an item which represents a subset of this item
 * @param {int} amount How many items do we subtract?
 * @returns {RPG.Items.BaseItem} Sub-heap
 */
RPG.Items.BaseItem.prototype.subtract = function(amount) {
	if (amount == 0 || amount >= this._amount) { throw new Error("Incorrect amount to subtract"); }
	var clone = this.clone();
	
	this.setAmount(this._amount - amount);
	clone.setAmount(amount);
	
	/* if the original item was remembered, let him know also the cloned version */
	if (this._remembered) { clone.remember(); }
	
	return clone;
}

RPG.Items.BaseItem.prototype.getAmount = function() {
	return this._amount;
}

RPG.Items.BaseItem.prototype.setAmount = function(amount) {
	this._amount = amount;
	return this;
}

RPG.Items.BaseItem.prototype.remember = function() {
	this._remembered = true;
}

/**
 * Items are described with respect to their "remembered" state
 * @see RPG.Misc.IVisual#describe
 */
RPG.Items.BaseItem.prototype.describe = function() {
	var s = "";
	if (this._amount == 1) {
		s += this._description;
	} else {
		s += "heap of " + this._amount + " ";
		s += this._descriptionPlural || (this._description + "s");
	}

	if (this._remembered) { /* known items show modifiers, if any */
		var mods = this._describeModifiers();
		if (mods) { s += " " + mods; }
	}

	return s;
}

/**
 * Return are/is string for this item
 * @returns {string}
 */
RPG.Items.BaseItem.prototype.describeIs = function() {
	if (this._amount == 1) {
		return (this._uncountable ? "are" : "is");
	} else { return "is"; }
}

RPG.Items.BaseItem.prototype.describeA = function() {
	if (this._uncountable) {
		return this.describe();
	} else {
		return RPG.Misc.IVisual.prototype.describeA.call(this);
	}
}

RPG.Items.BaseItem.prototype._describeModifiers = function() {
	var mods = this.getModified();
	var dv = null;
	var pv = null;
	var arr = [];

	for (var i=0;i<mods.length;i++) {
		var c = mods[i];
		if (c == RPG.FEAT_DV) { dv = c; }
		if (c == RPG.FEAT_PV) { pv = c; }
		if (RPG.ATTRIBUTES.indexOf(c) != -1) {
			var a = RPG.Feats[c];
			var str = a.name.capitalize().substring(0, 3);
			var num = this.getModifier(c);
			if (num >= 0) { num = "+"+num; }
			arr.push("{"+str+num+"}");
		}
	}
	
	if (dv || pv) {
		dv = this.getModifier(RPG.FEAT_DV);
		pv = this.getModifier(RPG.FEAT_PV);
		if (dv >= 0) { dv = "+"+dv; }
		if (pv >= 0) { pv = "+"+pv; }
		arr.unshift("["+dv+","+pv+"]");
	}
	
	return arr.join(" ");
}

/**
 * Can this item be merged with other one? This is possible only when items are truly the same.
 * @param {RPG.Items.BaseItem}
 */
RPG.Items.BaseItem.prototype.isSameAs = function(item) {
	if (item.constructor != this.constructor) { return false; }
	
	for (var p in this._modifiers) {
		if (item._modifiers[p] != this._modifiers[p]) { return false; }
	}
	
	for (var p in item._modifiers) {
		if (item._modifiers[p] != this._modifiers[p]) { return false; }
	}

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
			/* this item was remembered, mark the heap as remembered as well */
			if (this._remembered) { item.remember(); }
			return true;
		}
	}
	
	listOfItems.push(this);
	return false;
}

/**
 * @class Basic race
 * @augments RPG.Misc.IVisual
 */
RPG.Races.BaseRace = OZ.Class().implement(RPG.Misc.IVisual);
RPG.Races.BaseRace.name = "";
RPG.Races.BaseRace.image = "";
RPG.Races.BaseRace.prototype.init = function() {
	this._initVisuals();
	this._slots = {};
	this._defaults = {};
	this._defaults[RPG.FEAT_REGEN_HP] = 10; /* per 100 turns */
	this._defaults[RPG.FEAT_REGEN_MANA] = 10; /* per 100 turns */
	this._defaults[RPG.FEAT_SIGHT_RANGE] = 4;
}

RPG.Races.BaseRace.prototype.getDefaults = function() {
	return this._defaults;
}

RPG.Races.BaseRace.prototype.getImage = function() {
	return this.constructor.image;
}

RPG.Races.BaseRace.prototype.getSlots = function() {
	return this._slots;
}

RPG.Races.BaseRace.prototype.getSlot = function(type) {
	return this._slots[type] || null;
}

/**
 * @class Basic per-turn effect
 * @augments RPG.Misc.ISerializable
 */
RPG.Effects.BaseEffect = OZ.Class().implement(RPG.Misc.ISerializable);
RPG.Effects.BaseEffect.prototype.init = function(being) {
	this._being = being;
}
RPG.Effects.BaseEffect.prototype.go = function() {
}

/*
 	if (!window.__log) { window.__log = []; }
	var caller = arguments.callee.caller;
	var found = false;
	for (var i=0;i<__log.length;i++) {
		var item = window.__log[i];
		if (item[0] == caller) { item[1]++; found = true; }
	}
	if (!found) { window.__log.push([caller, 1]); }
*/

/**
 * @class Body part - place for an item
 * @augments RPG.Misc.ISerializable
 */
RPG.Slots.BaseSlot = OZ.Class().implement(RPG.Misc.ISerializable);
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
		if (item instanceof this._allowed) { arr.push(item); }
	}
	return arr;
}

RPG.Slots.BaseSlot.prototype.setItem = function(item) {
	var it = item;
	
	if (it) {
		if (it.getAmount() == 1) {
			if (this._being.hasItem(it)) {
				this._being.removeItem(it);
			}
		} else {
			it = it.subtract(1);
		}
	}
	
	this._item = it;
	return it;
}

RPG.Slots.BaseSlot.prototype.getItem = function() {
	return this._item;
}

RPG.Slots.BaseSlot.prototype.getName = function() {
	return this._name;
}

/**
 * @class Base profession
 * @augments RPG.Misc.IVisual
 */
RPG.Professions.BaseProfession = OZ.Class().implement(RPG.Misc.IVisual);
RPG.Professions.BaseProfession.name = "";
RPG.Professions.BaseProfession.image = "";
RPG.Professions.BaseProfession.init = function() {
}
RPG.Professions.BaseProfession.prototype.setup = function(being) {
	var tmp = new RPG.Items.HealingPotion();
	being.addItem(tmp);

	var tmp = new RPG.Items.IronRation();
	being.addItem(tmp);
	
	var tmp = new RPG.Items.Torch();
	being.addItem(tmp);
}

RPG.Professions.BaseProfession.prototype.getImage = function() {
	return this.constructor.image;
}

/**
 * @class Quest
 */
RPG.Quests.BaseQuest = OZ.Class();
RPG.Quests.BaseQuest.prototype.init = function(giver) {
	this._phase = RPG.QUEST_NEW;
	this._giver = giver;
	this._task = null;
}
RPG.Quests.BaseQuest.prototype.setPhase = function(phase) {
	this._phase = phase;
	
	switch (phase) {
		case RPG.QUEST_GIVEN:
			RPG.World.pc.addQuest(this);
		break;
		case RPG.QUEST_DONE:
			RPG.UI.buffer.important("You have just completed a quest.");
		break;
		case RPG.QUEST_REWARDED:
			RPG.World.pc.removeQuest(this);
			this.reward();
		break;
	}
	
	return this;
}
RPG.Quests.BaseQuest.prototype.getPhase = function() {
	return this._phase;
}
RPG.Quests.BaseQuest.prototype.getGiver = function() {
	return this._giver;
}
RPG.Quests.BaseQuest.prototype.getTask = function() {
	return this._task;
}
RPG.Quests.BaseQuest.prototype.setTask = function(task) {
	this._task = task;
	return this;
}
RPG.Quests.BaseQuest.prototype.reward = function() {
}

