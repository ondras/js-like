/**
 * @class Basic being
 * @augments RPG.Visual.IVisual
 * @augments RPG.Misc.IActor
 */
RPG.Beings.BaseBeing = OZ.Class()
						.implement(RPG.Visual.IVisual)
						.implement(RPG.Misc.IActor);
						
/**
 * @param {function} race Race constructor
 */
RPG.Beings.BaseBeing.prototype.init = function(race) {
	this._name = "";
	this._slots = {};
	this._coords = null;
	this._map = null;
	this._gender = RPG.GENDER_NEUTER;
	this._items = [];
	this._stats = {};
	this._feats = {};
	this._alive = true;
	this._effects = [];
	this._modifierList = [];
	this._spells = [];
	this._knownFeatures = [];

	this._race = race;
	this._initSlots();
	this._initStatsAndFeats();

	this.addEffect(new RPG.Effects.HPRegeneration());
	this.addEffect(new RPG.Effects.ManaRegeneration());
	this.fullStats();
}

RPG.Beings.BaseBeing.prototype.getVisualProperty = function(name) {
	return this.parent(name) || new this._race().getVisualProperty(name);
}

RPG.Beings.BaseBeing.prototype.toString = function() {
	return this.describe();
}

RPG.Beings.BaseBeing.prototype.knowsFeature = function(feature) {
	if (!(feature instanceof RPG.Features.Trap)) { return true; }
	return this._knownFeatures.indexOf(feature) != -1;
}

/**
 * Prepare the being-race binding
 */
RPG.Beings.BaseBeing.prototype._initSlots = function() {
	/* bind all slots to a particular being */
	this._slots = new this._race().getSlots();
	for (var p in this._slots) { this._slots[p].setBeing(this); }
}

/**
 * Initialize stats (HP, ...) and feats (Max HP, DV, PV, ...)
 */
RPG.Beings.BaseBeing.prototype._initStatsAndFeats = function() {
	var defaults = new this._race().getDefaults();
	
	this._stats = {};
	this._stats[RPG.STAT_HP] = Infinity;
	this._stats[RPG.STAT_MANA] = Infinity;
	this._stats[RPG.STAT_XP] = 0;
	this._stats[RPG.STAT_LEVEL] = 1;
	
	this._feats = {};
	
	/* advanced feats aka attributes */
	for (var i=0;i<RPG.ATTRIBUTES.length;i++) {
		var attr = RPG.ATTRIBUTES[i];
		var rv = new RPG.Misc.RandomValue(defaults[attr], 2);
		var f = new RPG.Feats[attr](rv.roll());
		this._feats[attr] = f;
		this._modifierList.push(f);
	}

	/* base feats */
	var misc = [RPG.FEAT_MAX_HP, RPG.FEAT_MAX_MANA, RPG.FEAT_DV, RPG.FEAT_PV, 
				RPG.FEAT_SPEED, RPG.FEAT_HIT, RPG.FEAT_DAMAGE, 
				RPG.FEAT_REGEN_HP, RPG.FEAT_REGEN_MANA,	RPG.FEAT_SIGHT_RANGE
				];
	for (var i=0;i<misc.length;i++) {
		var name = misc[i];
		this._feats[name] = new RPG.Feats.BaseFeat(defaults[name] || 0);
	}
	
	for (var p in this._feats) { this._updateFeat(p); }
}

RPG.Beings.BaseBeing.prototype.hasDebts = function() {
	for (var i=0;i<this._items.length;i++) {
		if (this._items[i].isUnpaid()) { return true; }
	}
	return false;
}

RPG.Beings.BaseBeing.prototype.addSpell = function(spell) {
	if (this._spells.indexOf(spell) == -1) { this._spells.push(spell); }
	return this;
}

RPG.Beings.BaseBeing.prototype.getSpells = function() {
	return this._spells;
}

/**
 * Does this being know a spell? Is it possible to cast it?
 * @param {RPG.Spells.BaseSpell} spell Spell constructor
 * @param {bool} castable Are we interested in whether this spell can be cast?
 * @returns {bool}
 */
RPG.Beings.BaseBeing.prototype.hasSpell = function(spell, castable) {
    var knows = (this._spells.indexOf(spell) != -1);
    if (knows && !castable) { return true; }
	return knows && (this.getStat(RPG.STAT_MANA) >= spell.cost);
}

/**
 * This being is located on a new coords. 
 * @param {RPG.Misc.Coords} coords
 */
RPG.Beings.BaseBeing.prototype.setCoords = function(coords) {
	this._coords = coords.clone();
}

RPG.Beings.BaseBeing.prototype.getCoords = function() {
	return this._coords;
}

RPG.Beings.BaseBeing.prototype.setMap = function(map, coords) {
	this._map = map;
	this.setCoords(coords);
}

RPG.Beings.BaseBeing.prototype.getMap = function() {
	return this._map;
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
	item.setOwner(this);
	item.mergeInto(this._items);
	return this;
}


RPG.Beings.BaseBeing.prototype.hasItem = function(item) {
	return (this._items.indexOf(item) != -1);
}

RPG.Beings.BaseBeing.prototype.removeItem = function(item) {
	var index = this._items.indexOf(item);
	if (index == -1) { throw new Error("Item '"+item.describe()+"' not found!"); }
	this._items.splice(index, 1);
	item.setOwner(null);
	return this;
}

RPG.Beings.BaseBeing.prototype.equip = function(slotId, item) {
	var slot = this.getSlot(slotId);
	if (slot.getItem()) { this.unequip(slotId); }
	
	var it = slot.setItem(item); /* adding to slot could have modified the item (by subtracting etc) */
	it.entering(this);
	it.setOwner(this); /* if the item is not coming from our backpack... */
}

/**
 * Unequip given slot, optionaly returning item back to backpack
 * @param {int} slotId Slot constant
 * @param {bool} doNotAdd Do not add item to inventory?
 */
RPG.Beings.BaseBeing.prototype.unequip = function(slotId, doNotAdd) {
	var slot = this.getSlot(slotId);
	if (!slot) { return this; }
	
	var item = slot.getItem();
	if (!item) { return this; }
	
	item.setOwner(null);	/* nobody owns this now */
	slot.setItem(null);		/* slot is empty */
	item.leaving(this);		/* let item know we are not holding it */
	
	if (!doNotAdd) { this.addItem(item); }
	return this;
}

RPG.Beings.BaseBeing.prototype.getItems = function() { 
	return this._items;
}

/**
 * Return all available slots
 */
RPG.Beings.BaseBeing.prototype.getSlots = function() {
	return this._slots;
}

/**
 * Return slot by its type constant
 */
RPG.Beings.BaseBeing.prototype.getSlot = function(type) {
	return this._slots[type] || null;
}

/**
 * Shortcut to wallet ;)
 */
RPG.Beings.BaseBeing.prototype.getGold = function() {
	for (var i=0;i<this._items.length;i++) {
		var it = this._items[i];
		if (it instanceof RPG.Items.Gold) { return it; }
	}
	return null;
}

/**
 * Compute debts; either total or specific to one shopkeeper
 */
RPG.Beings.BaseBeing.prototype.getDebts = function(shopkeeper) {
	var total = 0;
	var sitems = (shopkeeper ? shopkeeper.getAI().getItems() : null);
	
	for (var i=0;i<this._items.length;i++) {
		var item =  this._items[i];
		if (!item.getPrice()) { continue; }
		var price = item.getPrice() * item.getAmount();
		
		if (!shopkeeper) {
			total += price;
		} else {
			var index = sitems.indexOf(item);
			if (index != -1) { total += price; }
		}
	}
	return total;
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
	table[RPG.GENDER_FEMALE] = "her";
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
	e.entering(this);
	return this;
}

RPG.Beings.BaseBeing.prototype.removeEffect = function(e) {
	var index = this._effects.indexOf(e);
	if (index == -1) { throw new Error("Cannot find effect"); }
	this._effects.splice(index, 1);
	e.leaving(this);
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
			this._stats[stat] = Math.min(value, this._feats[RPG.FEAT_MAX_HP].getValue());
		break;

		case RPG.STAT_MANA:
			this._stats[stat] = Math.min(value, this._feats[RPG.FEAT_MAX_MANA].getValue());
		break;
		
		case RPG.STAT_XP:
			this._stats[stat] = value;
			var level = this.getStat(RPG.STAT_LEVEL); /* current */
			var threshold = this.xpForNextLevel(level);
			var gained = 0; /* how many levels gained in this XP increase */
			while (value >= threshold) {
				level++;
				threshold = this.xpForNextLevel(level);
			}
			var diff = level - this.getStat(RPG.STAT_LEVEL);
			if (diff > 0) { this.adjustStat(RPG.STAT_LEVEL, diff); }
		break;
		
		case RPG.STAT_LEVEL:
			var diff = value - this._stats[stat];
			this._stats[stat] = value;
			this._gainLevels(diff);
		break;
		
		default:
			this._stats[stat] = value;
		break;
	}
	
	if (this._stats[RPG.STAT_HP] <= 0) { this.die(); }
	return this._stats[stat];
}

RPG.Beings.BaseBeing.prototype.xpForNextLevel = function(level) {
	var phi = (1+Math.sqrt(5))/2;
	var nlevel = level + 1;
	var val = (Math.pow(phi, nlevel) - Math.pow(-1/phi, nlevel)) / Math.sqrt(5);
	return Math.round(val);
}

/**
 * Recompute modifiers and modified value for a given feat
 * @param {int} feat
 */
RPG.Beings.BaseBeing.prototype._updateFeat = function(feat) {
	var f = this._feats[feat];
	var modifier = 0;
	for (var i=0;i<this._modifierList.length;i++) {
		modifier += this._modifierList[i].getModifier(feat);
	}
	f.setModified(modifier);
	
	if (feat == RPG.FEAT_MAX_HP) { this.adjustStat(RPG.STAT_HP, 0); }
	if (feat == RPG.FEAT_MAX_MANA) { this.adjustStat(RPG.STAT_MANA, 0); }
	
	if (f instanceof RPG.Feats.AdvancedFeat) {
		var modified = f.getModified();
		for (var i=0;i<modified.length;i++) {
			this._updateFeat(modified[i]);
		}
	}
	
	return f.getValue();
}

/**
 * Get final feat value
 * @param {int} feat
*/
RPG.Beings.BaseBeing.prototype.getFeat = function(feat) {
	return this._feats[feat].getValue();
}

/**
 * Set base feat value
 * @param {int} feat
 */
RPG.Beings.BaseBeing.prototype.setFeat = function(feat, value) {
	this._feats[feat].setBase(value);
	return this._updateFeat(feat);
}

/**
 * Adjust base feat value
 * @param {int} feat
 * @param {int} diff
 */
RPG.Beings.BaseBeing.prototype.adjustFeat = function(feat, diff) {
	return this.setFeat(feat, this._feats[feat].getBase() + diff);
}

RPG.Beings.BaseBeing.prototype.setGender = function(gender) {
	this._gender = gender;
	return this;
}

RPG.Beings.BaseBeing.prototype.getGender = function() {
	return this._gender;
}

/**
 * @see RPG.Misc.IActor#getSpeed
 */
RPG.Beings.BaseBeing.prototype.getSpeed = function() {
	return this.getFeat(RPG.FEAT_SPEED);
}

/**
 * Heal wounds
 * @param {int} amount
 */
RPG.Beings.BaseBeing.prototype.heal = function(amount) {
	var hp = this.getStat(RPG.STAT_HP);
	var max = this.getFeat(RPG.FEAT_MAX_HP);
	if (hp == max) {
		RPG.UI.buffer.message("Nothing happens.");
		return;
	}
	
	hp = this.adjustStat(RPG.STAT_HP, amount);
	var str = "";
	
	if (hp == max) {
		str = "all";
	} else {
		str = "some of";
	}
	var s = RPG.Misc.format("%S %his wounds are healed.", str, this);
	RPG.UI.buffer.message(s);
}

/* ============================== MISC ==================================== */

RPG.Beings.BaseBeing.prototype._generateCorpse = function() {
	if (RPG.Rules.isCorpseGenerated(this)) {
		return new RPG.Items.Corpse(this);
	}
	return null;
}

RPG.Beings.BaseBeing.prototype.isAlive = function() {
	return this._alive;
}

/**
 * Fully recovers all stats to maximum
 */
RPG.Beings.BaseBeing.prototype.fullStats = function() {
	this.setStat(RPG.STAT_HP, this._feats[RPG.FEAT_MAX_HP].getValue());
	this.setStat(RPG.STAT_MANA, this._feats[RPG.FEAT_MAX_MANA].getValue());
}

/**
 * This being drops everything it holds.
 */
RPG.Beings.BaseBeing.prototype.dropAll = function() {
	for (var p in this._slots) { this.unequip(p); }

	for (var i=0;i<this._items.length;i++) { /* drop items */
		if (RPG.Rules.isItemDropped(this, this._items[i])) {
			this._map.addItem(this._items[i], this._coords);
		}
	}
	this._items = [];
}

/**
 * This being dies
 */
RPG.Beings.BaseBeing.prototype.die = function() {
	this._alive = false;
	this._map.setBeing(null, this._coords);

	this.dropAll();
	
	var corpse = this._generateCorpse();
	if (corpse) { this._map.addItem(corpse, this._coords); }

	this.dispatch("being-death");
}

/**
 * Can this being see target coords?
 * @param {RPG.Misc.Coords} coords
 * @returns {bool}
 */
RPG.Beings.BaseBeing.prototype.canSee = function(coords) {
	return true;
}

RPG.Beings.BaseBeing.prototype.woundedState = function() {
	var def = ["slightly", "moderately", "severely", "critically"];
	var hp = this._stats[RPG.STAT_HP];
	var max = this._feats[RPG.FEAT_MAX_HP].getValue();
	if (hp == max) { return "not"; }
	var frac = 1 - hp/max;
	var index = Math.floor(frac * def.length);
	return def[index];
}

/**
 * Moving across a trap
 * @param {RPG.Features.Trap} trap
 */
RPG.Beings.BaseBeing.prototype.trapEncounter = function(trap) {
	var coords = trap.getCoords();

	var knows = this.knowsFeature(trap);
	var activated = true;

	if (knows) { activated = RPG.Rules.isTrapActivated(this, trap); }

	if (activated) {
		/* dmg or whateva */
		trap.setOff(this);

		/* let the being know about this */
		this._knownFeatures.push(trap);
	} else if (RPG.Game.pc.canSee(coords)) {
	
		/* already knows */
		var verb = RPG.Misc.verb("sidestep", this);
		var s = RPG.Misc.format("%A %s %a.", this, verb, trap);
		RPG.UI.buffer.message(s);
	}
}

/**
 * Teleporting to a given coords
 * @param {RPG.Misc.Coords} coords
 */
RPG.Beings.BaseBeing.prototype.teleport = function(coords) {
	this.move(coords);
}

/* -------------------- ACTIONS --------------- */

RPG.Beings.BaseBeing.prototype.wait = function() {
	return RPG.ACTION_TIME;
}

/**
 * Moving being to a given coords
 * @param {RPG.Misc.Coords} target
 * @param {bool} [ignoreOldCoords]
 */
RPG.Beings.BaseBeing.prototype.move = function(target, ignoreOldCoords) {
	this._map.setBeing(this, target, ignoreOldCoords);
	return RPG.ACTION_TIME;
}

/**
 * Reading, target = item
 * @param {RPG.Items.BaseItem} item
 */
RPG.Beings.BaseBeing.prototype.read = function(item) {
	var verb = RPG.Misc.verb("start", this);
	var s = RPG.Misc.format("%A %s reading %the.", this, verb, item);
	RPG.UI.buffer.message(s);
	item.read(this);

	return RPG.ACTION_TIME;
}

/**
 * Cast a spell
 * @param {RPG.Spells.BaseSpell} spell
 * @param {?} target spell specific
 */
RPG.Beings.BaseBeing.prototype.cast = function(spell, target) {
	var cost = spell.getCost();
	this.adjustStat(RPG.STAT_MANA, -cost);
	
	var verb = RPG.Misc.verb("cast", this);
	var str = RPG.Misc.format("%A %s %D.", this, verb, spell);
	RPG.UI.buffer.message(str);
	
	spell.cast(target);	
	return RPG.ACTION_TIME;
}

/**
 * Abstract consumption
 * @param {RPG.Items.BaseItem} item
 * @param {?} owner
 * @param {string} consumption verb
 * @param {function} consumption method
 */
RPG.Beings.BaseBeing.prototype._consume = function(item, owner, verb, method) {
	/* remove item from inventory / ground */
	var i = item;
	var amount = i.getAmount();
	
	if (amount == 1) {
		owner.removeItem(i);
	} else {
		i = i.subtract(1);
	}

	var v = RPG.Misc.verb(verb, this);
	var s = RPG.Misc.format("%A %s %a.", this, v, i);
	RPG.UI.buffer.message(s);
	
	method.call(item, this);
	
	return RPG.ACTION_TIME;
}

/**
 * Eat something
 * @param {PRG.Items.BaseItem} item
 * @param {?} owner
 */
RPG.Beings.BaseBeing.prototype.eat = function(item, owner) {
	return this._consume(item, owner, "eat", item.eat);
}

/**
 * Drink something
 * @param {PRG.Items.BaseItem} item
 * @param {?} owner
 */
RPG.Beings.BaseBeing.prototype.drink = function(item, owner) {
	return this._consume(item, owner, "drink", item.drink);
}

/**
 * Initiate chat
 * @param {RPG.Beings.BaseBeing} being Other being to chat with
 */
RPG.Beings.BaseBeing.prototype.chat = function(being) {
}


/**
 * Droping item(s)
 * @param {[item, amount][]} items
 */
RPG.Beings.BaseBeing.prototype.drop = function(items) {
	for (var i=0;i<items.length;i++) {
		var pair = items[i];
		var item = pair[0];
		var amount = pair[1];
		
		if (amount == item.getAmount()) {
			/* easy, just remove item */
			this.removeItem(item);
		} else {
			/* split heap */
			item = item.subtract(amount);
		}
		this._map.addItem(item, this._coords);
		this.dispatch("item-drop", {item:item});
		
		var verb = RPG.Misc.verb("drop", this);
		var s = RPG.Misc.format("%A %s %a.", this, verb, item);
		RPG.UI.buffer.message(s);
	}
	
	return RPG.ACTION_TIME;
}

/**
 * Picking item(s)
 * @param {[item, amount][]} items
 */
RPG.Beings.BaseBeing.prototype.pick = function(items) {
	for (var i=0;i<items.length;i++) {
		var pair = items[i];
		var item = pair[0];
		var amount = pair[1];
		
		if (amount == item.getAmount()) {
			/* easy, just remove item */
			this._map.removeItem(item, this._coords);
		} else {
			/* split heap */
			item = item.subtract(amount);
		}
		
		this.addItem(item);
		this.dispatch("item-pick", {item:item});
		
		var verb = RPG.Misc.verb("pick", this);
		var s = RPG.Misc.format("%A %s up %a.", this, verb, item);
		RPG.UI.buffer.message(s);
	}

	return RPG.ACTION_TIME;
}

/**
 * Open a door
 * @param {RPG.Features.Door} door
 */
RPG.Beings.BaseBeing.prototype.open = function(door) {
	var locked = door.isLocked();
	if (locked) { return RPG.ACTION_TIME; }
	
	var stuck = RPG.Rules.isDoorStuck(this, door);
	if (stuck) { return RPG.ACTION_TIME; }
	
	door.open(); /* open first, then test visibility */
	
	if (RPG.Game.pc.canSee(coords)) {
		var verb = RPG.Misc.verb("open", this);
		var s = RPG.Misc.format("%A %s the door.", this, verb);
		RPG.UI.buffer.message(s);
	}

	return RPG.ACTION_TIME;
}

/**
 * Close a door
 * @param {RPG.Features.Door} door
 */
RPG.Beings.BaseBeing.prototype.close = function(door) {
	var coords = door.getCoords();
	if (this._map.getBeing(coords)) { return RPG.ACTION_TIME; }

	var items = this._map.getItems(coords);
	if (items.length) { return RPG.ACTION_TIME; }
	
	if (RPG.Game.pc.canSee(coords)) {
		var verb = RPG.Misc.verb("close", this);
		var s = RPG.Misc.format("%A %s the door.", this, verb);
		RPG.UI.buffer.message(s);
	}

	door.close(); /* first test visibility, then close */

	return RPG.ACTION_TIME;
}

RPG.Beings.BaseBeing.prototype.launch = function(projectile, coords) {
	var p = null;
	
	/* remove projectile from being */
	if (projectile.getAmount() == 1) {
		this.unequip(RPG.SLOT_PROJECTILE, true);
		p = projectile;
		p.setOwner(this);
	} else {
		p = projectile.subtract(1);
	}

	if (RPG.Game.pc.canSee(this._coords)) {
		this._describeLaunch(p, coords);
	}
	
	p.launch(this._coords, coords, this._map);
	return RPG.ACTION_TIME;
}

/**
 * Magical attack
 * @param {RPG.Beings.BaseBeing} being
 * @param {RPG.Spells.BaseSpell} spell
 */
RPG.Beings.BaseBeing.prototype.attackMagic = function(being, spell) {
	var hit = RPG.Rules.isSpellHit(this, being, spell);
	if (!hit) {
		var verb = RPG.Misc.verb("evade", being);
		var s = RPG.Misc.format("%A barely %s %a!", being, verb, spell);
		RPG.UI.buffer.message(s);
	} else {
		var s = RPG.Misc.format("%A %is hit by %the.", being, being, spell);
		RPG.UI.buffer.message(s);

		var dmg = RPG.Rules.getSpellDamage(being, spell);
		being.adjustStat(RPG.STAT_HP, -dmg);

		if (!being.isAlive()) {
			var str = RPG.Misc.format("%The %is killed!", being, being);
			RPG.UI.buffer.message(str);
		}
	}

	this.dispatch("attack-magic", {being:being});
	return RPG.ACTION_NO_TIME;
}

RPG.Beings.BaseBeing.prototype.attackMelee = function(being, slot) {
	var hit = false;
	var damage = false;
	var kill = false;
	
	/* hit? */
	hit = RPG.Rules.isMeleeHit(this, being, slot);
	if (hit) { 
		/* damage? */
		var crit = RPG.Rules.isLucky(this);
		damage = RPG.Rules.getMeleeDamage(this, being, slot, crit);
		if (damage) {
			being.adjustStat(RPG.STAT_HP, -damage);
			kill = !being.isAlive();
		}
	}
	
	this._describeAttack(hit, damage, kill, being, slot);
	
	this.dispatch("attack-melee", {being:being});
	return RPG.ACTION_TIME;
}

RPG.Beings.BaseBeing.prototype.attackRanged = function(being, projectile) {
	var hit = RPG.Rules.isRangedHit(this, being, projectile);
	var recovered = RPG.Rules.isProjectileRecovered(projectile);
	
	if (!hit) {
		var verb = RPG.Misc.verb("evade", being);
		var s = RPG.Misc.format("%A %s %a.", being, verb, projectile);
		RPG.UI.buffer.message(s);
		
		if (recovered) { this._map.addItem(projectile, being.getCoords()); }
	} else {
		var s = RPG.Misc.format("%A %is hit.", being, being);
		RPG.UI.buffer.message(s);

		if (recovered) { being.addItem(projectile); }
	
		var crit = RPG.Rules.isLucky(this);
		var dmg = RPG.Rules.getRangedDamage(this, being, projectile, crit);
		being.adjustStat(RPG.STAT_HP, -dmg);

		if (!being.isAlive()) {
			var str = RPG.Misc.format("%The %is killed!", being, being);
			RPG.UI.buffer.message(str);
		}
	}
		
	this.dispatch("attack-ranged", {being:being});
	return RPG.ACTION_NO_TIME;
}

RPG.Beings.BaseBeing.prototype.addModifiers = function(imodifier) {
	this._modifierList.push(imodifier);
	this._updateFeatsByModifier(imodifier);
}

RPG.Beings.BaseBeing.prototype.removeModifiers = function(imodifier) {
	var index = this._modifierList.indexOf(imodifier);
	if (index == -1) { throw new Error("Cannot find imodifier '"+imodifier+"'"); }
	this._modifierList.splice(index, 1);
	this._updateFeatsByModifier(imodifier);
}

/* -------------------- PRIVATE --------------- */

RPG.Beings.BaseBeing.prototype._describeLaunch = function(projectile, target) {
}

RPG.Beings.BaseBeing.prototype._describeAttack = function(hit, damage, kill, being, slot) {
}

/**
 * Update all feats modified by this IModifier
 */
RPG.Beings.BaseBeing.prototype._updateFeatsByModifier = function(imodifier) {
	var list = imodifier.getModified();
	for (var i=0;i<list.length;i++) {
		this._updateFeat(list[i]);
	}
}

RPG.Beings.BaseBeing.prototype._gainLevels = function(amount) {
	/* FIXME */
}
