/**
 * Actor interface
 */
RPG.Engine.ActorInterface = OZ.Class();
RPG.Engine.ActorInterface.prototype.getSpeed = function() {};
/**
 * World asks actor to perform an action
 * @returns {RPG.Engine.Action || false} False == defer
 */ 
RPG.Engine.ActorInterface.prototype.act = function() {
	return false;
}

RPG.Engine.BaseAction = OZ.Class().implement(RPG.Visual.DescriptionInterface);
RPG.Engine.BaseAction.prototype.init = function(source, target, params) {
	this._source = source;
	this._target = target;
	this._params = params;
	this._success = false;
}
RPG.Engine.BaseAction.prototype.getSource = function() {
	return this._source;
}
RPG.Engine.BaseAction.prototype.getTarget = function() {
	return this._target;
}
RPG.Engine.BaseAction.prototype.execute = function() {
	return this._success;
}
RPG.Engine.BaseAction.prototype._phrase = function(str, endchar) {
	var result = str.charAt(0).toUpperCase() + str.substring(1);
	result += endchar;
	return result;
}

/**
 * Scheduler class - manages list of actors
 */
RPG.Engine.Scheduler = OZ.Class();
RPG.Engine.Scheduler.prototype.init = function() {
	this.actors = [];
}
RPG.Engine.Scheduler.prototype.addActor = function(actor) {
	this.actors.push(actor);
}
RPG.Engine.Scheduler.prototype.clearActors = function(actor) {
	this.actors = [];
}
RPG.Engine.Scheduler.prototype.removeActor = function(actor) {
	var index = this.actors.indexOf(actor);
	if (index == -1) { throw new Error("Actor cannot be removed: not found"); }
	this.actors.splice(index, 1);
}
RPG.Engine.Scheduler.prototype.getActors = function() {
	return this.actors();
}
RPG.Engine.Scheduler.prototype.scheduleActor = function() {}

/**
 * Brain decorator
 */
RPG.Engine.Brain = OZ.Class();
RPG.Engine.Brain.prototype.init = function(being) {
	this.being = being;
	being.act = this.bind(this.act);
}
RPG.Engine.Brain.prototype.act = function() {
	return false;
}
