/**
 * @class AI
 */
RPG.Engine.AI = OZ.Class();

RPG.Engine.AI.prototype.init = function(being) {
	this._being = being;
	this._goals = [];
	
	being.yourTurn = this.bind(this.yourTurn);
	OZ.Event.add(RPG.World, "action", this.bind(this._action));
	this._checkGoals();
}

RPG.Engine.AI.prototype._action = function(e) {
	var a = e.data;

	if (a instanceof RPG.Actions.Attack && a.getTarget() == this._being) {
		/* somebody is attacking us! */
		for (var i=0;i<this._goals.length;i++) {
			var goal = this._goals[i];
			
			/* we are already attacking him */
			if (goal instanceof RPG.Engine.AI.Attack && goal.getTarget == a.getSource()) { return; }
		}
		
		this._goals = [];
		
		var goal = this.addGoal(RPG.Engine.AI.Attack, 10);
		goal.setTarget(a.getSource());
		
	}
}

/**
 * Pick one of available goals and try to satisfy it
 */
RPG.Engine.AI.prototype.yourTurn = function() {
	while (1) {
		/* compute total probability */
		var total = 0;
		for (var i=0;i<this._goals.length;i++) {
			var item = this._goals[i];
			total += item[1];
		}
		
		/* try to find a goal */
		var goal = null;
		var random = Math.floor(Math.random()*total);
		
		var sub = 0;
		for (var i=0;i<this._goals.length;i++) {
			var item = this._goals[i];
			sub += item[1];
			if (random < sub) { goal = item[0]; }
		}
		
		if (goal.isValid()) {
			/* goal is valid, try to achieve it */
			goal.go();
			break;
		} else {
			/* goal is no longer valid, remove and retry */
			this.removeGoal(goal);
		}
	}
}

RPG.Engine.AI.prototype.getBeing = function() {
	return this._being;
}

RPG.Engine.AI.prototype.addGoal = function(ctor, chance) {
	var g = new ctor(this);
	this._goals.push([g, chance]);
	return g;
}

RPG.Engine.AI.prototype.removeGoal = function(goal) {
	for (var i=0;i<this._goals.length;i++) {
		var g = this._goals[i][0];
		if (g == goal) {
			this._goals.splice(i, 1);
			break;
		}
	}
	this._checkGoals();
}

/**
 * Checks number of goals and adds default goal if necessary
 */
RPG.Engine.AI.prototype._checkGoals = function() {
	if (!this._goals.length) {
		this.addGoal(RPG.Engine.AI.Wander, 10);
	}
}

/**
 * @class Goal
 */
RPG.Engine.AI.Goal = OZ.Class();
RPG.Engine.AI.Goal.prototype.init = function(ai) {
	this._ai = ai;
}
RPG.Engine.AI.Goal.prototype.go = function() {
}
/**
 * Is this goal still valid?
 * @returns {bool}
 */
RPG.Engine.AI.Goal.prototype.isValid = function() {
	return true;
}

/**
 * Try one step in a given direction
 */
RPG.Engine.AI.Goal.prototype._stepInDirection = function(vec) {
	var being = this._ai.getBeing();
	var map = being.getMap();
	var coords = being.getCoords();
	var target = coords.clone().plus(vec);
	
	/* we can move in 9 directions (including noop); try them and find those which move us closest */
	var bestMoves = [];
	var bestDistance = Number.POSITIVE_INFINITY;
	for (var i=-1;i<=1;i++) {
		for (var j=-1;j<=1;j++) {
			var t = coords.clone();
			t.x += i;
			t.y += j;
			
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
	
	/* pick one of the "bestMoves" array */
	var c = bestMoves[Math.floor(Math.random()*bestMoves.length)];
	RPG.World.action(new RPG.Actions.Move(being, c));
}


/**
 * @class Wander goal - walk around randomly
 */
RPG.Engine.AI.Wander = OZ.Class().extend(RPG.Engine.AI.Goal);
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
}

RPG.Engine.AI.Retreat = OZ.Class().extend(RPG.Engine.AI.Goal);
RPG.Engine.AI.Retreat.prototype.go = function() {
}

RPG.Engine.AI.Attack = OZ.Class().extend(RPG.Engine.AI.Goal);
RPG.Engine.AI.Attack.prototype.init = function(ai) {
	this.parent(ai);
	this._target = null;
	
	this._lastCoords = null;
	this._lastVector = null;
}

RPG.Engine.AI.Attack.prototype.setTarget = function(target) {
	this._target = target;
}

RPG.Engine.AI.Attack.prototype.getTarget = function() {
	return this._target;
}

RPG.Engine.AI.Attack.prototype.go = function() {
	var being = this._ai.getBeing();
	var c1 = being.getCoords();
	var c2 = this._target.getCoords();
	
	/* ready to attack, go */
	if (c1.distance(c2) == 1) {
		RPG.World.action(new RPG.Actions.Attack(being, this._target, being.getWeapon()));
		return;
	}
	
	/* get closer to victim */
	
	if (being.canSee(c2)) {
		/* we can see the victim */
		this._lastCoords = c2.clone();
		this._lastVector = c2.clone().minus(c1);
		
		this._approach();
	} else {
		/* we cannot see the victim */
		
		if (this._lastCoords && this._lastCoords.x == c1.x && this._lastCoords.y == c1.y) {
			/* we just arrived at last seen coords */
			this._lastCoords = null;
		}
		
		if (this._lastCoords) {
			/* we want to go to last seen place */
			this._approach();
		} else {
			/* we want to go in last seen direction */
			this._continueBlind();
		}
	}
	
}

/**
 * Try to get closer to this._lastCoords
 */
RPG.Engine.AI.Attack.prototype._approach = function() {
	var being = this._ai.getBeing();
	var vec = this._lastCoords.clone().minus(being.getCoords());
	this._stepInDirection(vec);
}

/**
 * Continue walking in "this._lastVector" direction
 */
RPG.Engine.AI.Attack.prototype._continueBlind = function() {
	this._stepInDirection(this._lastVector);
}

RPG.Engine.AI.Attack.prototype.isValid = function() {
	return this._target.isAlive();
}
