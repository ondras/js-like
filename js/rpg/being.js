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
	this._stats = {
		hp: 0
	}
	this._feats = {
		maxhp: new RPG.Feats.MaxHP(10),
		dv: new RPG.Feats.DV(2),
		pv: new RPG.Feats.PV(2)
	}
	
	this._hands = {
		hit: new RPG.Feats.Hit(5),
		damage: new RPG.Feats.Damage(2),
	}
	this._weapon = null;

	this._char = this._race.getChar(null);
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

RPG.Beings.BaseBeing.prototype.getHit = function() {
	if (this._weapon) {
		return this._weapon.getHit(this);
	} else {
		return this._hands.hit.modifiedValue(this);
	}
}

RPG.Beings.BaseBeing.prototype.getDamage = function() {
	if (this._weapon) {
		return this._weapon.getDamage(this);
	} else {
		return this._hands.damage.modifiedValue(this);
	}
}

RPG.Beings.BaseBeing.prototype.setWeapon = function(item) {
	this._weapon = item;
}

RPG.Beings.BaseBeing.prototype.getChar = function(who) {
	var ch = this._char.clone();
	if (who == this) { ch.setChar("@"); }
	return ch;
}

RPG.Beings.BaseBeing.prototype.getImage = function(who) {
	return this._race.getImage(who);
}

RPG.Beings.BaseBeing.prototype.describe = function(who) {
	if (who == this) { return "you"; }
	return this._race.describe(who);
}

RPG.Beings.BaseBeing.prototype.describeA = function(who) {
	if (who == this) { 
		return this.describe(who); 
	} else {
		return this._race.describeA(who);
	}
}

RPG.Beings.BaseBeing.prototype.describeThe = function(who) {
	if (who == this) { 
		return this.describe(who); 
	} else {
		return this._race.describeThe(who);
	}
}

RPG.Beings.BaseBeing.prototype.describeIt = function() {
	var table = {};
	table[RPG.GENDER_MALE] = "him";
	table[RPG.GENDER_FEMALE] = "her";
	table[RPG.GENDER_NEUTER] = "it";
	
	return table[this._gender];
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
 * This being dies.
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
	if (source.distance(target) > 5) { return false; } /* FIXME this should depend on perception or so */

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
