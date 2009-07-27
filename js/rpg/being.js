/**
 * @class Basic being
 * @augments RPG.Visual.VisualInterface
 * @augments RPG.Misc.ModifierInterface
 * @augments RPG.Engine.ActorInterface
 */
RPG.Beings.BaseBeing = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Misc.ModifierInterface)
						.implement(RPG.Engine.ActorInterface);
RPG.Beings.BaseBeing.prototype.init = function() {
	this._initVisuals();
	this._trapMemory = new RPG.Memory.TrapMemory();

	this._modifiers = []; /* to comply with ModifierInterface */

	this._race = null;
	this._cell = null;
	this._chat = null;
	this._gender = null;
	this._items = [];
	this._stats = {};
	this._feats = {};
	this._alive = true;
	this._effects = [];
	this._turnCounter = null;

	this._default = {
		speed: 100,
		maxhp: 5,
		dv: 0,
		pv: 0,
		strength: 9,
		toughness: 9,
		dexterity: 9,
		intelligence: 9
	}
}

RPG.Beings.BaseBeing.prototype.setup = function() {
	this._initStatsAndFeats();

	this.fullHP();
	return this;
}

RPG.Beings.BaseBeing.prototype.trapMemory = function() {
	return this._trapMemory;
}

/**
 * Setup the being-race binding
 */
RPG.Beings.BaseBeing.prototype._setRace = function(race) {
	this._race = race;

	/* inherit color+image from race */
	this._color = race.getColor();
	this._char = race.getChar();
	this._image = race.getImage();
	
	/* bind all slots to a particular being */
	var slots = race.getSlots();
	for (var i=0;i<slots.length;i++) { slots[i].setup(this); }
}

/**
 * Initialize stats (HP) and feats (MaxHP, DV, PV)
 */
RPG.Beings.BaseBeing.prototype._initStatsAndFeats = function() {
	this._stats = {
		hp: 0
	}
	this._feats = {
		maxhp: new RPG.Feats.MaxHP(this._default.maxhp),
		dv: new RPG.Feats.DV(this._default.dv),
		pv: new RPG.Feats.PV(this._default.pv),
		speed: new RPG.Feats.Speed(this._default.speed)
	}
	
	var attrs = {
		strength: RPG.Feats.Strength,
		toughness: RPG.Feats.Toughness,
		intelligence: RPG.Feats.Intelligence,
		dexterity: RPG.Feats.Dexterity
	}
	for (var name in attrs) {
		var ctor = attrs[name];
		var rv = new RPG.Misc.RandomValue(this._default[name], 2)
		this._feats[name] = new ctor(rv.roll());
	}
	
	var regen = new RPG.Effects.Regeneration(this);
	this.addEffect(regen);
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

RPG.Beings.BaseBeing.prototype.addItem = function(item) { 
	var result = item.mergeInto(this._items);
	if (!result) { this._itemMemory.remember(item); }
	return this;
}

RPG.Beings.BaseBeing.prototype.removeItem = function(item) { 
	var index = this._items.indexOf(item);
	if (index == -1) { throw new Error("Item '"+item.describe()+"' not found!"); }
	this._items.splice(index, 1);
	return this;
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
 * Being combines modifiers from various sources: equipped items, feats, ...
 * @see RPG.Base.ModifierInterface
 */
RPG.Beings.BaseBeing.prototype.getModifier = function(feat, modifierHolder) {
	var modifierHolders = this._getModifierHolders();

	var total = 0;
	for (var i=0;i<modifierHolders.length;i++) {
		var mod = modifierHolders[i].getModifier(feat, modifierHolder);
		if (mod !== null) { total += mod; }
	}
	
	/* FIXME beings should not use _modifiers */
	var val = RPG.Misc.ModifierInterface.prototype.getModifier.call(this, feat, modifierHolder);
	if (val !== null) { total += val; }
	
	return total;
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

RPG.Beings.BaseBeing.prototype.getKickSlot = function() {
	return this._race.getKickSlot();
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

/* ============================= STAT & FEAT GETTERS ============================= */

RPG.Beings.BaseBeing.prototype.getHP = function() {
	return this._stats.hp;
}

RPG.Beings.BaseBeing.prototype.getFeatValue = function(ctor) {
	for (var p in this._feats) {
		var f = this._feats[p];
		if (f instanceof ctor) { return f.modifiedValue(this); }
	}
}

/* FIXME obsolete? */
RPG.Beings.BaseBeing.prototype.getSpeed = function() {
	return this._feats.speed.modifiedValue(this);
}

/* FIXME obsolete? */
RPG.Beings.BaseBeing.prototype.getMaxHP = function() {
	return this._feats.maxhp.modifiedValue(this);
}

/* FIXME obsolete? */
RPG.Beings.BaseBeing.prototype.getDV = function() {
	return this._feats.dv.modifiedValue(this);
}

/* FIXME obsolete? */
RPG.Beings.BaseBeing.prototype.getPV = function() {
	return this._feats.pv.modifiedValue(this);
}

/* ============================== MISC ==================================== */

RPG.Beings.BaseBeing.prototype.isHostile = function() {
	/* FIXME! */
	return true;
}

RPG.Beings.BaseBeing.prototype.isAlive = function() {
	return this._alive;
}

/**
 * Adjust hitpoints by a given amount
 * @param {int} amount
 * @returns {bool} Whether the being still lives
 */
RPG.Beings.BaseBeing.prototype.adjustHP = function(amount) {
	this._stats.hp += amount;
	if (this._stats.hp > this.getMaxHP()) {
		this.fullHP();
	}

	RPG.UI.status.updateHP();

	if (this._stats.hp <= 0) {
		this.die();
		return false;
	} else {
		return true;
	}
}

/**
 * Fully heals the being
 */
RPG.Beings.BaseBeing.prototype.fullHP = function() {
	this._stats.hp = this.getMaxHP();
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
		this._cell.addItem(this._items[i]);
	}
	var slots = this._race.getSlots();
	for (var i=0;i<slots.length;i++) {
		var s = slots[i];
		var it = s.getItem();
		if (it) { this._cell.addItem(it); }
	}
}

/**
 * This being dies
 */
RPG.Beings.BaseBeing.prototype.die = function() {
	this._alive = false;
	this.dropAll();
	
	if (Math.randomPercentage() < 34) {
		var corpse = new RPG.Items.Corpse();
		corpse.setup(this);
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
	var hp = this.getHP();
	var max = this.getMaxHP();
	if (hp == max) { return "not"; }
	var frac = 1 - hp/max;
	var index = Math.floor(frac * def.length);
	return def[index];
}

RPG.Beings.BaseBeing.prototype._getModifierHolders = function() {
	var arr = [];
	for (var p in this._feats) {
		arr.push(this._feats[p]);
	}
	var slots = this._race.getSlots();
	for (var i=0; i<slots.length; i++) {
		var s = slots[i];
		var it = s.getItem();
		if (it) { arr.push(it); }
	}
	return arr;
}
