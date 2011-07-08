/**
 * @class Basic feat, can be modified.
 */
RPG.Feats.BaseFeat = OZ.Class();
RPG.Feats.BaseFeat.prototype.init = function(baseValue) {
	this._value = null;
	this._base = 0;
	this._modifier = 0;
	
	this.setBase(baseValue);
}

RPG.Feats.BaseFeat.prototype.getValue = function() {
	return this._value;
}

RPG.Feats.BaseFeat.prototype.getBase = function() {
	return this._base;
}

RPG.Feats.BaseFeat.prototype.getTotalModifier = function() {
	return this._modifier;
}

RPG.Feats.BaseFeat.prototype.setBase = function(base) {
	this._base = base;
	this._value = Math.max(0, base + this._modifier);
	return this._value;
}

RPG.Feats.BaseFeat.prototype.setModifier = function(value) {
	this._modifier = value;
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
RPG.Feats.AdvancedFeat.prototype.init = function(baseValue) {
	this.parent(baseValue);
	this._modifiers = {};
}

RPG.Feats.AdvancedFeat.prototype.getModifier = function(feat) {
	var item = this._modifiers[feat];
	if (!item) { return 0; }
	return Math.round(item[0] + item[1]*this._value);
}

RPG.Feats.AdvancedFeat.prototype._drd = function() {
	return [(-11*10/21).round(3), (10/21).round(3)];
}

/**
 * @class Basic race
 * @augments RPG.Visual.IVisual
 */
RPG.Races.BaseRace = OZ.Class().implement(RPG.Visual.IVisual);
RPG.Races.BaseRace.prototype.init = function() {
	this._slots = {};
	this._defaults = {};
	this._defaults[RPG.FEAT_REGEN_HP] = 10; /* per 100 turns */
	this._defaults[RPG.FEAT_REGEN_MANA] = 10; /* per 100 turns */
	this._defaults[RPG.FEAT_SIGHT_RANGE] = 4;
}

RPG.Races.BaseRace.prototype.getDefaults = function() {
	return this._defaults;
}

RPG.Races.BaseRace.prototype.getSlots = function() {
	return this._slots;
}

/**
 * @class Basic per-turn effect: represents a condition for a being.
 * Effects have various qualities:
 *  - they may hold modifiers,
 *  - they are eneterable,
 *  - they may have a limited duration,
 *  - additionally, they can perform anything during being's turn
 * @augments RPG.Misc.IEnterable
 */
RPG.Effects.BaseEffect = OZ.Class().implement(RPG.Misc.IEnterable);
RPG.Effects.BaseEffect.prototype.init = function(turnsRemaining) {
	this._modifiers = {};
	this._being = null;
	this._turnsRemaining = turnsRemaining || 0;
}

RPG.Effects.BaseEffect.prototype.go = function() {
	if (this._turnsRemaining) {
		this._turnsRemaining--;
		if (!this._turnsRemaining) { this._being.removeEffect(this); }
	}
}

RPG.Effects.BaseEffect.prototype.entering = function(being) {
	this._being = being;
	return this.parent(being);
}

/**
 * @class Body part - place for an item
 */
RPG.Slots.BaseSlot = OZ.Class();
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
		if (item instanceof this._allowed && !item.isUnpaid()) { arr.push(item); }
	}
	return arr;
}

RPG.Slots.BaseSlot.prototype.setItem = function(item) {
	var it = item;
	
	if (it) {
		if (it.getAmount() == 1) {
			if (this._being.hasItem(it)) { this._being.removeItem(it); }
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
 * @augments RPG.Visual.IVisual
 */
RPG.Professions.BaseProfession = OZ.Class().implement(RPG.Visual.IVisual);
RPG.Professions.BaseProfession.prototype.setup = function(being) {
	var tmp = new RPG.Items.HealingPotion();
	being.addItem(tmp);

	var tmp = new RPG.Items.IronRation();
	being.addItem(tmp);
}

/**
 * @class Quest
 */
RPG.Quests.BaseQuest = OZ.Class();
RPG.Quests.BaseQuest.prototype.init = function(giver) {
	this._phase = null;
	this._giver = giver;
	this._task = null; /* textual description */
	
	this.setPhase(RPG.QUEST_NEW);
}

RPG.Quests.BaseQuest.prototype.setPhase = function(phase) {
	this._phase = phase;
	
	switch (phase) {
		case RPG.QUEST_GIVEN:
			RPG.Game.pc.addQuest(this);
		break;
		case RPG.QUEST_DONE:
			RPG.UI.buffer.important("You have just completed a quest.");
		break;
		case RPG.QUEST_REWARDED:
			RPG.Game.pc.removeQuest(this);
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

