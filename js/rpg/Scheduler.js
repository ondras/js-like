/**
 * @class Speed-based scheduler
 */
RPG.Scheduler = OZ.Class();
RPG.Scheduler.prototype.init = function() {
	this._actors = [];
}

RPG.Scheduler.prototype.addActor = function(actor) {
	var o = {
		actor: actor,
		bucket: 1/actor.getSpeed()
	}
	this._actors.push(o);
	return this;
}

RPG.Scheduler.prototype.clearActors = function() {
	this._actors = [];
	this._current = [];
	return this;
}

RPG.Scheduler.prototype.removeActor = function(actor) {
	var a = null;
	for (var i=0;i<this._actors.length;i++) {
		a = this._actors[i];
		if (a.actor == actor) { 
			this._actors.splice(i, 1); 
			break;
		}
	}
	
	return this;
}

RPG.Scheduler.prototype.scheduleActor = function() {
	if (!this._actors.length) { return null; }

	var minBucket = Infinity;
	var minActor = null;

	for (var i=0;i<this._actors.length;i++) {
		var actor = this._actors[i];
		if (actor.bucket < minBucket) {
			minBucket = actor.bucket;
			minActor = actor;
		} else if (actor.bucket == minBucket && actor.actor.getSpeed() > minActor.actor.getSpeed()) {
			minActor = actor;
		}
	}
	
	if (minBucket) { /* non-zero value; subtract from all buckets */
		for (var i=0;i<this._actors.length;i++) {
			var actor = this._actors[i];
			actor.bucket = Math.max(0, actor.bucket - minBucket);
		}
	}
	
	minActor.bucket += 1/minActor.actor.getSpeed();
	return minActor.actor;
}
