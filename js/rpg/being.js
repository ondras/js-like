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

	this._cell = null;
	this._chat = null;
	this._gender = RPG.GENDER_NEUTER;
	this._items = [];
	this._stats = {};
	this._feats = {};
	this._alive = true;
	this._weapons = {}; /* fixme */
	
	this._default = {
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
	this._weapons = {
		current: null,
		hands: new RPG.Misc.Hands(new RPG.Misc.RandomValue(4, 2), new RPG.Misc.RandomValue(2, 1)),
		foot: new RPG.Misc.Foot(new RPG.Misc.RandomValue(4, 3), new RPG.Misc.RandomValue(3, 1))
	}

	this._initStatsAndFeats();

	this.fullHP();
	return this;
}

RPG.Beings.BaseBeing.prototype.trapMemory = function() {
	return this._trapMemory;
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
		pv: new RPG.Feats.PV(this._default.pv)
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
	item.mergeInto(this._items);
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

RPG.Beings.BaseBeing.prototype.getFoot = function() {
	return this._weapons.foot;
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
RPG.Beings.BaseBeing.prototype.getModifier = function(feat, type, modifierHolder) {
	var modifierHolders = this._getModifierHolders();

	var values = [];
	for (var i=0;i<modifierHolders.length;i++) {
		var mod = modifierHolders[i].getModifier(feat, type, modifierHolder);
		if (mod !== null) { values.push(mod); }
	}
	
	var val = RPG.Misc.ModifierInterface.prototype.getModifier.call(this, feat, type, modifierHolder);
	if (val !== null) { values.push(val); }
	
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

/* FIXME obsolete */
RPG.Beings.BaseBeing.prototype.getMaxHP = function() {
	return this._feats.maxhp.modifiedValue(this);
}

/* FIXME obsolete */
RPG.Beings.BaseBeing.prototype.getDV = function() {
	return this._feats.dv.modifiedValue(this);
}

/* FIXME obsolete */
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
	return arr;
}


/**
 * @class Player character
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.PC = OZ.Class().extend(RPG.Beings.BaseBeing);

RPG.Beings.PC.prototype.init = function() {
	this.parent();
	this._race = null;
	this._mapMemory = null;
	this._visibleCells = [];

	this._default = {
		maxhp: 10,
		dv: 5,
		pv: 0,
		strength: 11,
		toughness: 11,
		dexterity: 11,
		intelligence: 11
	}
	
}

RPG.Beings.PC.prototype.setup = function(race) {
	this._race = race;
	this._mapMemory = new RPG.Memory.MapMemory();
	
	this._char = "@";
	this._color = race.getColor();
	this._image = race.getImage();
	this._description = "you";
	return this.parent();
}

RPG.Beings.PC.prototype.mapMemory = function() {
	return this._mapMemory;
}

RPG.Beings.PC.prototype.getVisibleCoords = function() {
	return this._visibleCoords;
}

/**
 * @see RPG.Visual.VisualInterface#describeA
 */
RPG.Beings.PC.prototype.describeA = function() {
	return this.describe();
}

/**
 * @see RPG.Visual.VisualInterface#describeThe
 */
RPG.Beings.PC.prototype.describeThe = function() {
	return this.describe();
}

/**
 * PC uses a different approach - maintains a list of visible coords
 */
RPG.Beings.PC.prototype.canSee = function(coords) {
	for (var i=0;i<this._visibleCoords.length;i++) {
		var c = this._visibleCoords[i];
		if (c.x == coords.x && c.y == coords.y) { return true; }
	}
	return false;
}

/**
 * Update the array with all visible coordinates
 */
RPG.Beings.PC.prototype.updateVisibility = function() {
	var R = this.sightDistance();
	var center = this._cell.getCoords();
	var current = new RPG.Misc.Coords(0, 0);
	var map = this._cell.getMap();
	var cell = null;

	/* directions blocked */
	var angles = [];
	
	/* results */
	this._visibleCoords = [this._cell.getCoords().clone()];
	
	/* number of cells in current ring */
	var cellCount = 0;

	/* one edge before turning */
	var edgeLength = 0;

	/* step directions */
	var directions = [
		[0, -1], /* up */
		[-1, 0], /* left */
		[0, 1],  /* down */
		[1, 0]   /* right */
	];
	
	var angleCount = R*8; /* length of longest ring */
	for (var i=0;i<angleCount;i++) { angles.push([0, 0]); }
	
	/* analyze surrounding cells in concentric rings, starting from the center */
	for (var r=1; r<=R; r++) {
		cellCount += 8;
		edgeLength += 2;
		anglesPerCell = angleCount / cellCount; /* number of angles per cell */

		/* start in the lower right corner of current ring */
		current.x = center.x + r;
		current.y = center.y + r;
		var counter = 0;
		var directionIndex = 0;
		do {
			counter++;
			if (map.isValid(current)) { 
				/* check individual cell */
				var centralAngle = (counter-1) * anglesPerCell + 0.5;
				cell = map.at(current);
				
				if (cell && this._visibleCell(cell, centralAngle, anglesPerCell, angles)) { 
					this._visibleCoords.push(current.clone()); 
				}
			}
			current.x += directions[directionIndex][0];
			current.y += directions[directionIndex][1];

			/* do a turn */
			if (!(counter % edgeLength)) { directionIndex++; }

		} while (counter < cellCount);
	}
}

/**
 * Subroutine for updateVisibility(). For a given cell, checks if it is visible and adjusts angles it blocks.
 * @param {RPG.Cells.BaseCell} cell
 * @param {float} centralAngle Angle which best corresponds with a given cell
 * @param {float} anglesPerCell How many angles are shaded by this one
 * @param {angle[]} array of available angles
 */
RPG.Beings.PC.prototype._visibleCell = function(cell, centralAngle, anglesPerCell, angles) {
	var eps = 1e-4;
	var map = cell.getMap();
	var blocks = !cell.visibleThrough();
	var start = centralAngle - anglesPerCell/2;
	var startIndex = Math.floor(start);
	var angleCount = angles.length;
	
	var ptr = startIndex;
	var given = 0; /* amount already distributed */
	var amount = 0;
	var angle = null;
	var ok = false;
	do {
		var index = ptr; /* ptr recomputed to avail range */
		if (index < 0) { index += angleCount; }
		if (index >= angleCount) { index -= angleCount; }
		angle = angles[index];
		
		/* is this angle is already totally obstructed? */
		var chance = (angle[0] + angle[1] + eps < 1);

		if (ptr < start) {
			/* blocks left part of blocker (with right cell part) */
			amount += ptr + 1 - start;
			if (chance && amount > angle[0]+eps) {
				/* blocker not blocked yet, this cell is visible */
				ok = true;
				/* adjust blocking amount */
				if (blocks) { angle[0] = amount; }
			}
		} else if (given + 1 > anglesPerCell)  { 
			/* blocks right part of blocker (with left cell part) */
			amount = anglesPerCell - given;
			if (chance && amount > angle[1]+eps) {
				/* blocker not blocked yet, this cell is visible */
				ok = true;
				/* adjust blocking amount */
				if (blocks) { angle[1] = amount; }
			}
		} else {
			/* this cell completely blocks a blocker */
			amount = 1;
			if (chance) {
				ok = true;
				if (blocks) {
					angle[0] = 1;
					angle[1] = 1;
				}
			}
		}
		
		given += amount;
		ptr++;
	} while (given < anglesPerCell);
	
	return ok;
}

/**
 * PC incorporates his/hers race into a set of modifier holders
 */
RPG.Beings.PC.prototype._getModifierHolders = function() {
	var arr = this.parent();
	arr.push(this._race);
	return arr;
}
