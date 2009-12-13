
/**
 * @class Player character
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.PC = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.PC.prototype.init = function(race, profession) {
	this.parent(race);
	this._image += "-" + profession.getImage();
	
	this._mapMemory = new RPG.Memory.MapMemory();
	this._visibleCells = [];
	
	this._spells = [];
	this._description = "you";
	this._char = "@";
	this._kills = 0;
	this._quests = [];
	
	this.setFeat(RPG.FEAT_DV, 5);
	this.setFeat(RPG.FEAT_MAX_HP, 10);
	this.setFeat(RPG.FEAT_MAX_MANA, 5);
	profession.setup(this);
	
	var tc = new RPG.Effects.TurnCounter(this);
	this._turnCounter = tc;
	this.addEffect(tc);
	
	this.fullStats();
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

RPG.Beings.PC.prototype.addKill = function(being) {
	this._kills++;
}

RPG.Beings.PC.prototype.getTurnCount = function() {
	return this._turnCounter.getCount();
}

RPG.Beings.PC.prototype.mapMemory = function() {
	return this._mapMemory;
}

RPG.Beings.PC.prototype.getVisibleCoords = function() {
	return this._visibleCoords;
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

RPG.Beings.PC.prototype.addSpell = function(spell) {
	this._spells.push(spell);
	return this;
}

RPG.Beings.PC.prototype.getSpells = function() {
	return this._spells;
}

RPG.Beings.PC.prototype.setStat = function(stat, value) {
	var value = this.parent(stat, value);
	RPG.UI.status.updateStat(stat, value);
	return value;
}

RPG.Beings.PC.prototype.updateFeat = function(feat) {
	var value = this.parent(feat);
	RPG.UI.status.updateFeat(feat, value);
	return value;
}

RPG.Beings.PC.prototype.setFeat = function(feat, value) {
	var value = this.parent(feat, value);
	RPG.UI.status.updateFeat(feat, value);
	return value;
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
	var R = this.getFeat(RPG.FEAT_SIGHT_RANGE);
	var center = this._cell.getCoords();
	var current = new RPG.Misc.Coords(0, 0);
	var map = this._cell.getMap();
	var cell = null;
	var eps = 1e-4;

	/* directions blocked */
	var arcs = [];
	
	/* results */
	this._visibleCoords = [this._cell.getCoords().clone()];
	
	/* number of cells in current ring */
	var cellCount = 0;

	var arcCount = R*8; /* length of longest ring */
	for (var i=0;i<arcCount;i++) { arcs.push([0, 0]); }
	
	/* analyze surrounding cells in concentric rings, starting from the center */
	for (var r=1; r<=R; r++) {
		cellCount += 8;
		arcsPerCell = arcCount / cellCount; /* number of arcs per cell */
		
		var cells = map.cellsInCircle(center, r, true);
		for (var i=0;i<cells.length;i++) {
			if (!cells[i]) { continue; }
			cell = cells[i];

			var startArc = (i-0.5) * arcsPerCell + 0.5;
			if (this._visibleCell(!cell.visibleThrough(), startArc, arcsPerCell, arcs)) { 
				this._visibleCoords.push(cell.getCoords()); 
			}

			/* cutoff? */
			var done = true;
			for (var j=0;j<arcCount;j++) {
				if (arcs[j][0] + arcs[j][1] + eps < 1) {
					done = false;
					break;
				}
			}
			if (done) { return; }
		} /* for all cells in this ring */
	} /* for all rings */
}

/**
 * Subroutine for updateVisibility(). For a given cell, checks if it is visible and adjusts arcs it blocks.
 * @param {bool} blocks Does this cell block?
 * @param {float} startArc Floating arc index corresponding to first arc shaded by this cell
 * @param {float} arcsPerCell How many arcs are shaded by this one, >= 1
 * @param {arc[]} array of available arcs
 */
RPG.Beings.PC.prototype._visibleCell = function(blocks, startArc, arcsPerCell, arcs) {
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

/**
 * PC being dies
 */
RPG.Beings.PC.prototype.die = function() {
	RPG.UI.status.updateStat(RPG.STAT_HP, this._stats[RPG.STAT_HP]);
	this._alive = false;
	RPG.World.action(new RPG.Actions.Death(this)); 
}
