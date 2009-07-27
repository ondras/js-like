
/**
 * @class Player character
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.PC = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.PC.prototype.init = function() {
	this.parent();
	
	this._mapMemory = new RPG.Memory.MapMemory();
	this._itemMemory = new RPG.Memory.ItemMemory();
	this._visibleCells = [];

	this._default = {
		speed: 100,
		maxhp: 10,
		dv: 5,
		pv: 0,
		strength: 11,
		toughness: 11,
		dexterity: 11,
		intelligence: 11
	}
	
	this._description = "you";
}

RPG.Beings.PC.prototype.setup = function(race) {
	this._setRace(race);

	this._char = "@";
	
	var tc = new RPG.Effects.TurnCounter().setup();
	this._turnCounter = tc;
	this.addEffect(tc);
	
	return this.parent();
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
