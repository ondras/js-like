/**
 * @class Queue - fifo scheduler
 * @augments RPG.Engine.Scheduler
 */
RPG.Engine.Queue = OZ.Class().extend(RPG.Engine.Scheduler);
RPG.Engine.Queue.prototype.scheduleActor = function() {
	if (!this._actors.length) { return null; }
	var actor = this._actors.shift();
	this._actors.push(actor);
	return actor;
}

/**
 * @class Speed-based probablity scheduler
 * @augments RPG.Engine.Scheduler
 */
RPG.Engine.Probability = OZ.Class().extend(RPG.Engine.Scheduler);
RPG.Engine.Probability.prototype.scheduleActor = function() {
	if (!this._actors.length) { return null; }
	
	var total = 0;
	var speeds = [];
	for (var i=0;i<this._actors.length;i++) {
		var speed = this._actors[i].getSpeed();
		total += speed;
		speeds.push(speed);
	}
	
	var random = Math.floor(Math.random()*total);

	var sub = 0;
	for (var i=0;i<this._actors.length;i++) {
		sub += speeds[i];
		if (random < sub) { return this._actors[i]; }
	}
}

/**
 * @class Speed-based scheduler
 * @augments RPG.Engine.Scheduler
 */
RPG.Engine.Speed = OZ.Class().extend(RPG.Engine.Scheduler);
RPG.Engine.Speed.prototype.init = function() {
	this.parent();
	this._current = [];
	this._maxSpeed = 0;
}

RPG.Engine.Speed.prototype.addActor = function(actor) {
	var o = {
		actor: actor,
		bucket: 0,
		speed: 0
	}
	this._actors.push(o);
	return this;
}

RPG.Engine.Speed.prototype.removeActor = function(actor) {
	for (var i=0;i<this._actors.length;i++) {
		if (this._actors[i].actor == actor) { 
			this._actors.splice(i, 1); 
			break;
		}
	}
	
	for (var i=0;i<this._current.length;i++) {
		if (this._current[i].actor == actor) { 
			this._current.splice(i, 1); 
			break;
		}
	}

	return this;
}

RPG.Engine.Speed.prototype.scheduleActor = function() {
	if (!this._actors.length) { return null; }

	/* if there is a set of pre-scheduled actors */
	if (this._current.length) {
		var o = this._current.shift();
		o.bucket -= this._maxSpeed;
		return o.actor;
	}
	
	/* update speeds */
	this._maxSpeed = 0;
	for (var i=0;i<this._actors.length;i++) {
		var obj = this._actors[i];
		obj.speed = obj.actor.getSpeed();
		if (obj.speed > this._maxSpeed) { this._maxSpeed = obj.speed; }
	}
	
	/* increase buckets and determine those eligible for a turn */
	do {
		
		for (var i=0;i<this._actors.length;i++) {
			var obj = this._actors[i];
			obj.bucket += obj.speed;
			if (obj.bucket >= this._maxSpeed) { this._current.push(obj); }
		}
	
	}  while (!this._current.length);
	
	/* sort eligible actors by their buckets */
	this._current.sort(function(a,b) {
		return b.bucket - a.bucket;
	});
	
	/* recurse */
	return arguments.callee.apply(this, arguments);
	
}
