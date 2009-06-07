/**
 * @class Basic being
 * @augments RPG.Visual.VisualInterface
 * @augments RPG.Visual.DescriptionInterface
 * @augments RPG.Misc.ModifierInterface
 */
RPG.Beings.BaseBeing = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Visual.DescriptionInterface)
						.implement(RPG.Misc.ModifierInterface);

RPG.Beings.BaseBeing.prototype.init = function(r) {
	this._modifiers = [];
	this._coords = null;
	this._map = null;
	this._brain = null;
	this._race = r;
	this._items = [];
	this._gender = RPG.GENDER_NEUTER;
	this._stats = {};
	this._feats = {};
	this._hands = null;
	this._weapon = null;
	
	this._char = this._race.getChar(null);

	this._initMisc();
	this.fullHP();
}

/**
 * Non-trivial initialization
 */

RPG.Beings.BaseBeing.prototype._initMisc = function() {
	this._stats = {
		hp: 0
	}
	this._feats = {
		maxhp: new RPG.Feats.MaxHP(8),
		dv: new RPG.Feats.DV(0),
		pv: new RPG.Feats.PV(0)
	}
	this._hands = {
		hit: new RPG.Feats.Hit(5),
		damage: new RPG.Feats.Damage(2),
	}
	
	var attrs = {
		strength: RPG.Feats.Strength,
		toughness: RPG.Feats.Toughness,
		intelligence: RPG.Feats.Intelligence,
		dexterity: RPG.Feats.Dexterity
	}
	for (var name in attrs) {
		var ctor = attrs[name];
		var dice = new RPG.Misc.Dice(1, 6, 0);
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

RPG.Beings.BaseBeing.prototype.setBrain = function(brain) {
	this._brain = brain;
}

RPG.Beings.BaseBeing.prototype.getBrain = function() {
	return this._brain;
}

RPG.Beings.BaseBeing.prototype.getRace = function() {
	return this._race;
}

/**
 * Being combines modifiers from various sources: items, feats, race, ...
 * @see RPG.Base.ModifierInterface
 */
RPG.Beings.BaseBeing.prototype.getModifier = function(feat, type, modifierHolder) {
	var modifierHolders = [];
	for (var i=0;i<this._items.length;i++) {
		modifierHolders.push(this._items[i]);
	}
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
 * Sets an item as a current weapon. FIXME this should be reworked into an inventory
 * @param {RPG.Items.BaseItem}
 */
RPG.Beings.BaseBeing.prototype.setWeapon = function(item) {
	this._weapon = item;
}

/**
 * @see RPG.Visual.VisualInterface#getChar
 */
RPG.Beings.BaseBeing.prototype.getChar = function(who) {
	var ch = this._char.clone();
	if (who == this) { ch.setChar("@"); }
	return ch;
}

/**
 * @see RPG.Visual.VisualInterface#getImage
 */
RPG.Beings.BaseBeing.prototype.getImage = function(who) {
	return this._race.getImage(who);
}

/**
 * @see RPG.Visual.DescriptionInterface#describe
 */
RPG.Beings.BaseBeing.prototype.describe = function(who) {
	if (who == this) { return "you"; }
	return this._race.describe(who);
}

/**
 * @see RPG.Visual.DescriptionInterface#describeA
 */
RPG.Beings.BaseBeing.prototype.describeA = function(who) {
	if (who == this) { 
		return this.describe(who); 
	} else {
		return this._race.describeA(who);
	}
}

/**
 * @see RPG.Visual.DescriptionInterface#describeThe
 */
RPG.Beings.BaseBeing.prototype.describeThe = function(who) {
	if (who == this) { 
		return this.describe(who); 
	} else {
		return this._race.describeThe(who);
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
	return Math.round(this._feats.maxhp.modifiedValue(this));
}

RPG.Beings.BaseBeing.prototype.getDV = function() {
	return Math.round(this._feats.dv.modifiedValue(this));
}

RPG.Beings.BaseBeing.prototype.getPV = function() {
	return Math.round(this._feats.pv.modifiedValue(this));
}

RPG.Beings.BaseBeing.prototype.getHit = function() {
	var val = 0;
	if (this._weapon) {
		val = this._weapon.getHit(this);
	} else {
		val = this._hands.hit.modifiedValue(this);
	}
	return Math.round(val);
}

RPG.Beings.BaseBeing.prototype.getDamage = function() {
	var val = 0;
	if (this._weapon) {
		val = this._weapon.getDamage(this);
	} else {
		val = this._hands.damage.modifiedValue(this);
	}
	return Math.round(val);
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
 * This being dies. FIXME do this as an action?
 */
RPG.Beings.BaseBeing.prototype.die = function() {
	for (var i=0;i<this._items.length;i++) { /* drop items */
		this._map.addItem(this._coords, this._items[i]);
	}
	this._map.setBeing(this._coords, null); /* remove being */
	/* FIXME */
	if (this._brain) {
		RPG.getWorld().scheduler.removeActor(this._brain);
	}
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
		if (!this._map.valid(c) || this._map.isBlocked(c)) { continue; }
		var tmp = this._map.lineOfSight(c, target);
		if (tmp == true) { return true; }
	}
	return false;
}

/**
 * Being requests info about a cell
 * @param {RPG.Misc.Coords} coords
 */
RPG.Beings.BaseBeing.prototype.cellInfo = function(coords) {
	return this._map.at(coords);
}
