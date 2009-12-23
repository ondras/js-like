/**
 * @class AI
 * Every AI maintains a stack of "tasks" (typical tasks: kill PC; run&heal; pick items).
 * There is always at least one "task" (wander); this ensures that every AI is able to do 
 * at least *something*. Note that tasks do not depend on each other.
 * Each "task" is represented by a stack of "goals". These, by contrast, are heavily dependent on 
 * themself. For example, task "kill PC" is represented by the following goals:
 * 1) kill PC
 * 2) attack PC
 * 3) approach PC
 * AI decides what to do by looking at the top task and picking top goal.
 */
RPG.Engine.AI = OZ.Class();

RPG.Engine.AI.prototype.init = function(being) {
	this._being = being;
	this._tasks = [];
	this._taskPtr = null;
	this._ec = [];
	this._actionResult = null;

	being.addTask = this.bind(this.addTask);
	being.addGoal = this.bind(this.addGoal);
	being.clearTasks = this.bind(this.clearTasks);
	
	this._ec.push(OZ.Event.add(being, "death", this.bind(this._death)));
	this._ec.push(OZ.Event.add(null, "attack-melee", this.bind(this._attack)));
	this._ec.push(OZ.Event.add(null, "attack-magic", this.bind(this._attack)));

	/* fallback task */
	var wander = new RPG.Engine.AI.Wander();
	this.addTask(wander);
}

RPG.Engine.AI.prototype.isHostile = function(being) {
	for (var i=0;i<this._tasks.length;i++) {
		var goal = this._tasks[i][0];	
		if (goal instanceof RPG.Engine.AI.Kill && goal.getTarget() == being) { return true; }
	}
	return false;
}

RPG.Engine.AI.prototype.syncWithAlignment = function() {
	var pc = RPG.World.pc;
	var a = this._being.getAlignment();
	if (a == RPG.ALIGNMENT_CHAOTIC && !this.isHostile(pc)) {
		this.addTask(new RPG.Engine.AI.Kill(pc));
	}
}

/**
 * Some attack action happened; does this influence our tasks/goals?
 */
RPG.Engine.AI.prototype._attack = function(e) {
	var source = e.target;
	var target = e.data.being;

	/* only actions which target us */
	if (target != this._being) { return; }

	/* not interested if not alive */
	if (!this._being.isAlive()) { return; }
	
	/* somebody is attacking us! */
	var kill = false;
	var retreat = false;
	
	for (var i=0;i<this._tasks.length;i++) {
		var goal = this._tasks[i][0];	
	
		/* we are already attacking him */
		if (goal instanceof RPG.Engine.AI.Kill && goal.getTarget() == source) { kill = true; }

		/* we are already retreating */
		if (goal instanceof RPG.Engine.AI.Retreat && goal.getTarget() == source) { retreat = true; }
	}
	
	if (!kill) {
		/* let's kill the bastard! */
		var str = RPG.Misc.format("%The gets very angry!", this._being);
		RPG.UI.buffer.message(str);
		var goal = new RPG.Engine.AI.Kill(source);
		this.addTask(goal);
	}
	
	if (!retreat && RPG.Rules.isWoundedToRetreat(this._being)) {
		/* too much damage, run for your life! */
		var str = RPG.Misc.format("%The looks frightened!", this._being);
		RPG.UI.buffer.message(str);
		var goal = new RPG.Engine.AI.Retreat(source);
		this.addTask(goal);
	}

}

/**
 * We just died
 */
RPG.Engine.AI.prototype._death = function(e) {
	this._ec.forEach(OZ.Event.remove);
}
/**
 * Pick one of available goals and try to satisfy it
 */
RPG.Engine.AI.prototype.yourTurn = function() {
	this._verifyTasks();
	
	var task = false;
	var goal = false;
	var result = result;
	this._taskPtr = this._tasks.length-1;
	
	do {
		/* pick top non-satisfied goal of top task */
		do {
			task = this._tasks[this._taskPtr];
			goal = task[task.length-1];
			if (goal.isSatisfied() && this._taskPtr > 0) {
				/* remove the goal if it is not the fallback task */
				task.pop();
				/* remove the task if it is empty */
				if (!task.length) { 
					this._tasks.pop(); 
					this._taskPtr--;
				}
				goal = false;
			}
		} while (!goal);
		
		/* execute the goal */
		result = goal.go();
		
		/* this goal is not possible ATM, switch to previous task */
		if (result == RPG.AI_IMPOSSIBLE) { this._taskPtr--; }
	
	} while (result != RPG.AI_OK);
	
	return this._actionResult;
}

RPG.Engine.AI.prototype.getBeing = function() {
	return this._being;
}

RPG.Engine.AI.prototype.addGoal = function(goal) {
	this._tasks[this._taskPtr].push(goal);
	goal.setAI(this);
}

RPG.Engine.AI.prototype.addTask = function(goal) {
	this._tasks.push([]);
	this._taskPtr = this._tasks.length-1;
	this.addGoal(goal);
}

RPG.Engine.AI.prototype.clearTasks = function() {
	this._tasks.splice(1, this._tasks.length-1);
}

/**
 * Walk through all non-default tasks and check if they are still relevant
 */
RPG.Engine.AI.prototype._verifyTasks = function() {
	for (var i=this._tasks.length-1;i>0;i--) {
		var task = this._tasks[i];
		var goal = task[0];
		/* if the bottom goal was satisfied, remove the whole task */
		if (goal.isSatisfied()) { this._tasks.splice(i, 1); }
	}
}


/**
 * @class Goal
 */
RPG.Engine.AI.Goal = OZ.Class();
RPG.Engine.AI.Goal.prototype.init = function() {
}
RPG.Engine.AI.Goal.prototype.setAI = function(ai) {
	this._ai = ai;
}

/**
 * Execute the goal. Returned value specifies how this goal is being completed.
 * @returns {int} One of RPG.AI_* constants
 */
RPG.Engine.AI.Goal.prototype.go = function() {
	return RPG.AI_OK;
}

/**
 * Is this goal satisfied?
 * @returns {bool}
 */
RPG.Engine.AI.Goal.prototype.isSatisfied = function() {
	return false;
}

/**
 * @class Wander goal - walk around randomly
 * @augments RPG.Engine.AI.Goal
 */
RPG.Engine.AI.Wander = OZ.Class().extend(RPG.Engine.AI.Goal);

RPG.Engine.AI.Wander.prototype.init = function(ai) {
	this.parent(ai);
	this._wandered = false;
}

RPG.Engine.AI.Wander.prototype.go = function() {
	var being = this._ai.getBeing();
	var cell = being.getCell();
	var map = cell.getMap();
	
	var neighbors = map.cellsInCircle(cell.getCoords(), 1);
	var avail = [null];
	for (var i=0;i<neighbors.length;i++) {
		if (neighbors[i].isFree()) { avail.push(neighbors[i]); }
	}
	
	var target = avail[Math.floor(Math.random() * avail.length)];
	if (target) {
		this._ai._actionResult = being.move(target);
	} else {
		this._ai._actionResult = being.wait();
	}
	
	this._wandered = true;
	return RPG.AI_OK;
}

RPG.Engine.AI.Wander.prototype.isSatisfied = function() {
	return this._wandered;
}

/**
 * @class Kill goal
 * @augments RPG.Engine.AI.Goal
 */
RPG.Engine.AI.Kill = OZ.Class().extend(RPG.Engine.AI.Goal);

RPG.Engine.AI.Kill.prototype.init = function(target) {
	this.parent();
	this._target = target;
}

/**
 * To kill a target, we just schedule an attack on it
 */
RPG.Engine.AI.Kill.prototype.go = function() {
	var attack = new RPG.Engine.AI.Attack(this._target);
	this._ai.addGoal(attack);
	return RPG.AI_RETRY;
}

RPG.Engine.AI.Kill.prototype.isSatisfied = function() {
	return !this._target.isAlive();
}

RPG.Engine.AI.Kill.prototype.getTarget = function() {
	return this._target;
}


/**
 * Attack goal
 * @augments RPG.Engine.AI.Goal
 */
RPG.Engine.AI.Attack = OZ.Class().extend(RPG.Engine.AI.Goal);
RPG.Engine.AI.Attack.prototype.init = function(target) {
	this.parent();
	this._target = target;
	this._approached = false;
	this._attacked = false;
}

RPG.Engine.AI.Attack.prototype.isSatisfied = function() {
	return this._attacked;
}

RPG.Engine.AI.Attack.prototype.go = function() {
	if (!this._approached) {
		var approach =  new RPG.Engine.AI.Approach(this._target);
		this._ai.addGoal(approach);
	
		/* next time we execute this, we are close enough */
		this._approached = true;
		
		/* nothing was done yet */
		return RPG.AI_RETRY;
	}  else {
		/* perform an attack */
		var being = this._ai.getBeing();
		this._attacked = true;
		var slot = being.getMeleeSlot();
		this._ai._actionResult = being.attackMelee(this._target, slot);
		return RPG.AI_OK;
	}
}

/**
 * @class Approach goal - get to distance 1 to a given target
 * @augments RPG.Engine.AI.Goal
 */
RPG.Engine.AI.Approach = OZ.Class().extend(RPG.Engine.AI.Goal);	

RPG.Engine.AI.Approach.prototype.init = function(target) {
	this.parent();
	this._target = target;
	
	/* target last seen here */
	this._lastCoords = null; 
}

RPG.Engine.AI.Approach.prototype.isSatisfied = function() {
	var being = this._ai.getBeing();
	var c1 = being.getCell().getCoords();
	var c2 = this._target.getCell().getCoords();
	
	/* we are happy when distance==1 */
	return (c1.distance(c2) == 1);
}

RPG.Engine.AI.Approach.prototype.go = function() {
	var being = this._ai.getBeing();
	var c1 = being.getCell().getCoords();
	var c2 = this._target.getCell().getCoords();

	if (being.canSee(c2)) {
		/* we can see the victim; record where is it standing */
		this._lastCoords = c2.clone();
	}
	
	if (this._lastCoords && this._lastCoords.x == c1.x && this._lastCoords.y == c1.y) {
		/* we just arrived at last seen coords */
		this._lastCoords = null;
	}

	var goal = false;
	if (this._lastCoords) {
		/* we know where to go */
		goal = new RPG.Engine.AI.GetToDistance(this._lastCoords, 0);
		this._ai.addGoal(goal);
		return RPG.AI_RETRY;
	} else {
		/* we do not know anything */
		return RPG.AI_IMPOSSIBLE;
	}
}

/**
 * @class Run away from a being
 * @augments RPG.Engine.AI.Goal
 */
RPG.Engine.AI.Retreat = OZ.Class().extend(RPG.Engine.AI.Goal);

RPG.Engine.AI.Retreat.prototype.init = function(target) {
	this.parent();
	this._target = target;
}

RPG.Engine.AI.Retreat.prototype.go = function() {
	var being = this._ai.getBeing();
	var c1 = being.getCell().getCoords();
	var c2 = this._target.getCell().getCoords();

	if (being.canSee(c2)) {
		/* we see the target so we know how to run away */
		goal = new RPG.Engine.AI.GetToDistance(c2, 10000);
		this._ai.addGoal(goal);
		return RPG.AI_RETRY;
	} else {
		/* we do not know anything */
		return RPG.AI_IMPOSSIBLE;
	}
}

RPG.Engine.AI.Retreat.prototype.isSatisfied = function() {
	return !RPG.Rules.isWoundedToRetreat(this._ai.getBeing());
}

RPG.Engine.AI.Retreat.prototype.getTarget = function() {
	return this._target;
}


/**
 * @class Achieve desired distance from a given coords
 * @augments RPG.Engine.AI.Goal
 */
RPG.Engine.AI.GetToDistance = OZ.Class().extend(RPG.Engine.AI.Goal);
RPG.Engine.AI.GetToDistance.prototype.init = function(coords, distance) {
	this.parent();
	this._coords = coords.clone();
	this._distance = distance;
	this._done = false;
}

RPG.Engine.AI.GetToDistance.prototype.isSatisfied = function() {
	return this._done;
}

RPG.Engine.AI.GetToDistance.prototype.go = function() {
	var being = this._ai.getBeing();
	var cell = being.getCell();
	
	
	var currentDistance = cell.getCoords().distance(this._coords); /* we have this distance now */
	var bestDistance = currentDistance; /* best distance found so far */
	var bestCell = null; /* neighbor cell with best resulting distance */
	
	var radius = 3; /* max radius to try */
	var todo = [cell]; /* stack */
	var currentIndex = 0; /* pointer to currently tried cell */
	var maxIndex = 1; /* pointer to first cell in next radius*/
	var current = null;
	var neighbor = null;
	
	var r = 1;
	while (r <= radius) { /* for all available radii */
		while (currentIndex < maxIndex) { /* for all cells in current radius */
			current = todo[currentIndex++];
			for (var i=0;i<8;i++) { /* for all neighbors */
				neighbor = current.neighbor(i);
				if (!neighbor) { continue; }
				if (!neighbor.isFree()) { continue; }
				if (todo.indexOf(neighbor) != -1) { continue; }
				
				neighbor._prev = current; /* so we can trace back the optimal sibling */

				var dist = neighbor.getCoords().distance(this._coords); /* have we found a better candidate? */
				if (this._isBetter(dist, bestDistance)) { /* yes! */
					bestDistance = dist;
					bestCell = neighbor;

					if (dist == this._distance) { /* cutoff - already at best distance */
						r = radius+1;
						currentIndex = maxIndex;
						break;
					}
					
					if (r == radius && Math.abs(dist-currentDistance) == radius) { /* cutoff - this cannot be improved */
						r = radius+1;
						currentIndex = maxIndex;
						break;
					}
				}

				if (r < radius) { todo.push(neighbor); } /* add to be processed */
			}
		}
		r++;
		maxIndex = todo.length;
	}
	
	if (bestCell) {
		while (bestCell._prev != cell) { bestCell = bestCell._prev; }
		this._ai._actionResult = being.move(bestCell);
	} else {
		this._ai._actionResult = being.wait();
	}
	
	this._done = true;
	return RPG.AI_OK;
}

RPG.Engine.AI.GetToDistance.prototype._isBetter = function(what, current) {
	return Math.abs(what - this._distance) < Math.abs(current - this._distance);
}
