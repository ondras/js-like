/**
 * @class Wait
 * @augments RPG.AI.Task
 */
RPG.AI.Wait = OZ.Class().extend(RPG.AI.Task);
RPG.AI.Wait.prototype.go = function() {
	var being = this._ai.getBeing();
    this._ai.setActionResult(being.wait());
    return RPG.AI_OK;
}

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
	this._subtasks.melee = new RPG.AI.AttackMelee(being);
	this._subtasks.ranged = new RPG.AI.AttackRanged(being);
	this._subtasks.magic = new RPG.AI.AttackMagic(being);
}

RPG.AI.Kill.prototype.go = function() {
	if (!this._being.isAlive()) { return RPG.AI_ALREADY_DONE; }
	var order = [this._subtasks.magic, this._subtasks.ranged, this._subtasks.melee];
	for (var i=0;i<order.length;i++) {
		var result = order[i].go();
		if (result == RPG.AI_OK) { return result; }
	}

	return RPG.AI_IMPOSSIBLE;
}

RPG.AI.Kill.prototype.getBeing = function() {
	return this._being;
}

/**
 * Melee attack task. Does not check opponet's state.
 * @augments RPG.AI.Task
 */
RPG.AI.AttackMelee = OZ.Class().extend(RPG.AI.Task);
RPG.AI.AttackMelee.prototype.init = function(being) {
	this.parent();
	this._being = being;
	this._subtasks.approach = new RPG.AI.Approach(being);
}

RPG.AI.AttackMelee.prototype.go = function() {
	var result = this._subtasks.approach.go();
	switch (result) {
		case RPG.AI_IMPOSSIBLE:
			return result;
		break;
		case RPG.AI_ALREADY_DONE: /* approaching not necessary, we can attack */
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
 * Ranged attack task. Does not check opponet's state.
 * @augments RPG.AI.Task
 */
RPG.AI.AttackRanged = OZ.Class().extend(RPG.AI.Task);
RPG.AI.AttackRanged.prototype.init = function(being) {
	this.parent();
	this._being = being;
}

RPG.AI.AttackRanged.prototype.go = function() {
	var being = this._ai.getBeing();
	var slot = being.getSlot(RPG.SLOT_PROJECTILE);
	if (!slot) { return RPG.AI_IMPOSSIBLE; } /* we cannot use ranged weapons */
	
	var projectile = slot.getItem();
	if (!projectile) { return RPG.AI_IMPOSSIBLE; } /* we have no projectiles ready */
	
	if (!projectile.isLaunchable()) { return RPG.AI_IMPOSSIBLE; } /* missing a launcher */

	var targetCoords = this._being.getCell().getCoords();
	var trajectory = projectile.computeTrajectory(being.getCell(), targetCoords);
	var last = trajectory.cells.pop();
	if (last != this._being.getCell()) { return RPG.AI_IMPOSSIBLE; } /* some obstacle or we are too far */
	
	var result = being.launch(projectile, last);
	this._ai.setActionResult(result);
	return RPG.AI_OK;
}

/**
 * Magic attack task. Does not check opponet's state.
 * @augments RPG.AI.Task
 */
RPG.AI.AttackMagic = OZ.Class().extend(RPG.AI.Task);
RPG.AI.AttackMagic.prototype.init = function(being) {
	this.parent();
	this._being = being;
}

RPG.AI.AttackMagic.prototype.go = function() {
	var being = this._ai.getBeing();
	var cell = being.getCell();
	var target = this._being.getCell();
	
	/* MagicBolt */
	if (being.hasSpell(RPG.Spells.MagicBolt, true)) {
		var spell = new RPG.Spells.MagicBolt(being);
		for (var i=0;i<8;i++) { /* find some direction */
			var trajectory = spell.computeTrajectory(cell, i);
			var selfHit = false;
			var targetHit = false;
			for (var j=0;j<trajectory.cells.length;j++) { /* check if target is hit and we are not */
				var test = trajectory.cells[j];
				if (test == target) { targetHit = true; }
				if (test == cell) { selfHit = true; }
			}
			if (targetHit && !selfHit) { /* launch! */
				var result = being.cast(spell, i);
				this._ai.setActionResult(result);
				return RPG.AI_OK;
			}
		}
	}
	
	/* MagicExplosion */
	if (being.hasSpell(RPG.Spells.MagicExplosion, true)) {
		var spell = new RPG.Spells.MagicExplosion(being);
		var dist = cell.getCoords().distance(target.getCoords()); 
		if (dist <= spell.getRadius()) {
			var result = being.cast(spell);
			this._ai.setActionResult(result);
			return RPG.AI_OK;
		}
	}

	/* Fireball */
	if (being.hasSpell(RPG.Spells.Fireball, true)) {
		var spell = new RPG.Spells.Fireball(being);
		var dist = cell.getCoords().distance(target.getCoords()); 
		if (dist > spell.getRadius() && dist <= spell.getRadius() + spell.getRange()) {
			var result = being.cast(spell, target.getCoords());
			this._ai.setActionResult(result);
			return RPG.AI_OK;
		}
	}

	return RPG.AI_IMPOSSIBLE;
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
 * @class Act defensively
 * @augments RPG.AI.Task
 */
RPG.AI.ActDefensively = OZ.Class().extend(RPG.AI.Task);

RPG.AI.ActDefensively.prototype.init = function(being) {
	this.parent();
	this._subtasks.heal = new RPG.AI.HealSelf();
	this._subtasks.retreat = new RPG.AI.Retreat(being);
}

RPG.AI.ActDefensively.prototype.go = function() {
	var being = this._ai.getBeing();

	/* we are okay, no defense is necessary */
	if (!RPG.Rules.isWoundedToRetreat(being)) { return RPG.AI_ALREADY_DONE; }

	/* try to heal ourselves */
	if (this._subtasks.heal.go() == RPG.AI_OK) { return RPG.AI_OK; }

    /* run away from target */
    return this._subtasks.retreat.go();
}

/**
 * @class Run away from a being
 * @augments RPG.AI.Task
 */
RPG.AI.Retreat = OZ.Class().extend(RPG.AI.Task);

RPG.AI.Retreat.prototype.init = function(being) {
	this.parent();
	this._being = being;
	this._subtasks.teleport = new RPG.AI.TeleportAway();
}

RPG.AI.Retreat.prototype.go = function() {
	var being = this._ai.getBeing();
	
	/* we are okay, no more retreating necessary */
	if (!RPG.Rules.isWoundedToRetreat(being)) { return RPG.AI_ALREADY_DONE; }

	/* get away */
	var c1 = being.getCell().getCoords();
	var c2 = this._being.getCell().getCoords();

	/* FIXME: the logic for stopping teleport spree stinks here */
	/* we see target - we need and know how to get away */
	if (being.canSee(c2)) {
		/* try to teleport away */
		if (this._subtasks.teleport.go() == RPG.AI_OK) { return RPG.AI_OK; }

		/* run away */
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

/** 
 * @class Heal self task
 * @augments RPG.AI.Task
 */
RPG.AI.HealSelf = OZ.Class().extend(RPG.AI.Task);

RPG.AI.HealSelf.prototype.go = function() {
	var being = this._ai.getBeing();

	/* try potion first */
	var potion = this._getPotion(being);
	if (potion) {
		being.drink(potion);
		return RPG.AI_OK;
	}

	/* then casting */
	var heal = RPG.Spells.Heal;
	if (being.hasSpell(heal, true)) {
		heal = new heal(being);
		being.cast(heal, RPG.CENTER);
		return RPG.AI_OK;
	}

	return RPG.AI_IMPOSSIBLE;
}

RPG.AI.HealSelf.prototype._getPotion = function(being) {
	var potions = being.getItems().filter(
		function(x) { 
			return (x instanceof RPG.Items.HealingPotion);
		});

	return potions.random(); 
}

/** 
 * @class Heal other task
 * @augments RPG.AI.Task
 */
RPG.AI.HealOther = OZ.Class().extend(RPG.AI.Task);

RPG.AI.HealOther.prototype.init = function(being) {
	this.parent();
	this._being = being;
}

RPG.AI.HealOther.prototype.go = function() {
	var being = this._ai.getBeing();

	/* dunno how to heal or haven't got enough mana */
	var heal = RPG.Spells.Heal;
	if (!being.hasSpell(heal,true)) {
		return RPG.AI_IMPOSSIBLE;
	}

	/* check distance */
	var c1 = being.getCell().getCoords();
	var c2 = this._being.getCell().getCoords();

	if (c1.distance(c2) > 1) { /* too distant, approach */
		/* FIXME refactor */
		this._ai.addTask(new RPG.AI.Approach(this._being));
		this._ai.addTask(new RPG.AI.HealOther(this._being));
		return RPG.AI_OK;
	} else { /* okay, cast */
		heal = new heal(being);
		being.cast(heal,c1.dirTo(c2)); 
		return RPG.AI_OK;	
	}
}

/**
 * @class TeleportAway task
 * @augments RPG.AI.Task
 */
RPG.AI.TeleportAway = OZ.Class().extend(RPG.AI.Task);

RPG.AI.TeleportAway.prototype.go = function()
{
	var being = this._ai.getBeing();

	/* dunno how to teleport or haven't got enough mana */
	var teleport = RPG.Spells.Teleport;
	if (!being.hasSpell(teleport,true)) {
		return RPG.AI_IMPOSSIBLE;
	}

	var c = being.getCell();
	var target = this._getFurthestFreeCell(c);

	/* no free cell anywhere! */
	if (!target) { return RPG.AI_IMPOSSIBLE; }

	teleport = new teleport(being);
	being.cast(teleport,target.getCoords());

	return RPG.AI_OK;
}

/* FIXME: refactor to map? */
RPG.AI.TeleportAway.prototype._getFurthestFreeCell = function(cell)
{
	var target = false;

	var map = cell.getMap();
	var corners = map.getCorners();

	/* find most distant corner */
	var max = -Infinity;
	var c = false;
	var c1 = cell.getCoords();

	for (var i=0;i<corners.length;i++) {
		var c2 = corners[i];
		var d = c1.distance(c2);

		if (d > max) { c = c2; max = d; }
	}

	return map.getClosestRandomFreeCell(c);
}
