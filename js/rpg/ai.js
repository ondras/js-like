/**
 * @class AI
 * Every AI maintains a priority queue of "tasks" (typical tasks: kill PC; run&heal; pick items). 
 * This queue always contains at least of default/fallback task; this ensures that 
 * every AI is able to do at least *something*.
 * When AI is asked to do something, it tries to pick topmost task and execute it. Three things can happen:
 * a) task is already done - remove it from queue, repeat
 * b) task cannot be done - repeat
 * c) task was executed, finish.
 */
RPG.AI = OZ.Class();

RPG.AI.prototype.init = function(being) {
	this._being = being;
	this._tasks = []; /* set of active tasks */
	this._defaultTask = null; /* fallback task */
	this._actionResult = null; /* action result to return */
	this._ec = [];

	this._ec.push(OZ.Event.add(null, "attack-melee", this.bind(this._attack)));
	this._ec.push(OZ.Event.add(null, "attack-ranged", this.bind(this._attack)));
	this._ec.push(OZ.Event.add(null, "attack-magic", this.bind(this._attack)));
	
	this.setDefaultTask(new RPG.AI.Wander());
}

RPG.AI.prototype.getBeing = function() {
	return this._being;
}

/**
 * Add a fallback task. This one is executed if no other task is available.
 * @param {RPG.AI.Task} task
 */
RPG.AI.prototype.setDefaultTask = function(task) {
	this._defaultTask = task;
	task.setAI(this);
	return this;
}

/**
 * Add a new task 
 * @param {RPG.AI.Task} task
 */
RPG.AI.prototype.addTask = function(task) {
	this._tasks.push(task);
	task.setAI(this);
	return this;
}

/**
 * Remove existing task
 * @param {RPG.AI.Task} task
 */
RPG.AI.prototype.removeTask = function(task) {
	var index = this._tasks.indexOf(task);
	if (index == -1) { throw new Error("Cannot find task to be removed"); }
	this._tasks.splice(index, 1);
}

/**
 * Clear all non-default tasks 
 */
RPG.AI.prototype.clearTasks = function() {
	this._tasks = [];
}

/**
 * To be called by tasks; informing the AI about their actionresult
 */
RPG.AI.prototype.setActionResult = function(result) {
	this._actionResult = result;
	return this;
}

/**
 * Is this AI hostile to a given being?
 * @param {RPG.Beings.BaseBeing} being
 */
RPG.AI.prototype.isHostile = function(being) {
	for (var i=0;i<this._tasks.length;i++) {
		var task = this._tasks[i];	
		if (task instanceof RPG.AI.Kill && task.getBeing() == being) { return true; }
	}
	return false;
}

/**
 * We became chaotic, kill PC!
 */
RPG.AI.prototype.syncWithAlignment = function() {
	var pc = RPG.World.pc;
	var a = this._being.getAlignment();
	if (a == RPG.ALIGNMENT_CHAOTIC && !this.isHostile(pc)) {
		this.addTask(new RPG.AI.Kill(pc));
	}
}

/**
 * Pick one of available tasks and try to satisfy it
 */
RPG.AI.prototype.yourTurn = function() {
	var taskPtr = this._tasks.length-1;
	var done = false;
	
	while (!done) {
		var task = (taskPtr == -1 ? this._defaultTask : this._tasks[taskPtr]);
		var result = task.go();
		switch (result) {
			case RPG.AI_IMPOSSIBLE: /* task cannot be done at this moment */
			break;
			case RPG.AI_ALREADY_DONE: /* task is no longer valid */
				if (task != this._defaultTask) { this.removeTask(task); }
			break;
			case RPG.AI_OK: /* happy */
				done = true;
			break;
		}
		taskPtr--;
	}
	
	return this._actionResult;
}

/**
 * Some attack action happened; does this influence our tasks?
 */
RPG.AI.prototype._attack = function(e) {
	var source = e.target;
	var target = e.data.being;

	/* only actions which target us */
	if (target != this._being) { return; }

	/* ignore our own actions */
	if (source == this._being) { return; }

	/* not interested if not alive */
	if (!this._being.isAlive()) { return; }
	
	/* somebody is attacking us! */
	var kill = false;
	var defense = false;
	
	for (var i=0;i<this._tasks.length;i++) {
		var task = this._tasks[i];	
	
		/* we are already attacking him */
		if (task instanceof RPG.AI.Kill && task.getBeing() == source) { kill = true; }

		/* we are already acting defensively */
		if (task instanceof RPG.AI.ActDefensively) { defense = true; }
	}
	
	if (!kill) {
		/* let's kill the bastard! */
		var str = RPG.Misc.format("%The gets very angry!", this._being);
		RPG.UI.buffer.message(str);
		var task = new RPG.AI.Kill(source);
		this.addTask(task);
	}
	
	if (!defense && RPG.Rules.isWoundedToRetreat(this._being)) {
		/* too much damage, run for your life! */
		var str = RPG.Misc.format("%The looks frightened!", this._being);
		RPG.UI.buffer.message(str);
		var task = new RPG.AI.ActDefensively(source);
		this.addTask(task);
	}

}

/**
 * We just died, destroy the AI
 */
RPG.AI.prototype.die = function(e) {
	this._ec.forEach(OZ.Event.remove);
}

/**
 * Static pathfinder method 
 */
RPG.AI.cellToDistance = function(source, target, distance) {
	var targetCoords = target.getCoords();
	
	var currentDistance = source.getCoords().distance(targetCoords); /* we have this distance now */
	var bestDistance = currentDistance; /* best distance found so far */
	var bestCell = null; /* neighbor cell with best resulting distance */
	
	var radius = 3; /* max radius to try */
	var todo = [source]; /* stack */
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

				var dist = neighbor.getCoords().distance(targetCoords); /* have we found a better candidate? */
				if (Math.abs(dist - distance) < Math.abs(bestDistance - distance)) { 
					bestDistance = dist;
					bestCell = neighbor;

					if (dist == distance) { /* cutoff - already at best distance */
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
		while (bestCell._prev != source) { bestCell = bestCell._prev; }
		return bestCell;
	} else {
		return null;
	}
}

/**
 * @class Base Task
 */
RPG.AI.Task = OZ.Class();
RPG.AI.Task.prototype.init = function() {
	this._ai = null;
	this._subtasks = {};
}
RPG.AI.Task.prototype.setAI = function(ai) {
	this._ai = ai;
	for (var p in this._subtasks) { this._subtasks[p].setAI(ai); }
}

/**
 * Execute the task. Returned value specifies how this task is being completed.
 * @returns {int} One of RPG.AI_* constants
 */
RPG.AI.Task.prototype.go = function() {
	return RPG.AI_OK;
}

/**
 * @class Wander task - walk around randomly
 * @augments RPG.AI.Task
 */
RPG.AI.Wander = OZ.Class().extend(RPG.AI.Task);
RPG.AI.Wander.prototype.go = function() {
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
		this._ai.setActionResult(being.move(target));
	} else {
		this._ai.setActionResult(being.wait());
	}
	
	return RPG.AI_OK;
}
