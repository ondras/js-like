
/**
 * @class Player character
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.PC = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.PC.prototype.init = function(race, profession) {
	this.parent(race);
	this._profession = profession;
	this._image += "-" + profession;
	
	this._mapMemory = new RPG.Memory.MapMemory();
	this._itemMemory = new RPG.Memory.ItemMemory();
	this._spellMemory = new RPG.Memory.SpellMemory();
	this._visibleCells = [];
	
	this._description = "you";
	this._char = "@";
	
	this.setFeat(RPG.FEAT_DV, 5);
	this.setFeat(RPG.FEAT_MAXHP, 10);
	
	var tc = new RPG.Effects.TurnCounter(this);
	this._turnCounter = tc;
	this.addEffect(tc);
	
	this.fullHP();
}

RPG.Beings.PC.prototype.getTurnCount = function() {
	return this._turnCounter.getCount();
}

RPG.Beings.PC.prototype.mapMemory = function() {
	return this._mapMemory;
}

RPG.Beings.PC.prototype.itemMemory = function() {
	return this._itemMemory;
}

RPG.Beings.PC.prototype.spellMemory = function() {
	return this._spellMemory;
}

RPG.Beings.PC.prototype.getVisibleCoords = function() {
	return this._visibleCoords;
}

RPG.Beings.PC.prototype.setName = function(name) {
	this.parent(name);
	RPG.UI.status.updateName();
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
	var eps = 1e-4;

	/* directions blocked */
	var arcs = [];
	
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
	
	var arcCount = R*8; /* length of longest ring */
	for (var i=0;i<arcCount;i++) { arcs.push([0, 0]); }
	
	/* analyze surrounding cells in concentric rings, starting from the center */
	for (var r=1; r<=R; r++) {
		cellCount += 8;
		edgeLength += 2;
		arcsPerCell = arcCount / cellCount; /* number of arcs per cell */

		/* start in the lower right corner of current ring */
		current.x = center.x + r;
		current.y = center.y + r;
		var counter = 0;
		var directionIndex = 0;
		do {
			counter++;
			if (map.isValid(current)) { 
				/* check individual cell */
				var centralAngle = (counter-1) * arcsPerCell + 0.5;
				cell = map.at(current);
				
				if (cell && this._visibleCell(cell, centralAngle, arcsPerCell, arcs)) { 
					this._visibleCoords.push(current.clone()); 
				}
			}
			current.x += directions[directionIndex][0];
			current.y += directions[directionIndex][1];

			/* cutoff? */
			var done = true;
			for (var i=0;i<arcCount;i++) {
				if (arcs[i][0] + arcs[i][1] + eps < 1) {
					done = false;
					break;
				}
			}
			if (done) { return; }
			
			/* do a turn */
			if (!(counter % edgeLength)) { directionIndex++; }

		} while (counter < cellCount);
	}
}

/**
 * Subroutine for updateVisibility(). For a given cell, checks if it is visible and adjusts arcs it blocks.
 * @param {RPG.Cells.BaseCell} cell
 * @param {float} centralAngle Angle which best corresponds with a given cell
 * @param {float} arcsPerCell How many arcs are shaded by this one
 * @param {arc[]} array of available arcs
 */
RPG.Beings.PC.prototype._visibleCell = function(cell, centralAngle, arcsPerCell, arcs) {
	var eps = 1e-4;
	var map = cell.getMap();
	var blocks = !cell.visibleThrough();
	var start = centralAngle - arcsPerCell/2;
	var startIndex = Math.floor(start);
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

		if (ptr < start) {
			/* blocks left part of blocker (with right cell part) */
			amount += ptr + 1 - start;
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
 * PC incorporates his/hers race into a set of modifier holders
 */
RPG.Beings.PC.prototype._getModifierHolders = function() {
	var arr = this.parent();
//	arr.push(this._class);
	return arr;
}

/**
 * PC being dies
 */
RPG.Beings.PC.prototype.die = function() {
	this._alive = false;
	RPG.World.action(new RPG.Actions.Death(this)); 
}
