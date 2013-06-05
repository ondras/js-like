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
	var coords = being.getCoords();
	
	if (!this._inArea(coords)) { /* PANIC! We are not in our area */
		this._ai.setActionResult(being.wait());
		return RPG.AI_OK;
	}
	
	var map = being.getMap();
	var neighbors = map.getCoordsInCircle(coords, 1);
	var avail = [null];
	for (var i=0;i<neighbors.length;i++) {
		var neighbor = neighbors[i];
		if (map.blocks(RPG.BLOCKS_MOVEMENT, neighbor)) { continue; }
		if (!this._inArea(neighbor)) { continue; }
		avail.push(neighbor);
	}
	
	var target = avail.random();
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

	var target = this._being.getCoords();
	var trajectory = projectile.computeTrajectory(being.getCoords(), target, being.getMap());
	var last = trajectory.coords.pop();
	if (!last.equals(this._being.getCoords())) { return RPG.AI_IMPOSSIBLE; } /* some obstacle or we are too far */
	
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
	var coords = being.getCoords();
	var target = this._being.getCoords();
	
	/* MagicBolt */
	if (being.hasSpell(RPG.Spells.MagicBolt, true)) {
		var spell = new RPG.Spells.MagicBolt(being);
		for (var i=0;i<8;i++) { /* find some direction */
			var trajectory = spell.computeTrajectory(coords, i, being.getMap());
			var selfHit = false;
			var targetHit = false;
			for (var j=1;j<trajectory.coords.length;j++) { /* check if target is hit and we are not */
				var test = trajectory.coords[j];
				if (test.equals(target)) { targetHit = true; }
				if (test.equals(coords)) { selfHit = true; }
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
		var dist = coords.distance(target); 
		if (dist <= spell.getRadius()) {
			var result = being.cast(spell);
			this._ai.setActionResult(result);
			return RPG.AI_OK;
		}
	}

	/* Fireball */
	if (being.hasSpell(RPG.Spells.Fireball, true)) {
		var spell = new RPG.Spells.Fireball(being);
		var dist = coords.distance(target); 
		if (dist > spell.getRadius() && dist <= spell.getRadius() + spell.getRange()) {
			var result = being.cast(spell, target);
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
	var c1 = being.getCoords();
	var c2 = this._being.getCoords();
	
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
		var coords = RPG.AI.coordsToDistance(c1, c2, 1, this._being.getMap());
		if (coords) {
			this._ai.setActionResult(being.move(coords));
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
	this._subtasks.teleport = new RPG.AI.TeleportAway(being);
}

RPG.AI.Retreat.prototype.go = function() {
	var being = this._ai.getBeing();
	
	/* we are okay, no more retreating necessary */
	if (!RPG.Rules.isWoundedToRetreat(being)) { return RPG.AI_ALREADY_DONE; }

	/* get away */
	var c1 = being.getCoords();
	var c2 = this._being.getCoords();

	/* we see target - we need and know how to get away */
	if (being.canSee(c2)) {
		/* try to teleport away */
		if (this._subtasks.teleport.go() == RPG.AI_OK) { return RPG.AI_OK; }

		/* run away */
		var coords = RPG.AI.coordsToDistance(c1, c2, 1e5, being.getMap());
		if (coords) {
			this._ai.setActionResult(being.move(coords));
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
	if (!being.hasSpell(heal, true)) { return RPG.AI_IMPOSSIBLE; }

	/* check distance */
	var c1 = being.getCoords();
	var c2 = this._being.getCoords();

	if (c1.distance(c2) > 1) { /* too distant, approach */
		var approach = new RPG.AI.Approach(this._being);
		return approach.go();
	} else { /* okay, cast */
		heal = new heal(being);
		being.cast(heal, c1.dirTo(c2)); 
		return RPG.AI_OK;
	}
}

/**
 * @class TeleportAway task
 * @augments RPG.AI.Task
 */
RPG.AI.TeleportAway = OZ.Class().extend(RPG.AI.Task);
RPG.AI.TeleportAway.prototype.init = function(being) {
	this.parent();
	this._being = being;
}

RPG.AI.TeleportAway.prototype.go = function() {
	var being = this._ai.getBeing();

	var teleport = RPG.Spells.Teleport;
	if (!being.hasSpell(teleport, true)) { return RPG.AI_IMPOSSIBLE; } /* dunno how to teleport or haven't got enough mana */

	var c = this._being.getCoords();
	var map = this._being.getMap();
	var target = map.getFurthestFreeCoords(c);
	
	if (target.equals(being.getCoords())) { return RPG.AI_IMPOSSIBLE; } /* already standing on that spot */

	/* no free cell anywhere! */
	if (!target) { return RPG.AI_IMPOSSIBLE; }

	teleport = new teleport(being);
	being.cast(teleport, target);

	return RPG.AI_OK;
}

/**
 * @class Specialized shopkeeper AI
 * @augments RPG.AI
 */
RPG.AI.Shopkeeper = OZ.Class().extend(RPG.AI);
RPG.AI.Shopkeeper.prototype.init = function(being, shop) {
	this.parent(being);
	this._shop = shop;
	this._guarding = null;
	this._items = [];

	var c = shop.getDoor();
	var corner1 = shop.getCorner1();
	var corner2 = shop.getCorner2();
	var c1 = new RPG.Coords(c.x-1, c.y-1);
	var c2 = new RPG.Coords(c.x+1, c.y+1);
	
	if (c1.x == corner2.x) { c1.x++; }
	if (c2.x == corner1.x) { c2.x--; }
	if (c1.y == corner2.y) { c1.y++; }
	if (c2.y == corner1.y) { c2.y--; }
	
	var task = new RPG.AI.WanderInArea(c1, c2);
	this.setDefaultTask(task);
	
	/* fill with items */
	var map = shop.getMap();
	var danger = map.getDanger();
	var c = new RPG.Coords(0, 0);
	for (var i=corner1.x; i<=corner2.x; i++) {
		for (var j=corner1.y; j<=corner2.y; j++) {
			c.x = i;
			c.y = j;
			if (map.blocks(RPG.BLOCKS_MOVEMENT, c)) { continue; }
			
			do {
				var item = RPG.Factories.items.getInstance(danger);
			} while (item instanceof RPG.Items.Gold);
			
			item.setPrice(10 + Math.round(Math.random() * danger * 100));
			this._items.push(item);
			map.addItem(item, c);
		}
	}

}

RPG.AI.Shopkeeper.prototype.die = function() {
	while (this._items.length) {
		var item = this._items.shift();
		item.setPrice(0);
	}
	this.parent();
}

RPG.AI.Shopkeeper.prototype.isSwappable = function(being) {
	if (!this.parent(being)) { return false; }
	return (!this._guarding);
}

RPG.AI.Shopkeeper.prototype.getDialogText = function(being) {
	var debt = being.getDebts(this._being);
	if (!debt) { return "Be careful and don't break anything!"; }

	var text = ["You owe me " + debt + " gold pieces."];
	
	var avail = being.getGold();
	
	if (avail >= debt) {
		text.push("Do you want to pay for everything?");
	} else {
		text.push("You do not have enough money to pay; drop some items...");
	}
	
	return text;
}

RPG.AI.Shopkeeper.prototype.getDialogOptions = function(being) {
	var debt = being.getDebts(this._being);
	if (!debt) { return []; }

	var avail = being.getGold();
	if (debt > avail) { return []; }
	return ["Yes", "No"];
}

RPG.AI.Shopkeeper.prototype.advanceDialog = function(optionIndex, being) {
	if (optionIndex == -1) { return false; }
	
	if (optionIndex == 0) { /* yes */
		var amount = being.getDebts(this._being);
		var gold = being.getGold();
		being.setGold(gold-amount);
		
		var items = being.getItems(); /* mark all items as paid */
		for (var i=0;i<items.length;i++) {
			var item = items[i];
			var index = this._items.indexOf(item);
			if (index == -1) { continue; }
			
			this._items.splice(index, 1);
			item.setPrice(0);
		}
		
		this.removeTask(this._guarding);
		this._guarding = null;

	} else { /* no */
	}
	
	return false;
}

RPG.AI.Shopkeeper.prototype.getItems = function() {
	return this._items;
}

RPG.AI.Shopkeeper.prototype._addEvents = function() {
	this.parent();
	this._ec.push(RPG.Game.addEvent(null, "item-pick", this.bind(this._pick)));
	this._ec.push(RPG.Game.addEvent(null, "item-drop", this.bind(this._drop)));
	this._ec.push(RPG.Game.addEvent(null, "item-clone", this.bind(this._clone)));
}

RPG.AI.Shopkeeper.prototype._pick = function(e) {
	if (this._guarding) { return; } /* not interested */
	if (this._items.indexOf(e.data.item) == -1) { return; } /* not our */

	/* step into door to block exit */
	var guard = new RPG.AI.HoldPosition(this._shop.getDoor());
	this._guarding = guard;
	this.addTask(guard);
}

/**
 * An item got cloned.
 * If the original item was owned by this shopkeeper, the clone must be as well.
 */
RPG.AI.Shopkeeper.prototype._clone = function(e) {
	var item = e.target;
	if (this._items.indexOf(item) == -1) { return; }
	this._items.push(e.data.clone);
}

RPG.AI.Shopkeeper.prototype._drop = function(e) {
	if (!this._guarding) { return; }
	
	/* are there any our items in target's inventory? */
	var items = e.target.getItems();
	var ok = true;
	for (var i=0;i<items.length;i++) {
		var item = items[i];
		if (this._items.indexOf(item) != -1) { ok = false; }
	}
	
	if (ok) {
		this.removeTask(this._guarding);
		this._guarding = null;
	}
}

/**
 * @class Task to hold position on a specific place
 * @augments RPG.AI.Task
 */
RPG.AI.HoldPosition = OZ.Class().extend(RPG.AI.Task);
RPG.AI.HoldPosition.prototype.init = function(coords) {
	this.parent();
	this._coords = coords;
}

RPG.AI.HoldPosition.prototype.go = function() {
	var being = this._ai.getBeing();
	var coords = RPG.AI.coordsToDistance(being.getCoords(), this._coords, 0, being.getMap());
	if (coords) {
		this._ai.setActionResult(being.move(coords));
	} else {
		this._ai.setActionResult(being.wait());
	}
	return RPG.AI_OK;
}

