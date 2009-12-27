/**
 * @class Wander in rectangular area
 * @augments RPG.AI.Task
 */
RPG.AI.WanderInArea = OZ.Class().extend(RPG.AI.Task);
RPG.AI.WanderInArea.prototype.init = function(corner1, corner2) {
	this.parent();
	this._corner1 = corner1.clone();
	this._corner2 = corner2.clone();
}

RPG.AI.WanderInArea.prototype.go = function() {
	var being = this._ai.getBeing();
	var cell = being.getCell();
	
	if (!this._inArea(cell.getCoords())) { /* PANIC! We are not in our area */
		this._ai.setActionResult(being.wait());
		return RPG.AI_OK;
	}
	
	var map = cell.getMap();
	var neighbors = map.cellsInCircle(cell.getCoords(), 1);
	var avail = [null];
	for (var i=0;i<neighbors.length;i++) {
		var neighbor = neighbors[i];
		if (!neighbor.isFree()) { continue; }
		if (!this._inArea(neighbor.getCoords())) { continue; }
		avail.push(neighbor);
	}
	
	var target = avail[Math.floor(Math.random() * avail.length)];
	if (target) {
		this._ai.setActionResult(being.move(target));
	} else {
		this._ai.setActionResult(being.wait());
	}
	
	return RPG.AI_OK;
}

RPG.AI.WanderInArea.prototype._inArea = function(coords) {
	if (coords.x < this._corner1.x || coords.x > this._corner2.x) { return false; }
	if (coords.y < this._corner1.y || coords.y > this._corner2.y) { return false; }
	return true;
}

/**
 * @class Kill task
 * @augments RPG.AI.Task
 */
RPG.AI.Kill = OZ.Class().extend(RPG.AI.Task);

RPG.AI.Kill.prototype.init = function(being) {
	this.parent();
	this._being = being;
	this._attack = new RPG.AI.Attack(being);
}

RPG.AI.Kill.prototype.setAI = function(ai) {
	this.parent(ai);
	this._attack.setAI(ai);
}

RPG.AI.Kill.prototype.go = function() {
	return this._attack.go();
}

RPG.AI.Kill.prototype.getBeing = function() {
	return this._being;
}

/**
 * Attack task
 * @augments RPG.AI.Task
 */
RPG.AI.Attack = OZ.Class().extend(RPG.AI.Task);
RPG.AI.Attack.prototype.init = function(being) {
	this.parent();
	this._being = being;
	this._approach = new RPG.AI.Approach(being);
}

RPG.AI.Attack.prototype.setAI = function(ai) {
	this.parent(ai);
	this._approach.setAI(ai);
}

RPG.AI.Attack.prototype.go = function() {
	if (!this._being.isAlive()) { return RPG.AI_ALREADY_DONE; }
	var result = this._approach.go();
	switch (result) {
		case RPG.AI_IMPOSSIBLE:
			return result;
		break;
		case RPG.AI_ALREADY_DONE: /* approaching not valid, we can attack */
			var being = this._ai.getBeing();
			var slot = being.getSlot(RPG.SLOT_WEAPON);
			this._ai.setActionResult(being.attackMelee(this._being, slot));
			return RPG.AI_OK;
		break;
		case RPG.AI_OK:
			return RPG.AI_OK;
		break;
	}
}
	
/**
 * @class Approach task - get to distance 1 to a given target
 * @augments RPG.AI.Task
 */
RPG.AI.Approach = OZ.Class().extend(RPG.AI.Task);	

/**
 * @param {RPG.Beings.BaseBeing} being
 */
RPG.AI.Approach.prototype.init = function(being) {
	this.parent();
	this._being = being;
	/* target last seen here */
	this._lastCoords = null; 
}

RPG.AI.Approach.prototype.go = function() {
	var being = this._ai.getBeing();
	var c1 = being.getCell().getCoords();
	var c2 = this._being.getCell().getCoords();
	
	if (c1.distance(c2) == 1) { return RPG.AI_ALREADY_DONE; } /* we are happy when distance==1 */
	
	if (this._lastCoords && this._lastCoords.x == c1.x && this._lastCoords.y == c1.y) { 
		/* we just arrived at last seen coords */
		this._lastCoords = null;
	}
	
	if (being.canSee(c2)) { /* we can see the victim; record where is it standing */
		this._lastCoords = c2.clone();
	}
	
	if (this._lastCoords) {
		/* we know where to go */
		var cell = RPG.AI.cellToDistance(being.getCell(), this._being.getCell(), 1);
		if (cell) {
			this._ai.setActionResult(being.move(cell));
		} else {
			this._ai.setActionResult(being.wait());
		}
		return RPG.AI_OK;
	} else {
		return RPG.AI_IMPOSSIBLE;
	}
}

/**
 * @class Run away from a being
 * @augments RPG.AI.Task
 */
RPG.AI.Retreat = OZ.Class().extend(RPG.AI.Task);

RPG.AI.Retreat.prototype.init = function(being) {
	this.parent();
	this._being = being;
}

RPG.AI.Retreat.prototype.go = function() {
	var being = this._ai.getBeing();
	
	/* we are okay, no more retreating necessary */
	if (!RPG.Rules.isWoundedToRetreat(being)) { return RPG.AI_ALREADY_DONE; }
	
	var c1 = being.getCell().getCoords();
	var c2 = this._being.getCell().getCoords();

	if (being.canSee(c2)) {
		/* we see the target so we know how to run away */
		var cell = RPG.AI.cellToDistance(being.getCell(), this._being.getCell(), 1e5);
		if (cell) {
			this._ai.setActionResult(being.move(cell));
		} else {
			this._ai.setActionResult(being.wait());
		}
		return RPG.AI_OK;
	} else {
		/* enemy is not visible */
		return RPG.AI_IMPOSSIBLE;
	}
}

RPG.AI.Retreat.prototype.getBeing = function() {
	return this._being;
}
