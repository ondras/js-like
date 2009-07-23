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
