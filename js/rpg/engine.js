/**
 * @class Actor interface
 */
RPG.Engine.ActorInterface = OZ.Class();
RPG.Engine.ActorInterface.prototype.getSpeed = function() {};
/**
 * World asks actor to perform an action
 */ 
RPG.Engine.ActorInterface.prototype.yourTurn = function() {
}

/**
 * @class Scheduler - manages list of actors
 */
RPG.Engine.Scheduler = OZ.Class();
RPG.Engine.Scheduler.prototype.init = function() {
	this._actors = [];
}
RPG.Engine.Scheduler.prototype.addActor = function(actor) {
	this._actors.push(actor);
	return this;
}
RPG.Engine.Scheduler.prototype.clearActors = function() {
	this._actors = [];
	return this;
}
RPG.Engine.Scheduler.prototype.removeActor = function(actor) {
	var index = this._actors.indexOf(actor);
	if (index == -1) { throw new Error("Actor cannot be removed: not found"); }
	this._actors.splice(index, 1);
	return this;
}
RPG.Engine.Scheduler.prototype.scheduleActor = function() {}
