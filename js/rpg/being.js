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

RPG.Beings.BaseBeing.prototype.init = function(r) {
	this._initVisuals();
	this._modifiers = []; /* to comply with ModifierInterface */

	this._coords = null;
	this._map = null;
	this._chat = null;
	
	this._race = r;
	this._items = [];
	this._gender = RPG.GENDER_NEUTER;
	this._stats = {};
	this._feats = {};
	
	this._weapons = {
		current: null,
		hands: new RPG.Misc.Hands(2, 1),
		foot: new RPG.Misc.Foot(0, 2)
	}

	this._alive = true;
	this._char = this._race.getChar();
	this._color = this._race.getColor();
	this._image = this._race.getImage();
	this._description = this._race.describe();

	this._initStatsAndFeats();

	this.fullHP();
}

/**
 * Initialize stats (HP) and feats (MaxHP, DV, PV)
 */
RPG.Beings.BaseBeing.prototype._initStatsAndFeats = function() {
	this._stats = {
		hp: 0
	}
	this._feats = {
		maxhp: new RPG.Feats.MaxHP(10),
		dv: new RPG.Feats.DV(0),
		pv: new RPG.Feats.PV(0)
	}
	
	var attrs = {
		strength: RPG.Feats.Strength,
		toughness: RPG.Feats.Toughness,
		intelligence: RPG.Feats.Intelligence,
		dexterity: RPG.Feats.Dexterity
	}
	for (var name in attrs) {
		var ctor = attrs[name];
		var dice = new RPG.Misc.Interval(1, 6);
		this._feats[name] = new ctor(dice.roll());
	}
}

/**
 * @param {SMap.Misc.Coords}
 */
RPG.Beings.BaseBeing.prototype.setCoords = function(coords) {
	this._coords = coords;
}

RPG.Beings.BaseBeing.prototype.getCoords = function() {
	return this._coords;
}

RPG.Beings.BaseBeing.prototype.setMap = function(map) {
	this._map = map;
}

RPG.Beings.BaseBeing.prototype.getMap = function() {
	return this._map;
}

RPG.Beings.BaseBeing.prototype.getRace = function() {
	return this._race;
}

RPG.Beings.BaseBeing.prototype.addItem = function(item) { 
	this._items.push(item);
}

RPG.Beings.BaseBeing.prototype.getFoot = function() {
	return this._weapons.foot;
}

RPG.Beings.BaseBeing.prototype.setChat = function(chat) {
	this._chat = chat;
}

RPG.Beings.BaseBeing.prototype.getChat = function() {
	return this._chat;
}

/**
 * Being combines modifiers from various sources: equpped items, feats, race, ...
 * @see RPG.Base.ModifierInterface
 */
RPG.Beings.BaseBeing.prototype.getModifier = function(feat, type, modifierHolder) {
	var modifierHolders = [];
	for (var p in this._feats) {
		modifierHolders.push(this._feats[p]);
	}
	modifierHolders.push(this._race);
	
	var values = [];
	for (var i=0;i<modifierHolders.length;i++) {
		var mod = modifierHolders[i].getModifier(feat, type, modifierHolder);
		if (mod !== null) { values.push(mod); }
	}
	
	var total = (type == RPG.MODIFIER_PLUS ? 0 : 1);
	for (var i=0;i<values.length;i++) {
		if (type == RPG.MODIFIER_PLUS) {
			total += values[i];
		} else {
			total *= values[i];
		}
	}
	return total;
}

/**
 * Sets an item as a current weapon. FIXME this should be reworked into an inventory.
 * @param {RPG.Misc.WeaponInterface}
 */
RPG.Beings.BaseBeing.prototype.setWeapon = function(item) {
	this._weapons.current = item;
}

/**
 * Gets current weapon. FIXME this should be reqorked into an inventory.
 * @returns {RPG.Misc.WeaponInterface}
 */
RPG.Beings.BaseBeing.prototype.getWeapon = function() {
	return this._weapons.current || this._weapons.hands;
}

/**
 * @see RPG.Visual.VisualInterface#getChar
 */
RPG.Beings.BaseBeing.prototype.getChar = function() {
	if (RPG.World.getPC() == this) { 
		return "@"; 
	} else {
		return this._char;
	}
}

/**
 * @see RPG.Visual.VisualInterface#describe
 */
RPG.Beings.BaseBeing.prototype.describe = function() {
	if (RPG.World.getPC() == this) {
		return "you";
	} else {
		return this._description;
	}
}

/**
 * @see RPG.Visual.VisualInterface#describeA
 */
RPG.Beings.BaseBeing.prototype.describeA = function() {
	if (RPG.World.getPC() == this) {
		return "you";
	} else {
		return RPG.Visual.VisualInterface.prototype.describeA.call(this);
	}
}

/**
 * @see RPG.Visual.VisualInterface#describeThe
 */
RPG.Beings.BaseBeing.prototype.describeThe = function() {
	if (RPG.World.getPC() == this) {
		return "you";
	} else {
		return RPG.Visual.VisualInterface.prototype.describeThe.call(this);
	}
}

/**
 * Return him/her/it string for this being
 * @returns {string}
 */
RPG.Beings.BaseBeing.prototype.describeIt = function() {
	var table = {};
	table[RPG.GENDER_MALE] = "him";
	table[RPG.GENDER_FEMALE] = "her";
	table[RPG.GENDER_NEUTER] = "it";
	
	return table[this._gender];
}

/* ============================= FEAT GETTERS ============================= */

RPG.Beings.BaseBeing.prototype.getHP = function() {
	return this._stats.hp;
}

RPG.Beings.BaseBeing.prototype.getMaxHP = function() {
	return this._feats.maxhp.modifiedValue(this);
}

RPG.Beings.BaseBeing.prototype.getDV = function() {
	return this._feats.dv.modifiedValue(this);
}

RPG.Beings.BaseBeing.prototype.getPV = function() {
	return this._feats.pv.modifiedValue(this);
}

RPG.Beings.BaseBeing.prototype.getHit = function(weapon) {
	return weapon.getHit(this);
}

RPG.Beings.BaseBeing.prototype.getDamage = function(weapon) {
	return weapon.getDamage(this);
}

/* ============================== MISC ==================================== */

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
	if (this._stats.hp <= 0) {
		this.die();
		return false;
	} else if (this._stats.hp > this.getMaxHP()) {
		this.fullHP();
	}
	return true;
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
		this._map.addItem(this._coords, this._items[i]);
	}
}

/**
 * This being dies
 */
RPG.Beings.BaseBeing.prototype.die = function() {
	this._alive = false;
	this.dropAll();
	var corpse = new RPG.Items.Corpse(this);
	this._map.addItem(this._coords, corpse);
	RPG.World.action(new RPG.Actions.Death(this)); 
}

/**
 * Can this being see target coords?
 * @param {RPG.Misc.Coords} target
 * @returns {bool}
 */
RPG.Beings.BaseBeing.prototype.canSee = function(target) {
	var source = this._coords;
	if (source.distance(target) <= 1) { return true; } /* optimalization: can see self & surroundings */
	if (source.distance(target) > this.sightDistance()) { return false; } 

	var offsets = [
		[0, 0],
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1]
	];
	var c = source.clone();
	for (var i=0;i<offsets.length;i++) {
		c.x = source.x + offsets[i][0];
		c.y = source.y + offsets[i][1];
		
		/* test alternate starting cell for validity */
		if (i) {
			if (!this._map.isValid(c) || !this._map.at(c).isFree()) { continue; }
		}
		var tmp = this._map.lineOfSight(c, target);
		if (tmp == true) { return true; }
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
