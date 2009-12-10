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
 * @augments RPG.Visual.IVisual
 * @augments RPG.Misc.IModifier
 * @augments RPG.Misc.ISerializable
 */
RPG.Items.BaseItem = OZ.Class()
						.implement(RPG.Visual.IVisual)
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
 * Create an item which represent a subset of this item
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
 * @see RPG.Visual.IVisual#describe
 */
RPG.Items.BaseItem.prototype.describe = function() {
	var s = "";
	if (this._amount == 1) {
		s += this._description;
	} else {
		s += "heap of " + this._amount + " ";
		s += this._descriptionPlural || (this._description + "s");
	}

	if (this._remembered) {
		var mods = this._describeModifiers();
		if (mods) { s += " " + mods; }
	}

	return s;
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
 * Return are/is string for this item
 * @returns {string}
 */
RPG.Items.BaseItem.prototype.describeIs = function() {
	if (this._amount == 1) {
		return (this._uncountable ? "are" : "is");
	} else { return "is"; }
}


/**
 * @class Basic race
 * @augments RPG.Visual.IVisual
 */
RPG.Races.BaseRace = OZ.Class().implement(RPG.Visual.IVisual);
RPG.Races.BaseRace.name = "";
RPG.Races.BaseRace.image = "";
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

RPG.Races.BaseRace.prototype.getImage = function() {
	return this.constructor.image;
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
 * @augments RPG.Misc.ISerializable
 */
RPG.Effects.BaseEffect = OZ.Class().implement(RPG.Misc.ISerializable);
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
 	if (!window.__log) { window.__log = []; }
	var caller = arguments.callee.caller;
	var found = false;
	for (var i=0;i<__log.length;i++) {
		var item = window.__log[i];
		if (item[0] == caller) { item[1]++; found = true; }
	}
	if (!found) { window.__log.push([caller, 1]); }

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
	var pc = RPG.World.pc;
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
		var str = item.describeA().capitalize();
		str += " " + item.describeIs() + " ";
		str += "lying here.";
		RPG.UI.buffer.message(str);
	}
}

RPG.Actions.BaseAction.prototype._describeRemote = function(cell) {
	var pc = RPG.World.pc;
	var coords = cell.getCoords();
	
	if (!pc.canSee(coords)) {
		RPG.UI.buffer.message("You do not see that place.");
		return;
	}
	
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

/**
 * @class Base abstract spell
 * @augments RPG.Misc.ISerializable
 * @augments RPG.Misc.IWeapon
 * @augments RPG.Visual.IVisual
 */
RPG.Spells.BaseSpell = OZ.Class()
						.implement(RPG.Misc.ISerializable)
						.implement(RPG.Misc.IWeapon)
						.implement(RPG.Visual.IVisual);
RPG.Spells.BaseSpell.factory.ignore = true;
RPG.Spells.BaseSpell.cost = null;
RPG.Spells.BaseSpell.name = "";
RPG.Spells.BaseSpell.damage = null;

RPG.Spells.BaseSpell.prototype.init = function(caster) {
	this._initVisuals();
	
	this._type = RPG.SPELL_SELF;
	this._caster = caster;
	this._hit = null;
	this._damage = null;
}

RPG.Spells.BaseSpell.prototype.describe = function() {
	return this.constructor.name;
}

RPG.Spells.BaseSpell.prototype.cast = function(target) {
}

RPG.Spells.BaseSpell.prototype.getCost = function() { 
	return this.constructor.cost;
}

RPG.Spells.BaseSpell.prototype.getType = function() { 
	return this._type;
}

RPG.Spells.BaseSpell.prototype.getDamage = function() {
	var base = this.constructor.damage;
	var m = base.mean + this._caster.getFeat(RPG.FEAT_DAMAGE_MAGIC);
	var v = base.variance;
	return new RPG.Misc.RandomValue(m, v);
}

RPG.Spells.BaseSpell.prototype.getCaster = function() {
	return this._caster;
}

/**
 * @class Base profession
 * @augments RPG.Visual.IVisual
 */
RPG.Professions.BaseProfession = OZ.Class().implement(RPG.Visual.IVisual);
RPG.Professions.BaseProfession.name = "";
RPG.Professions.BaseProfession.image = "";
RPG.Professions.BaseProfession.init = function() {
}
RPG.Professions.BaseProfession.prototype.setup = function(being) {
}
RPG.Professions.BaseProfession.prototype.getImage = function() {
	return this.constructor.image;
}
