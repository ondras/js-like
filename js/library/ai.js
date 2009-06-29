/**
 * @class AI
 */
RPG.Engine.AI = OZ.Class();

RPG.Engine.AI.prototype.init = function(being) {
	this._being = being;
	this._goals = [];
	
	being.yourTurn = this.bind(this.yourTurn);
	this._checkGoals();
}

/**
 * Pick one of available goals and try to satisfy it
 */
RPG.Engine.AI.prototype.yourTurn = function() {
	var total = 0;
	for (var i=0;i<this._goals.length;i++) {
		var item = this._goals[i];
		total += item[1];
	}
	
	var goal = null;
	var random = Math.floor(Math.random()*total);
	
	var sub = 0;
	for (var i=0;i<this._goals.length;i++) {
		var item = this._goals[i];
		sub += item[1];
		if (random < sub) { goal = item[0]; }
	}
	
	goal.go();
}

RPG.Engine.AI.prototype.getBeing = function() {
	return this._being;
}

RPG.Engine.AI.prototype.addGoal = function(ctor, chance) {
	var g = new ctor(this);
	this._goals.push([g, chance]);
}

RPG.Engine.AI.prototype.removeGoal = function(goal) {
	for (var i=0;i<this._goals.length;i++) {
		var g = this._goals[i][0];
		if (g == goal) {
			this._goals.splice(index, 1);
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
			if (map.isFree(coords)) { avail.push(coords); }
		}
	}
	
	var target = avail[Math.floor(Math.random() * avail.length)];
	if (target) {
		RPG.World.action(new RPG.Actions.Move(being, target));
	} else {
		RPG.World.action(new RPG.Actions.Wait(being));
	}
}
