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
window.ai = this;
	this._being = being;
	this._tasks = [];
	
	being.yourTurn = this.bind(this.yourTurn);
	this._event = OZ.Event.add(RPG.World, "action", this.bind(this._action));

	/* fallback task */
	var wander = new RPG.Engine.AI.Wander(this);
	this.addTask(wander);
}

/**
 * Some action happened; does this influence our tasks/goals?
 */
RPG.Engine.AI.prototype._action = function(e) {
	var a = e.data;

	/* we just died */
	if (a.getSource() == this._being && a instanceof RPG.Actions.Death) {
		OZ.Event.remove(this._event);
		return;
	}

	/* only actions which target us */
	if (a.getTarget() != this._being) { return; }


	/* not interested if not alive */
	if (!this._being.isAlive()) { return; }
	
	
	if (a instanceof RPG.Actions.Attack) {
		/* somebody is attacking us! */
		var kill = false;
		var retreat = false;
		
		for (var i=0;i<this._tasks.length;i++) {
			var goal = this._tasks[i][0];	
		
			/* we are already attacking him */
			if (goal instanceof RPG.Engine.AI.Kill && goal.getTarget() == a.getSource()) { kill = true; }
			if (goal instanceof RPG.Engine.AI.Retreat && goal.getTarget() == a.getSource()) { retreat = true; }
		}
		
		if (!kill) {
			/* let's kill the bastard! */
			var str = this._being.describeThe().capitalize() + " gets very angry!";
			RPG.UI.message(str);
			var goal = new RPG.Engine.AI.Kill(this, a.getSource());
			this.addTask(goal);
		}
		
		if (!retreat && (this._being.getHP() / this._being.getMaxHP()) < 0.5) {
			/* too much damage, run for your life! */
			var str = this._being.describeThe().capitalize() + " runs away!";
			RPG.UI.message(str);
			var goal = new RPG.Engine.AI.Retreat(this, a.getSource());
			this.addTask(goal);
			
		}
		
	}
}

/**
 * Pick one of available goals and try to satisfy it
 */
RPG.Engine.AI.prototype.yourTurn = function() {
	this._verifyTasks();
	
	var task = false;
	var goal = false;
	var result = result;
	
	do {
		/* pick top non-satisfied goal of top task */
		do {
			task = this._tasks[this._tasks.length-1];
			goal = task[task.length-1];
			if (goal.isSatisfied() && this._tasks.length > 1) {
				/* remove the goal if it is not the last one */
				task.pop();
				/* remove the task if it is empty */
				if (!task.length) { this._tasks.pop(); }
				goal = false;
			}
		} while (!goal);
		
		/* execute the goal */
		result = goal.go();
	
	/* nothing was done, goal are possibly changed (added), try again */
	} while (!result);
}

RPG.Engine.AI.prototype.getBeing = function() {
	return this._being;
}

RPG.Engine.AI.prototype.addGoal = function(goal) {
	this._tasks[this._tasks.length-1].push(goal);
}

RPG.Engine.AI.prototype.addTask = function(goal) {
	this._tasks.push([]);
	this.addGoal(goal);
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
RPG.Engine.AI.Goal.prototype.init = function(ai) {
	this._ai = ai;
}

/**
 * Execute the goal. Returned value specifies if some action was taken or not. 
 * If this value is false, AI should repeat goal selection process.
 * @returns {bool} 
 */
RPG.Engine.AI.Goal.prototype.go = function() {
	return false;
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
 */
RPG.Engine.AI.Wander = OZ.Class().extend(RPG.Engine.AI.Goal);

RPG.Engine.AI.Wander.prototype.init = function(ai) {
	this.parent(ai);
	this._wandered = false;
}

RPG.Engine.AI.Wander.prototype.go = function() {
	var being = this._ai.getBeing();
	var map = being.getMap();
	
	var myCoords = being.getCoords();
	var avail = [null];
	
	for (var i=-1;i<=1;i++) {
		for (var j=-1;j<=1;j++) {
			if (Math.abs(i) == Math.abs(j)) { continue; }
			var coords = myCoords.clone();
			coords.x += i;
			coords.y += j;
			if (map.at(coords).isFree()) { avail.push(coords); }
		}
	}
	
	var target = avail[Math.floor(Math.random() * avail.length)];
	if (target) {
		RPG.World.action(new RPG.Actions.Move(being, target));
	} else {
		RPG.World.action(new RPG.Actions.Wait(being));
	}
	
	this._wandered = true;
	return true;
}

RPG.Engine.AI.Wander.prototype.isSatisfied = function() {
	return this._wandered;
}

/**
 * @class Kill goal
 */
RPG.Engine.AI.Kill = OZ.Class().extend(RPG.Engine.AI.Goal);

RPG.Engine.AI.Kill.prototype.init = function(ai, target) {
	this.parent(ai);
	this._target = target;
}

/**
 * To kill a target, we just schedule an attack on it
 */
RPG.Engine.AI.Kill.prototype.go = function() {
	var attack = new RPG.Engine.AI.Attack(this._ai, this._target);
	ai.addGoal(attack);
	return false;
}

RPG.Engine.AI.Kill.prototype.isSatisfied = function() {
	return !this._target.isAlive();
}

RPG.Engine.AI.Kill.prototype.getTarget = function() {
	return this._target;
}


/**
 * Attack goal
 */
RPG.Engine.AI.Attack = OZ.Class().extend(RPG.Engine.AI.Goal);
RPG.Engine.AI.Attack.prototype.init = function(ai, target) {
	this.parent(ai);
	this._target = target;
	this._approached = false;
	this._attacked = false;
}

RPG.Engine.AI.Attack.prototype.isSatisfied = function() {
	return this._attacked;
}

RPG.Engine.AI.Attack.prototype.go = function() {
	if (!this._approached) {
		var approach =  new RPG.Engine.AI.Approach(this._ai, this._target);
		this._ai.addGoal(approach);
	
		/* next time we execute this, we are close enough */
		this._approached = true;
		
		/* nothing was done yet */
		return false;
	}  else {
		/* perform an attack */
		var being = this._ai.getBeing();
		this._attacked = true;
		RPG.World.action(new RPG.Actions.Attack(being, this._target, being.getWeapon()));
		return true;
	}
}

/**
 * @class Approach goal - get to distance 1 to a given target
 */
RPG.Engine.AI.Approach = OZ.Class().extend(RPG.Engine.AI.Goal);	

RPG.Engine.AI.Approach.prototype.init = function(ai, target) {
	this.parent(ai);
	this._target = target;
	
	/* target last seen here */
	this._lastCoords = null; 
}

RPG.Engine.AI.Approach.prototype.isSatisfied = function() {
	var being = this._ai.getBeing();
	var c1 = being.getCoords();
	var c2 = this._target.getCoords();
	
	/* we are happy when distance==1 */
	return (c1.distance(c2) == 1);
}

RPG.Engine.AI.Approach.prototype.go = function() {
	var being = this._ai.getBeing();
	var c1 = being.getCoords();
	var c2 = this._target.getCoords();

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
		var vec = this._lastCoords.clone().minus(being.getCoords());
		goal = new RPG.Engine.AI.Direction(this._ai, vec);
	} else {
		/* we do not know anything. wander. */
		goal = new RPG.Engine.AI.Wander(this._ai);
	}
	this._ai.addGoal(goal);
	
	return false;
}

/**
 * @class Run away from a being
 */
RPG.Engine.AI.Retreat = OZ.Class().extend(RPG.Engine.AI.Goal);

RPG.Engine.AI.Retreat.prototype.init = function(ai, target) {
	this.parent(ai);
	this._target = target;
}

RPG.Engine.AI.Retreat.prototype.go = function() {
	var being = this._ai.getBeing();
	var c1 = being.getCoords();
	var c2 = this._target.getCoords();

	if (being.canSee(c2)) {
		/* we see the target so we know how to run away */
		var vec = being.getCoords().clone().minus(c2);
		goal = new RPG.Engine.AI.Direction(this._ai, vec);
	} else {
		/* we do not know anything. wander. */
		goal = new RPG.Engine.AI.Wander(this._ai);
	}
	this._ai.addGoal(goal);
	
	return false;
}

RPG.Engine.AI.Retreat.prototype.isSatisfied = function() {
	return false;
}

RPG.Engine.AI.Retreat.prototype.getTarget = function() {
	return this._target;
}


/**
 * @class Directional step
 */
RPG.Engine.AI.Direction = OZ.Class().extend(RPG.Engine.AI.Goal);
RPG.Engine.AI.Direction.prototype.init = function(ai, vector) {
	this.parent(ai);
	this._vector = vector.clone();
	this._done = false;
}

RPG.Engine.AI.Direction.prototype.isSatisfied = function() {
	return this._done;
}

RPG.Engine.AI.Direction.prototype.go = function() {
	var being = this._ai.getBeing();
	var map = being.getMap();
	var coords = being.getCoords();
	var target = coords.clone().plus(this._vector);
	
	/* we can move in 8 directions; try them and find those which move us closest */
	var bestMoves = [];
	var bestDistance = Number.POSITIVE_INFINITY;
	for (var i=-1;i<=1;i++) {
		for (var j=-1;j<=1;j++) {
			var t = coords.clone();
			t.x += i;
			t.y += j;
			
			/* do not try waiting at this moment */
			if (i==0 && j==0) { continue; }
			
			/* discard non-free non-null places */
			if ((i || j) && !map.at(t).isFree()) { continue; }
			
			var dist = target.distance(t);
			if (dist < bestDistance) {
				bestDistance = dist;
				bestMoves = [];
			}
			
			if (dist == bestDistance) { bestMoves.push(t); }
		}
	}
	
	if (bestMoves.length) {
		/* pick one of the "bestMoves" array */
		var c = bestMoves[Math.floor(Math.random()*bestMoves.length)];
		RPG.World.action(new RPG.Actions.Move(being, c));
	} else {
		RPG.World.action(new RPG.Actions.Wait(being));
	}
	
	this._done = true;
	return true;
}

