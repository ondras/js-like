RPG.Engine.Queue = OZ.Class().extend(RPG.Engine.Scheduler);
RPG.Engine.Queue.prototype.scheduleActor = function() {
	if (!this.actors.length) { return null; }
	var actor = this.actors.shift();
	this.actors.push(actor);
	return actor;
}
