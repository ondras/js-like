/**
 * @class Basic being
 * @augments RPG.Visual.IVisual
 * @augments RPG.IActor
 * @augments RPG.Misc.IDamageReceiver
 */
RPG.Beings.BaseBeing = OZ.Class().implement(RPG.Visual.IVisual)
				 .implement(RPG.Misc.IDamageReceiver)
				 .implement(RPG.IActor);

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
	this._alive = true;
	this._effects = [];
	this._feats = [];
	this._featModifiers = {};
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

RPG.Beings.BaseBeing.prototype.computeRating = function() {
	var ratedFeats = [RPG.FEAT_DV, RPG.FEAT_PV].concat(RPG.ATTRIBUTES);
	var rating = 0;
	for (var i=0;i<ratedFeats.length;i++) {
		var id = ratedFeats[i];
		var value = this.getFeat(id);
		var feat = RPG.Feats[id];
		rating += feat.normalize(value);
	}

	return rating;
}

RPG.Beings.BaseBeing.prototype.knowsFeature = function(feature) {
	if (!(feature instanceof RPG.Features.Trap)) { return true; }
	return this._knownFeatures.indexOf(feature) != -1;
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
 * @param {RPG.Coords} coords
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
		if (it instanceof RPG.Items.Gold) { return it.getAmount(); }
	}
	return 0;
}

RPG.Beings.BaseBeing.prototype.setGold = function(gold) {
	var item = null;
	for (var i=0;i<this._items.length;i++) {
		var it = this._items[i];
		if (it instanceof RPG.Items.Gold) { item = it; }
	}
	
	if (item) {
		if (gold) {
			item.setAmount(gold);
		} else { /* remove */
			this.removeItem(item);
		}
	} else {
		if (!gold) { return; } /* no gold avail, no gold needed */
		this.addItem(new RPG.Items.Gold(gold)); /* add new item */
	}
	
	return this;
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
			this._stats[stat] = Math.min(value, this.getFeat(RPG.FEAT_MAX_HP));
		break;

		case RPG.STAT_MANA:
			this._stats[stat] = Math.min(value, this.getFeat(RPG.FEAT_MAX_MANA));
		break;
	}
	
	if (this._stats[RPG.STAT_HP] <= 0 && this._alive) { this.die(); }
	
	return this;
}

RPG.Beings.BaseBeing.prototype.getFeatBase = function(feat) {
	return this._feats[feat];
}

RPG.Beings.BaseBeing.prototype.getFeatModifier = function(feat) {
	var modifier = this._featModifiers[feat] || 0;
	var f = RPG.Feats[feat];
	for (var parent in f.parentModifiers) {
		var val = this.getFeat(parent);
		modifier += f.parentModifiers[parent](val);
	}
	return Math.round(modifier);
}

/**
 * Get final feat value
 * @param {int} feat
 */
RPG.Beings.BaseBeing.prototype.getFeat = function(feat) {
	return Math.max(0, this.getFeatBase(feat) + this.getFeatModifier(feat));
}

/**
 * Set base feat value
 * @param {int} feat
 */
RPG.Beings.BaseBeing.prototype.setFeat = function(feat, value) {
	this._feats[feat] = value;
	
	this._syncStatsAndFeats();
	return this;
}

/**
 * Adjust base feat value
 * @param {int} feat
 * @param {int} diff
 */
RPG.Beings.BaseBeing.prototype.adjustFeat = function(feat, diff) {
	return this.setFeat(feat, this._feats[feat] + diff);
}

RPG.Beings.BaseBeing.prototype.setGender = function(gender) {
	this._gender = gender;
	return this;
}

RPG.Beings.BaseBeing.prototype.getGender = function() {
	return this._gender;
}

/**
 * @see RPG.IActor#getSpeed
 */
RPG.Beings.BaseBeing.prototype.getSpeed = function() {
	return this.getFeat(RPG.FEAT_SPEED);
}

/**
 * @see RPG.Misc.IDamageReceiver#getLuck
 */
RPG.Beings.BaseBeing.prototype.getLuck = function() {
	return this.getFeat(RPG.FEAT_LUCK);
}

/**
 * @see RPG.Misc.IDamageReceiver#getDV
 */
RPG.Beings.BaseBeing.prototype.getDV = function() {
	return this.getFeat(RPG.FEAT_DV);
}

/**
 * @see RPG.Misc.IDamageReceiver#getPV
 */
RPG.Beings.BaseBeing.prototype.getPV = function() {
	return this.getFeat(RPG.FEAT_PV);
}

/**
 * @see RPG.Misc.IDamageReceiver#isAlive
 */
RPG.Beings.BaseBeing.prototype.isAlive = function() {
	return this._alive;
}

/**
 * @see RPG.Misc.IDamageReceiver#damage
 */
RPG.Beings.BaseBeing.prototype.damage = function(amount) {
	this.adjustStat(RPG.STAT_HP, -amount);
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

/**
 * Fully recovers all stats to maximum
 */
RPG.Beings.BaseBeing.prototype.fullStats = function() {
	this.setStat(RPG.STAT_HP, this.getFeat(RPG.FEAT_MAX_HP));
	this.setStat(RPG.STAT_MANA, this.getFeat(RPG.FEAT_MAX_MANA));
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
	
	/* drop money */
	var gold = Math.ceil(Math.random()*2*this.computeRating());
	this._map.addItem(new RPG.Items.Gold(gold), this._coords);
	
	var corpse = this._generateCorpse();
	if (corpse) { this._map.addItem(corpse, this._coords); }

	this.dispatch("being-death");
}

/**
 * Can this being see target coords?
 * @param {RPG.Coords} coords
 * @returns {bool}
 */
RPG.Beings.BaseBeing.prototype.canSee = function(coords) {
	return true;
}

RPG.Beings.BaseBeing.prototype.woundedState = function() {
	var def = ["slightly", "moderately", "severely", "critically"];
	var hp = this._stats[RPG.STAT_HP];
	var max = this.getFeat(RPG.FEAT_MAX_HP);
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
 * @param {RPG.Coords} coords
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
 * @param {RPG.Coords} target
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

	if (RPG.Game.pc.canSee(this._coords)) { this._describeLaunch(p, coords); }
	
	p.launch(this._coords, coords, this._map);
	return RPG.ACTION_TIME;
}

/**
 * Attack target being with a given slot
 */
RPG.Beings.BaseBeing.prototype.attackMelee = function(being, slot) {
	var combat = new RPG.Combat(slot, being).execute();
	this._describeMeleeCombat(combat);
	
	this.dispatch("attack-melee", {being:being});
	return RPG.ACTION_TIME;
}

RPG.Beings.BaseBeing.prototype.attackRanged = function(being, projectile) {
	var combat = new RPG.Combat(projectile, being).execute();
	this._describeRangedCombat(combat);

	var recovered = RPG.Rules.isProjectileRecovered(projectile);
	if (recovered) {
		if (combat.wasHit() && !combat.wasKill()) {
			being.addItem(projectile);
		} else {
			this._map.addItem(projectile, being.getCoords());
		}
	}

	this.dispatch("attack-ranged", {being:being});
	return RPG.ACTION_NO_TIME;
}

/**
 * Magical attack
 * @param {RPG.Beings.BaseBeing} being
 * @param {RPG.Spells.Attack} spell
 */
RPG.Beings.BaseBeing.prototype.attackMagic = function(being, spell) {
	var combat = new RPG.Combat(spell, being).execute();
	this._describeMagicCombat(combat);

	this.dispatch("attack-magic", {being:being});
	return RPG.ACTION_NO_TIME;
}

RPG.Beings.BaseBeing.prototype.addModifiers = function(imodifier) {
	var modifiers = imodifier.getModifiers();
	for (var feat in modifiers) {
		if (!(feat in this._featModifiers)) { this._featModifiers[feat] = 0; }
		this._featModifiers[feat] += modifiers[feat];
	}
	
	this._syncStatsAndFeats();
}

RPG.Beings.BaseBeing.prototype.removeModifiers = function(imodifier) {
	var modifiers = imodifier.getModifiers();
	for (var feat in modifiers) {
		if (!(feat in this._featModifiers)) { throw new Error("Feat "+feat+" not modified, cannot remove modifier"); }
		this._featModifiers[feat] -= modifiers[feat];
		if (this._featModifiers[feat] == 0) { delete this._featModifiers[feat]; }
	}
	
	this._syncStatsAndFeats();
}

/* -------------------- PRIVATE --------------- */

RPG.Beings.BaseBeing.prototype._describeLaunch = function(projectile, target) {
}

/**
 * @param {RPG.Combat}
 */
RPG.Beings.BaseBeing.prototype._describeMeleeCombat = function(combat) {
}

/**
 * @param {RPG.Combat}
 */
RPG.Beings.BaseBeing.prototype._describeRangedCombat = function(combat) {
	var defender = combat.getDefender();
	
	if (!combat.wasHit()) {
		var verb = RPG.Misc.verb("evade", defender);
		var s = RPG.Misc.format("%A %s %a.", defender, verb, combat.getAttacker());
		RPG.UI.buffer.message(s);
	} else {
		var s = RPG.Misc.format("%A %is hit.", defender, defender);
		RPG.UI.buffer.message(s);
		if (combat.wasKill()) {
			var s = RPG.Misc.format("%The %is killed!", defender, defender);
			RPG.UI.buffer.message(s);
		}
	}
}

RPG.Beings.BaseBeing.prototype._describeMagicCombat = function(combat) {
	var attacker = combat.getAttacker();
	var defender = combat.getDefender();
	
	if (!combat.wasHit()) {
		var verb = RPG.Misc.verb("evade", defender);
		var s = RPG.Misc.format("%A barely %s %a!", defender, verb, attacker);
		RPG.UI.buffer.message(s);
	} else {
		var s = RPG.Misc.format("%A %is hit by %the.", defender, defender, attacker);
		RPG.UI.buffer.message(s);

		if (combat.wasKill()) {
			var str = RPG.Misc.format("%The %is killed!", defender, defender);
			RPG.UI.buffer.message(str);
		}
	}
}

RPG.Beings.BaseBeing.prototype._syncStatsAndFeats = function() {
	this.adjustStat(RPG.STAT_HP, 0);
	this.adjustStat(RPG.STAT_MANA, 0);
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
	
	/* init all feats from defaults or zero */
	for (var i=0;i<RPG.Feats.length;i++) { this._feats[i] = defaults[i]; }
	
	/* advanced feats aka attributes have randomized value */
	for (var i=0;i<RPG.ATTRIBUTES.length;i++) {
		var attr = RPG.ATTRIBUTES[i];
		var rv = new RPG.RandomValue(defaults[attr], 2);
		this._feats[attr] = rv.roll();
	}

}

RPG.Beings.BaseBeing.prototype._generateCorpse = function() {
	if (RPG.Rules.isCorpseGenerated(this)) {
		return new RPG.Items.Corpse(this);
	}
	return null;
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

