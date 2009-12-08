/**
 * @class Basic being
 * @augments RPG.Visual.IVisual
 * @augments RPG.Engine.IActor
 */
RPG.Beings.BaseBeing = OZ.Class()
						.implement(RPG.Visual.IVisual)
						.implement(RPG.Engine.IActor);
RPG.Beings.BaseBeing.prototype.init = function(race) {
	this._initVisuals();
	this._trapMemory = new RPG.Memory.TrapMemory();

	this._name = "";
	this._race = null;
	this._cell = null;
	this._chat = null;
	this._gender = RPG.GENDER_NEUTER;
	this._items = [];
	this._stats = {};
	this._feats = {};
	this._alive = true;
	this._effects = [];
	this._turnCounter = null;
	this._modifierList = [];

	this._setRace(race);
	this._initStatsAndFeats();
}

RPG.Beings.BaseBeing.prototype.trapMemory = function() {
	return this._trapMemory;
}

/**
 * Prepare the being-race binding
 */
RPG.Beings.BaseBeing.prototype._setRace = function(race) {
	this._race = race;

	/* inherit color+image from race */
	this._color = race.getColor();
	this._char = race.getChar();
	this._image = race.getImage();
	
	/* bind all slots to a particular being */
	var slots = race.getSlots();
	for (var i=0;i<slots.length;i++) { slots[i].setBeing(this); }
}

/**
 * Initialize stats (HP, ...) and feats (MaxHP, DV, PV, ...)
 */
RPG.Beings.BaseBeing.prototype._initStatsAndFeats = function() {
	var defaults = this._race.getDefaults();
	
	this._stats = {};
	this._stats[RPG.STAT_HP] = 0;
	this._stats[RPG.STAT_MANA] = 0;
	
	this._feats = {};
	
	/* advanced feats aka attributes */
	for (var i=0;i<RPG.ATTRIBUTES.length;i++) {
		var attr = RPG.ATTRIBUTES[i];
		var rv = new RPG.Misc.RandomValue(defaults[attr], 2);
		var f = new RPG.Feats[attr](this, rv.roll());
		this._feats[attr] = f;
		this._modifierList.push(f);
	}

	/* base feats */
	var misc = [RPG.FEAT_MAXHP, RPG.FEAT_MAXMANA, RPG.FEAT_DV, 
				RPG.FEAT_PV, RPG.FEAT_SPEED, RPG.FEAT_HIT, 
				RPG.FEAT_DAMAGE, RPG.FEAT_MAGICDAMAGE];
	for (var i=0;i<misc.length;i++) {
		var name = misc[i];
		this._feats[name] = new RPG.Feats.BaseFeat(this, defaults[name] || 0);
	}
	
	for (var p in this._feats) { this.updateFeat(p); }
	
	var regen = new RPG.Effects.Regeneration(this);
	this.addEffect(regen);
	var regen = new RPG.Effects.ManaRegeneration(this);
	this.addEffect(regen);

	this.fullStats();
}

/**
 * @param {SMap.Misc.Coords}
 */
RPG.Beings.BaseBeing.prototype.setCell = function(cell) {
	this._cell = cell;
	return this;
}

RPG.Beings.BaseBeing.prototype.getCell = function() {
	return this._cell;
}

/**
 * @param {string}
 */
RPG.Beings.BaseBeing.prototype.setName = function(name) {
	this._name = name;
	return this;
}

RPG.Beings.BaseBeing.prototype.getName = function() {
	return this._name;
}

RPG.Beings.BaseBeing.prototype.addItem = function(item) { 
	item.mergeInto(this._items);
}

RPG.Beings.BaseBeing.prototype.removeItem = function(item) { 
	var index = this._items.indexOf(item);
	if (index == -1) { throw new Error("Item '"+item.describe()+"' not found!"); }
	this._items.splice(index, 1);
	return this;
}

RPG.Beings.BaseBeing.prototype.equipItem = function(item, slot) {
	if (slot.getItem()) { this.unequipItem(slot.getItem(), slot); }
	
	if (item.getAmount() == 1) {
		this.removeItem(item);
	} else {
		item = item.subtract(1);
	}
	slot.setItem(item);

	this._modifierList.push(item);
	this._updateFeatsByModifier(item);
}

RPG.Beings.BaseBeing.prototype.unequipItem = function(item, slot) {
	var index = this._modifierList.indexOf(item);
	if (index == -1) { throw new Error("Cannot find item '"+item+"'"); }

	slot.setItem(null);
	this.addItem(item);
	
	this._modifierList.splice(index, 1);
	this._updateFeatsByModifier(item);
}

RPG.Beings.BaseBeing.prototype._updateFeatsByModifier = function(item) {
	var list = item.getModified();
	for (var i=0;i<list.length;i++) {
		this.updateFeat(list[i]);
	}
}

RPG.Beings.BaseBeing.prototype.getItems = function() { 
	return this._items;
}

RPG.Beings.BaseBeing.prototype.setChat = function(chat) {
	this._chat = chat;
	return this;
}

RPG.Beings.BaseBeing.prototype.getChat = function() {
	return this._chat;
}


/**
 * Return all available slots
 */
RPG.Beings.BaseBeing.prototype.getSlots = function() {
	return this._race.getSlots();
}

RPG.Beings.BaseBeing.prototype.getMeleeSlot = function() {
	return this._race.getMeleeSlot();
}

RPG.Beings.BaseBeing.prototype.getFeetSlot = function() {
	return this._race.getFeetSlot();
}

RPG.Beings.BaseBeing.prototype.getHeadSlot = function() {
	return this._race.getHeadSlot();
}

/**
 * Return he/she/it string for this being
 * @returns {string}
 */
RPG.Beings.BaseBeing.prototype.describeHe = function() {
	var table = {};
	table[RPG.GENDER_MALE] = "he";
	table[RPG.GENDER_FEMALE] = "she";
	table[RPG.GENDER_NEUTER] = "it";
	
	return table[this._gender];
}

/**
 * Return him/her/it string for this being
 * @returns {string}
 */
RPG.Beings.BaseBeing.prototype.describeHim = function() {
	var table = {};
	table[RPG.GENDER_MALE] = "him";
	table[RPG.GENDER_FEMALE] = "her";
	table[RPG.GENDER_NEUTER] = "it";
	
	return table[this._gender];
}

/**
 * Return his/hers/its string for this being
 * @returns {string}
 */
RPG.Beings.BaseBeing.prototype.describeHis = function() {
	var table = {};
	table[RPG.GENDER_MALE] = "his";
	table[RPG.GENDER_FEMALE] = "hers";
	table[RPG.GENDER_NEUTER] = "its";
	
	return table[this._gender];
}

/**
 * Return are/is string for this being
 * @returns {string}
 */
RPG.Beings.BaseBeing.prototype.describeIs = function() {
	return "";
}

RPG.Beings.BaseBeing.prototype.getEffects = function() {
	return this._effects;
}

RPG.Beings.BaseBeing.prototype.addEffect = function(e) {
	this._effects.push(e);
	return this;
}

RPG.Beings.BaseBeing.prototype.removeEffect = function(e) {
	var index = this._effects.indexOf(e);
	if (index == -1) { throw new Error("Cannot find effect"); }
	this._effects.splice(index, 1);
	return this;
}

RPG.Beings.BaseBeing.prototype.getStat = function(stat) {
	return this._stats[stat];
}

RPG.Beings.BaseBeing.prototype.adjustStat = function(stat, diff) {
	return this.setStat(stat, this._stats[stat] + diff);
}

RPG.Beings.BaseBeing.prototype.setStat = function(stat, value) {
	switch (stat) {
		case RPG.STAT_HP:
			this._stats[stat] = Math.min(value, this._feats[RPG.FEAT_MAXHP].getValue());
		break;

		case RPG.STAT_MANA:
			this._stats[stat] = Math.min(value, this._feats[RPG.FEAT_MAXMANA].getValue());
		break;
	}
	
	if (this._stats[RPG.STAT_HP] <= 0) { this.die(); }
	return this._stats[stat];
}

RPG.Beings.BaseBeing.prototype.updateFeat = function(feat) {
	var f = this._feats[feat];
	var modifier = 0;
	for (var i=0;i<this._modifierList.length;i++) {
		modifier += this._modifierList[i].getModifier(feat);
	}
	f.setModified(modifier);
	
	if (f instanceof RPG.Feats.AdvancedFeat) {
		var modified = f.getModified();
		for (var i=0;i<modified.length;i++) {
			this.updateFeat(modified[i]);
		}
	}
	
	return f.getValue();
}

RPG.Beings.BaseBeing.prototype.getFeat = function(feat) {
	return this._feats[feat].getValue();
}

RPG.Beings.BaseBeing.prototype.setFeat = function(feat, value) {
	return this._feats[feat].setBase(value);
}

RPG.Beings.BaseBeing.prototype.adjustFeat = function(feat, diff) {
	return this.setFeat(feat, this._feats[feat].getBase() + diff);
}

/**
 * @see RPG.Engine.IActor#getSpeed
 */
RPG.Beings.BaseBeing.prototype.getSpeed = function() {
	return this.getFeat(RPG.FEAT_SPEED);
}

/* ============================== MISC ==================================== */

RPG.Beings.BaseBeing.prototype.isAlive = function() {
	return this._alive;
}

/**
 * Fully recovers all stats to maximum
 */
RPG.Beings.BaseBeing.prototype.fullStats = function() {
	this.setStat(RPG.STAT_HP, this._feats[RPG.FEAT_MAXHP].getValue());
	this.setStat(RPG.STAT_MANA, this._feats[RPG.FEAT_MAXMANA].getValue());
}

/**
 * How far can this being see
 * @returns {int}
 */
RPG.Beings.BaseBeing.prototype.sightDistance = function() {
	return 5; /* FIXME this should depend on perception or so */
}

/**
 * This being drops everything it holds.
 */
RPG.Beings.BaseBeing.prototype.dropAll = function() {
	for (var i=0;i<this._items.length;i++) { /* drop items */
		if (Math.randomPercentage() < 81) {
			this._cell.addItem(this._items[i]);
		}
	}
	this._items = [];
	
	var slots = this._race.getSlots();
	for (var i=0;i<slots.length;i++) {
		var s = slots[i];
		var it = s.getItem();
		s.setItem(null);

		if (it && Math.randomPercentage() < 81) { 
			this._cell.addItem(it); 
		}
	}
}

/**
 * This being dies
 */
RPG.Beings.BaseBeing.prototype.die = function() {
	this._alive = false;
	this.dropAll();
	
	if (Math.randomPercentage() < 34) {
		var corpse = new RPG.Items.Corpse().setBeing(this);
		this._cell.addItem(corpse);
	}
	RPG.World.action(new RPG.Actions.Death(this)); 
}

/**
 * Can this being see target coords?
 * @param {RPG.Misc.Coords} target
 * @returns {bool}
 */
RPG.Beings.BaseBeing.prototype.canSee = function(target) {
	var source = this._cell.getCoords();
	var map = this._cell.getMap();
	if (source.distance(target) <= 1) { return true; } /* optimalization: can see self & surroundings */
	if (source.distance(target) > this.sightDistance()) { return false; } 

	/* direct visibility */
	if (map.lineOfSight(source,target)) { return true; }

	/* test alternate starting cell for validity */
	var offsets = [
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1]
	];
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=0;i<offsets.length;i++) {
		c.x = source.x + offsets[i][0];
		c.y = source.y + offsets[i][1];
		if (!map.isValid(c) || !map.at(c).isFree()) { continue; }
		if (map.lineOfSight(c, target)) { return true; }
	}

	return false;
}

RPG.Beings.BaseBeing.prototype.woundedState = function() {
	var def = ["slightly", "moderately", "severly", "critically"];
	var hp = this._stats[RPG.STAT_HP];
	var max = this._feats[RPG.FEAT_MAXHP].getValue();
	if (hp == max) { return "not"; }
	var frac = 1 - hp/max;
	var index = Math.floor(frac * def.length);
	return def[index];
}
