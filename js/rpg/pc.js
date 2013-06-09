/**
 * @class Player character
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.PC = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.PC.visual = { path:"pc", desc:"you" };

/**
 * @param {function} race Race constructor
 * @param {function} profession Profession constructor
 */
RPG.Beings.PC.prototype.init = function(race, profession) {
	this.parent(race);
	
	this._visibleCoordsHash = {}; /* we currently see these */
	this._mapMemory = {}; /* remembered visuals */
	
	this._kills = 0;
	this._quests = [];
	
	this.setFeat(RPG.FEAT_DV, 5);
	this.setFeat(RPG.FEAT_MAX_HP, 10);
	this.setFeat(RPG.FEAT_MAX_MANA, 5);
	
	this._profession = profession;
	new profession().setup(this);
	
	this.addEffect(new RPG.Effects.TurnCounter());
	this.fullStats();
}

RPG.Beings.PC.prototype.getImage = function() {
	return this.parent() + "-" + new this._profession().getImage();
}

RPG.Beings.PC.prototype.toJSON = function(handler) {
	return handler.toJSON(this, {exclude:"_visibleCoordsHash"});
}

RPG.Beings.PC.prototype.getQuests = function() {
	return this._quests;
}

RPG.Beings.PC.prototype.addQuest = function(quest) {
	this._quests.push(quest);
	return this;
}

RPG.Beings.PC.prototype.removeQuest = function(quest) {
	var index = this._quests.indexOf(quest);
	if (index == -1) { throw new Error("Cannot find quest"); }
	this._quests.splice(index, 1);
	return this;
}

RPG.Beings.PC.prototype.getKills = function() {
	return this._kills;
}

RPG.Beings.PC.prototype.getVisibleCoords = function() {
	return this._visibleCoordsHash;
}

RPG.Beings.PC.prototype.addItem = function(item) { 
	item.remember();
	return this.parent(item);
}

RPG.Beings.PC.prototype.setName = function(name) {
	this.parent(name);
	RPG.UI.status.updateName(this._name);
	return this;
}

RPG.Beings.PC.prototype.setStat = function(stat, value) {
	RPG.UI.status.updateStat(stat, value);
	return this.parent(stat, value);
}

RPG.Beings.PC.prototype.setFeat = function(feat, value) {
	this.parent(feat, value);
	RPG.UI.status.updateFeat(feat, this.getFeat(feat));
	return this;
}

RPG.Beings.PC.prototype.setMap = function(map, coords) {
	if (this._map) { this._map.setActive(false); }
	this.parent(map, coords);

	map.setActive(true);
	var id = map.getID();
	RPG.UI.status.updateMap(id); /* update statusbar */
	if (!(id in this._mapMemory)) { this._mapMemory[id] = {}; }
	
	this.updateFromMemory();

	RPG.Game.getEngine().useMap(map); /* switch engine to new actorset */
}

/**
 * @see RPG.Visual.IVisual#describeA
 */
RPG.Beings.PC.prototype.describeA = function() {
	return this.describe();
}

/**
 * @see RPG.Visual.IVisual#describeThe
 */
RPG.Beings.PC.prototype.describeThe = function() {
	return this.describe();
}

/**
 * @see RPG.Beings.BaseBeing#describeHe
 */
RPG.Beings.PC.prototype.describeHe = function() {
	return "you";
}

/**
 * @see RPG.Beings.BaseBeing#describeHim
 */
RPG.Beings.PC.prototype.describeHim = function() {
	return "you";
}

/**
 * @see RPG.Beings.BaseBeing#describeHis
 */
RPG.Beings.PC.prototype.describeHis = function() {
	return "yours";
}


/**
 * @see RPG.Visual.IVisual#describeIs
 */
RPG.Beings.PC.prototype.describeIs = function() {
	return "are";
}

/**
 * PC uses a different approach for visibility testing - maintains a list of visible coords
 */
RPG.Beings.PC.prototype.canSee = function(coords) {
	var id = coords.x+","+coords.y;
	return (id in this._visibleCoordsHash);
}

/**
 * Update the array with all visible coordinates
 */
RPG.Beings.PC.prototype.updateVisibility = function() {
	var visible = this._computeVisibleCoords();
	var oldVisible = this._visibleCoordsHash;
	this._visibleCoordsHash = visible;
	var memory = this._mapMemory[this._map.getID()];

	for (var hash in visible) {
		if (hash in oldVisible) { /* was visible, remove from the list of to-be-memorized */
			delete oldVisible[hash];
			continue; 
		}

		delete memory[hash];
		var visuals = this._getVisualsForCoords(visible[hash]);
		RPG.UI.map.drawAtCoords(visible[hash], visuals, false);
	}

	for (var hash in oldVisible) { /* these should be memorized now (were visible but are not anymore) */
		var visuals = this._getVisualsForCoords(oldVisible[hash]);
		memory[hash] = visuals;
		RPG.UI.map.drawAtCoords(oldVisible[hash], visuals, true);
	}
	
}

RPG.Beings.PC.prototype.updateFromMemory = function() {
	RPG.UI.map.resize(this._map.getSize());
	
	var memory = this._mapMemory[this._map.getID()];
	this._visibleCoordsHash = {};
	for (var hash in memory) {
		var coords = RPG.Coords.fromString(hash);
		RPG.UI.map.drawAtCoords(coords, memory[hash], true);
	}
	this.updateVisibility();
	RPG.UI.refocus();
}

/**
 * Memorize all visible visuals, we are (probably) leaving 
 */
RPG.Beings.PC.prototype.memorizeVisible = function() {
	var memory = this._mapMemory[this._map.getID()];
	for (var hash in this._visibleCoordsHash) {
		var oldCoords = RPG.Coords.fromString(hash);
		var visuals = this._getVisualsForCoords(oldCoords);
		memory[hash] = visuals;
	}
}

RPG.Beings.PC.prototype.clearMemory = function() {
	this._mapMemory[this._map.getID()] = {};
	this.updateFromMemory();
	RPG.UI.buffer.message("You suddenly do not remember anything about this level.");
}

/**
 * Map notifies PC about a change in coords visuals
 */
RPG.Beings.PC.prototype.coordsChanged = function(coords) {
	if (!this.canSee(coords)) { return; }
	var visuals = this._getVisualsForCoords(coords);
	RPG.UI.map.drawAtCoords(coords, visuals, false);
}

/**
 * Returns the list of visuals at a given location
 */
RPG.Beings.PC.prototype._getVisualsForCoords = function(coords) {
	var visuals = [];
	
	var cell = this._map.getCell(coords);
	visuals.push(RPG.Visual.getVisual(cell));
	
	var being = this._map.getBeing(coords);
	var items = this._map.getItems(coords);
	var feature = this._map.getFeature(coords);
	
	if (being && this.canSee(coords)) {
		visuals.push(RPG.Visual.getVisual(being));
	} else if (items.length) {
		visuals.push(RPG.Visual.getVisual(items[items.length-1]));
	} else if (feature && this.knowsFeature(feature)) {
		visuals.push(RPG.Visual.getVisual(feature));
	}
	
	return visuals;
}

RPG.Beings.PC.prototype._computeVisibleCoordsOLD = function() {
	var R = this.getFeat(RPG.FEAT_SIGHT_RANGE);
	var center = this._coords;
	var current = new RPG.Coords(0, 0);
	var map = this._map;
	var eps = 1e-4;
	var c = false;

	/* directions blocked */
	var arcs = [];
	
	/* results */
	var result = {};
	var id = this._coords.x+","+this._coords.y;
	result[id] = this._coords;

	/* standing in a dark place */
	if (map.blocks(RPG.BLOCKS_LIGHT, this._coords)) { return result; }
	
	/* number of cells in current ring */
	var cellCount = 0;

	var arcCount = R*8; /* length of longest ring */
	for (var i=0;i<arcCount;i++) { arcs.push([0, 0]); }
	
	/* analyze surrounding cells in concentric rings, starting from the center */
	for (var r=1; r<=R; r++) {
		cellCount += 8;
		var arcsPerCell = arcCount / cellCount; /* number of arcs per cell */
		
		var coords = map.getCoordsInCircle(center, r, true);
		for (var i=0;i<coords.length;i++) {
			if (!coords[i]) { continue; }
			c = coords[i];

			var startArc = (i-0.5) * arcsPerCell + 0.5;
			if (this._visibleCoordsOLD(map.blocks(RPG.BLOCKS_LIGHT, c), startArc, arcsPerCell, arcs)) { 
				result[c.x+","+c.y] = c; 
			}

			/* cutoff? */
			var done = true;
			for (var j=0;j<arcCount;j++) {
				if (arcs[j][0] + arcs[j][1] + eps < 1) {
					done = false;
					break;
				}
			}
			if (done) { return result; }
		} /* for all cells in this ring */
	} /* for all rings */
	
	return result;
}

/**
 * Subroutine for _computeVisibleCoords(). For a given coords, checks if it is visible and adjusts arcs it blocks.
 * @param {bool} blocks Does this cell block?
 * @param {float} startArc Floating arc index corresponding to first arc shaded by this cell
 * @param {float} arcsPerCell How many arcs are shaded by this one, >= 1
 * @param {arc[]} array of available arcs
 */
RPG.Beings.PC.prototype._visibleCoordsOLD = function(blocks, startArc, arcsPerCell, arcs) {
	var eps = 1e-4;
	var startIndex = Math.floor(startArc);
	var arcCount = arcs.length;
	
	var ptr = startIndex;
	var given = 0; /* amount already distributed */
	var amount = 0;
	var arc = null;
	var ok = false;
	do {
		var index = ptr; /* ptr recomputed to avail range */
		if (index < 0) { index += arcCount; }
		if (index >= arcCount) { index -= arcCount; }
		arc = arcs[index];
		
		/* is this arc is already totally obstructed? */
		var chance = (arc[0] + arc[1] + eps < 1);

		if (ptr < startArc) {
			/* blocks left part of blocker (with right cell part) */
			amount += ptr + 1 - startArc;
			if (chance && amount > arc[0]+eps) {
				/* blocker not blocked yet, this cell is visible */
				ok = true;
				/* adjust blocking amount */
				if (blocks) { arc[0] = amount; }
			}
		} else if (given + 1 > arcsPerCell)  { 
			/* blocks right part of blocker (with left cell part) */
			amount = arcsPerCell - given;
			if (chance && amount > arc[1]+eps) {
				/* blocker not blocked yet, this cell is visible */
				ok = true;
				/* adjust blocking amount */
				if (blocks) { arc[1] = amount; }
			}
		} else {
			/* this cell completely blocks a blocker */
			amount = 1;
			if (chance) {
				ok = true;
				if (blocks) {
					arc[0] = 1;
					arc[1] = 1;
				}
			}
		}
		
		given += amount;
		ptr++;
	} while (given < arcsPerCell);
	
	return ok;
}

/***** NEW shadowcasting here */

RPG.Beings.PC.prototype._computeVisibleCoords = function() {
	var R = this.getFeat(RPG.FEAT_SIGHT_RANGE);
	var center = this._coords;
	var map = this._map;

	/* start and end angles */
	var DATA = [];
	
	/* results */
	var result = {};
	var id = this._coords.x+","+this._coords.y;
	result[id] = this._coords;

	/* standing in a dark place */
	if (map.blocks(RPG.BLOCKS_LIGHT, this._coords)) { return result; }
	
	var cellCount = 0;
	var A = 0;
	var B = 0;
	var c = false;
	var blocks = false;
	
	/* analyze surrounding cells in concentric rings, starting from the center */
	for (var r=1; r<=R; r++) {
		var coords = map.getCoordsInCircle(center, r, true);
		cellCount = coords.length;
		var angle = 360 / cellCount;

		for (var i=0;i<cellCount;i++) {
			if (!coords[i]) { continue; }
			c = coords[i];
			
			A = angle * (i - 0.5);
			B = A + angle;
			blocks = map.blocks(RPG.BLOCKS_LIGHT, c);
			
			if (this._visibleCoords(Math.floor(A), Math.ceil(B), blocks, DATA)) { result[c.x+","+c.y] = c; }
			
			/* cutoff? */
			if (DATA.length == 2 && DATA[0] == 0 && DATA[1] == 360) { return result; }
		} /* for all cells in this ring */
	} /* for all rings */
	
	return result;
}

RPG.Beings.PC.prototype._visibleCoords = function(A, B, blocks, DATA) {
	if (A < 0) { 
		var v1 = arguments.callee(0, B, blocks, DATA);
		var v2 = arguments.callee(360+A, 360, blocks, DATA);
		return v1 || v2;
	}
	
	var index = 0;
	while (index < DATA.length && DATA[index] < A) { index++; }
	
	if (index == DATA.length) { /* completely new shadow */
		if (blocks) { DATA.push(A, B); } 
		return true;
	}
	
	var count = 0;
	
	if (index % 2) { /* this shadow starts in an existing shadow, or within its ending boundary */
		while (index < DATA.length && DATA[index] < B) {
			index++;
			count++;
		}
		
		if (count == 0) { return false; }
		
		if (blocks) { 
			if (count % 2) {
				DATA.splice(index-count, count, B);
			} else {
				DATA.splice(index-count, count);
			}
		}
		
		return true;

	} else { /* this shadow starts outside an existing shadow, or within a starting boundary */
		while (index < DATA.length && DATA[index] < B) {
			index++;
			count++;
		}
		
		/* visible when outside an existing shadow, or when overlapping */
		if (A == DATA[index-count] && count == 1) { return false; }
		
		if (blocks) { 
			if (count % 2) {
				DATA.splice(index-count, count, A);
			} else {
				DATA.splice(index-count, count, A, B);
			}
		}
			
		return true;
	}
}

/***** NEW shadowcasting END */

function b() {
	var t1 = new Date().getTime();
	for (var i=0;i<100;i++) { RPG.Game.pc._computeVisibleCoordsOLD(); }
	var t2 = new Date().getTime();
	for (var i=0;i<100;i++) { RPG.Game.pc._computeVisibleCoords(); }
	var t3 = new Date().getTime();
	console.log(t2-t1, t3-t2);
}


RPG.Beings.PC.prototype.yourTurn = function() {
	return RPG.ACTION_DEFER;
}

RPG.Beings.PC.prototype.teleport = function(coords) {
	RPG.UI.buffer.message("You suddenly teleport away!");
	this.parent(coords);
}

/* ------------------------- ACTIONS -----------------*/

RPG.Beings.PC.prototype.activateTrap = function(trap) {
	trap.setOff(this);
	return RPG.ACTION_TIME;
}

RPG.Beings.PC.prototype.move = function(target, ignoreOldCoords) {
	var result = this.parent(target, ignoreOldCoords);
	
	if (target) {
		this._describeLocal();
		this.updateVisibility();
		RPG.UI.refocus();
	}
	
	return result;
}

/**
 * Flirt with someone
 * @param {RPG.Coords} coords
 */
RPG.Beings.PC.prototype.flirt = function(coords) {
	var being = this._map.getBeing(coords);

	if (this == being) {
		RPG.UI.buffer.message("You spend some nice time flirting with yourself.");
		return RPG.ACTION_TIME;
	}
	
	if (!being) {
		RPG.UI.buffer.message("There is no one to flirt with!");
		return RPG.ACTION_TIME;
	}

	var s = RPG.Misc.format("%The doesn't seem to be interested.", being);
	RPG.UI.buffer.message(s);
	return RPG.ACTION_TIME;
}

/**
 * Switch position
 * @param {RPG.Coords} coords
 */
RPG.Beings.PC.prototype.switchPosition = function(coords) {
	var being = this._map.getBeing(coords);
	
	if (!being) {
		RPG.UI.buffer.message("There is no one to switch position with.");
		return RPG.ACTION_TIME;
	}
	
	if (!being.getAI().isSwappable(this)) {
		/* impossible */
		var s = RPG.Misc.format("%The resists!", being);
		RPG.UI.buffer.message(s);
	} else {
		RPG.UI.buffer.message("You switch positions.");
/*
		} else if (pc.canSee(this._target.getCoords())) {
			var s = RPG.Misc.format("%A sneaks past %a.", this._source, being);
			RPG.UI.buffer.message(s);
		}
*/		
		var source = this._coords;
		this.move(coords, true);
		being.move(source, true);
	}

	return RPG.ACTION_TIME;
}

RPG.Beings.PC.prototype.equipDone = function() {
	RPG.UI.buffer.message("You adjust your equipment.");
	this.updateVisibility(); /* sight range might got changed */
	return RPG.ACTION_TIME;
}

/**
 * Looking around
 * @param {RPG.Coords} coords
 */
RPG.Beings.PC.prototype.look = function(coords) {
	this._describeRemote(coords);
	return RPG.ACTION_NO_TIME;
}

/**
 * Enter staircase or other level-changer
 * @param {RPG.Features.BaseFeature} feature
 */
RPG.Beings.PC.prototype.enterConnector = function() {
	var f = this._map.getFeature(this._coords);
	var s = RPG.Misc.format("You enter %the...", f);
	RPG.UI.buffer.message(s);
	return f.enter(this);
}

/**
 * Search surroundings
 */
RPG.Beings.PC.prototype.search = function() {
	RPG.UI.buffer.message("You search your surroundings...");

	var coords = this._map.getCoordsInCircle(this._coords, 1, false);
	for (var i=0;i<coords.length;i++) { this._search(coords[i]); }

	return RPG.ACTION_TIME;
}

/**
 * @returns {int} 1 = revealed, 0 = not revealed
 */
RPG.Beings.PC.prototype._search = function(coords) {
	var cell = this._map.getCell(coords);
	if (cell.isFake() && RPG.Rules.isFakeDetected(this, cell)) {
		cell.reveal(this._map, coords); /* reveal! */

		var desc = "passage";
		if (this._map.getFeature(coords)) { desc = this._map.getFeature(coords).describe(); }
		var s = RPG.Misc.format("You discover a hidden %s!", desc);
		RPG.UI.buffer.message(s);
		
		this.coordsChanged(coords);
		this.updateVisibility();
		return;
	}
	
	var f = this._map.getFeature(coords);
	if (f && f instanceof RPG.Features.Trap && !this.knowsFeature(f) && RPG.Rules.isTrapDetected(this, f)) {
		this._knownFeatures.push(f);
		var s = RPG.Misc.format("You discover %a!", f);
		RPG.UI.buffer.message(s);
		this.coordsChanged(coords);
		return;
	}
}

RPG.Beings.PC.prototype.chat = function(being) {
	if (being.getAI().isHostile(this)) {
		var s = RPG.Misc.format("%The is not in the mood for talking!", being);
		RPG.UI.buffer.message(s);
		return RPG.ACTION_TIME;
	}
	
	var s = RPG.Misc.format("You talk to %a.", being);
	RPG.UI.buffer.message(s);

	if (being.getAI().getDialogText(this)) {
		return being.chat(this);
	} else {
		var s = RPG.Misc.format("%He does not reply.", being);
		RPG.UI.buffer.message(s);
		return RPG.ACTION_TIME;
	}
}

/**
 * Kick something
 * @param {RPG.Coords} coords
 */
RPG.Beings.PC.prototype.kick = function(coords) {
	var feature = this._map.getFeature(coords);
	var being = this._map.getBeing(coords);
	var items = this._map.getItems(coords);
	var cell = this._map.getCell(coords);
	
	if (coords.equals(this._coords)) {
		RPG.UI.buffer.message("You would not do that, would you?");
		return RPG.ACTION_NO_TIME;
	}
	
	if (feature && feature.blocks(RPG.BLOCKS_MOVEMENT) && feature.constructor.implements(RPG.Misc.IDamageReceiver)) {
		var combat = new RPG.Combat(this.getSlot(RPG.SLOT_FEET), feature).execute();
		if (!combat.wasHit()) {
			var s = RPG.Misc.format("You miss %the.", feature);
			RPG.UI.buffer.message(s);
			return; 
		}
		if (combat.wasKill()) {
			var s = RPG.Misc.format("You shatter %the with a mighty kick!", feature);
			RPG.UI.buffer.message(s);
		} else {
			var s = RPG.Misc.format("You kick %the, but it still holds.", feature);
			RPG.UI.buffer.message(s);
		}
		return RPG.ACTION_TIME;
	}
	
	if (being) { /* kick being - async */
		var yes = function() { return this.attackMelee(being, this.getSlot(RPG.SLOT_FEET)); }
		return being.confirmAttack(yes.bind(this));
	}

	if (this._map.blocks(RPG.BLOCKS_ITEMS, coords)) {
		RPG.UI.buffer.message("Ouch! That hurts!");
		return RPG.ACTION_TIME;
	}
	
	if (items.length) { /* try kicking items */
		var dir = this._coords.dirTo(coords);
		var target = coords.neighbor(dir);
		
		if (!this._map.blocks(RPG.BLOCKS_ITEMS, target)) { /* kick topmost item */
			var item = items[items.length-1];
			this._map.removeItem(item, coords);
			this._map.addItem(item, target);
			
			var s = RPG.Misc.format("You kick %the. It slides away.", item);
			if(cell.isWater()) {
				s = "Splash! " + s;
			}
			RPG.UI.buffer.message(s);
			
			return RPG.ACTION_TIME;
		}
	}

	if(cell.isWater()) {
		RPG.UI.buffer.message("Splash! You kick at the water.");
		return RPG.ACTION_TIME;
	}

	RPG.UI.buffer.message("You kick in empty air.");
	return RPG.ACTION_TIME;

}

RPG.Beings.PC.prototype.open = function(door) {
	var locked = door.isLocked();
	if (locked) { 
		var lockpick = null;
		for (var i=0;i<this._items.length;i++) {
			if (this._items[i] instanceof RPG.Items.Lockpick) { lockpick = this._items[i]; }
		}
		if (!lockpick) {
			RPG.UI.buffer.message("The door is locked. You do not have the appropriate key."); 
			return RPG.ACTION_TIME;
		}
		if (lockpick.getAmount() > 1) {
			lockpick.setAmount(lockpick.getAmount() - 1);
		} else {
			this.removeItem(lockpick);
		}
		RPG.UI.buffer.message("You unlock the door with a lockpick.");
		door.unlock();
	}
	
	var stuck = RPG.Rules.isDoorStuck(this, door);
	if (stuck) {
		RPG.UI.buffer.message("Ooops! The door is stuck.");
		return RPG.ACTION_TIME;
	}
	
	door.open();

	var verb = RPG.Misc.verb("open", this);
	var s = RPG.Misc.format("%A %s the door.", this, verb);
	RPG.UI.buffer.message(s);
	
	return RPG.ACTION_TIME;
}

/**
 * Close a door
 * @param {RPG.Features.Door} door
 */
RPG.Beings.PC.prototype.close = function(door) {
	var coords = door.getCoords();
	if (this._map.getBeing(coords)) {
		RPG.UI.buffer.message("There is someone standing at the door.");
		return RPG.ACTION_NO_TIME;
	}

	var items = this._map.getItems(coords);
	if (items.length) {
		if (items.length == 1) {
			RPG.UI.buffer.message("An item blocks the door.");
		} else {
			RPG.UI.buffer.message("Several items block the door.");
		}
		return RPG.ACTION_NO_TIME;
	}

	var verb = RPG.Misc.verb("close", this);
	var s = RPG.Misc.format("%A %s the door.", this, verb);
	RPG.UI.buffer.message(s);

	door.close();

	return RPG.ACTION_TIME;
}


RPG.Beings.PC.prototype.attackMagic = function(being, spell) {
	var result = this.parent(being, spell);
	if (!being.isAlive()) { this._kills++; }
	return result;
}

RPG.Beings.PC.prototype.attackMelee = function(being, slot) {
	var result = this.parent(being, slot);
	if (!being.isAlive()) { this._kills++; }
	return result;
}

RPG.Beings.PC.prototype.attackRanged = function(being, projectile) {
	var result = this.parent(being, projectile);
	if (!being.isAlive()) { this._kills++; }
	return result;
}

/* ------------------- PRIVATE --------------- */

RPG.Beings.PC.prototype._describeMeleeCombat = function(combat) {
	var defender = combat.getDefender();
	
	if (!combat.wasHit()) {
		var s = RPG.Misc.format("You miss %the.", defender);
		RPG.UI.buffer.message(s);
		return;
	}
	
	var hitVerb = (combat.getAttacker() instanceof RPG.Slots.Kick ? "kick" : "hit");
	var s = RPG.Misc.format("You %s %the", hitVerb, defender);
	if (!combat.getDamage()) {
		s += RPG.Misc.format(", but do not manage to harm %him.", defender);
		RPG.UI.buffer.message(s);
		return;
	}
	
	if (combat.wasKill()) {
		var killVerb = ["kill", "slay"].random();
		s += RPG.Misc.format(" and %s %him!", killVerb, defender);
		RPG.UI.buffer.message(s);
	} else {
		s += RPG.Misc.format(" and %s wound %him.", defender.woundedState(), defender);
		RPG.UI.buffer.message(s);
	}
}

RPG.Beings.PC.prototype._describeLocal = function() {
	var f = this._map.getFeature(this._coords);
	if (f && this.knowsFeature(f)) {
		var s = RPG.Misc.format("%A.", f);
		RPG.UI.buffer.message(s);
	}
	
	var items = this._map.getItems(this._coords);
	if (items.length > 1) {
		RPG.UI.buffer.message("Several items are lying here.");
	} else if (items.length == 1) {
		var item = items[0];
		var s = RPG.Misc.format("%A %is lying here.", item, item);
		RPG.UI.buffer.message(s);
	}
}

RPG.Beings.PC.prototype._describeRemote = function(coords) {
	if (!this.canSee(coords)) {
		RPG.UI.buffer.message("You can not see that place.");
		return;
	}
	
	var b = this._map.getBeing(coords);
	if (b) {
		var s = "";
		if (b == this) {
			s = RPG.Misc.format("You are %s wounded.", b.woundedState());
			RPG.UI.buffer.message(s);
		} else {
			this._describeBeing(b);
		}
		return;
	}
	
	var s = RPG.Misc.format("%A.", this._map.getCell(coords));
	RPG.UI.buffer.message(s);

	var f = this._map.getFeature(coords);
	if (f && this.knowsFeature(f)) {
		var s = RPG.Misc.format("%A.", f);
		RPG.UI.buffer.message(s);
	}
	
	var items = this._map.getItems(coords);
	if (items.length) {
		var what = "";
		if (items.length > 1) {
			what = "several items are";
		} else if (items.length > 0) {
			what = RPG.Misc.format("%a %is", items[0], items[0]);
		}
		var s = RPG.Misc.format("%S lying there.", what);
		RPG.UI.buffer.message(s);
	}	
}

RPG.Beings.PC.prototype._describeBeing = function(b) {
	/* being with equipped weapon and/or shield */
	var arr = [];
	var ws = b.getSlot(RPG.SLOT_WEAPON);
	var weapon = (ws ? ws.getItem() : null);
	var ss = b.getSlot(RPG.SLOT_SHIELD);
	var shield = (ss ? ss.getItem() : null);
	if (weapon) { arr.push(RPG.Misc.format("%a", weapon)); }
	if (shield) { arr.push(RPG.Misc.format("%a", shield)); }
	var format = "%A";
	if (arr.length) {
		format += ", wielding " + arr.join(" and ") + ".";
	} else {
		format += ".";
	}
	var s = RPG.Misc.format(format, b);
	RPG.UI.buffer.message(s);

	/* difficulty report */
	this._describeDifficulty(b);
	
	/* wound status */
	var s = RPG.Misc.format("%He %is %s wounded.", b, b, b.woundedState());
	RPG.UI.buffer.message(s);
	
	/* hostility */
	if (b.getAI().isHostile(this)) {
		s = RPG.Misc.format("%The is hostile.", b);
	} else {
		s = RPG.Misc.format("%The does not seem to be hostile.", b);
	}
	RPG.UI.buffer.message(s);
}

RPG.Beings.PC.prototype._describeDifficulty = function(b) {
	var r1 = this.computeRating();
	var r2 = b.computeRating();
	var ratio = r2/r1 - 1;
	ratio *= 3;

	var list = ["a trivial", "an easy", "a moderate", "a tough", "a difficult"];
	var index = Math.round(ratio + list.length/2 - 1/2);
	index = Math.max(index, 0);
	index = Math.min(index, list.length-1);
	
	var s = RPG.Misc.format("%He seems to be %s opponent.", b, list[index]);
	RPG.UI.buffer.message(s);
}

