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
 * @class Basic action
 * @augments RPG.Visual.DescriptionInterface
 */
RPG.Engine.BaseAction = OZ.Class().implement(RPG.Visual.DescriptionInterface);
/**
 * @param {?} source Something that performs this action
 * @param {?} target Action target
 * @param {?} params Any params necessary
 */
RPG.Engine.BaseAction.prototype.init = function(source, target, params) {
	this._source = source;
	this._target = target;
	this._params = params;
	this._tookTime = true;
}
RPG.Engine.BaseAction.prototype.getSource = function() {
	return this._source;
}
RPG.Engine.BaseAction.prototype.getTarget = function() {
	return this._target;
}
/**
 * @returns {bool} Did this action took some time?
 */
RPG.Engine.BaseAction.prototype.tookTime = function() {
	return this._tookTime;
}
/**
 * Process this action
 */
RPG.Engine.BaseAction.prototype.execute = function() {
	return this._tookTime;
}
/**
 * Visual formatting helper
 * @param {string} str 
 * @param {string} endchar
 */
RPG.Engine.BaseAction.prototype._phrase = function(str, endchar) {
	var result = str.charAt(0).toUpperCase() + str.substring(1);
	result += endchar;
	return result;
}

/**
 * @class Scheduler - manages list of actors
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
 * @class Brain
 * @augments RPG.Engine.ActorInterface
 */
RPG.Engine.Brain = OZ.Class().implement(RPG.Engine.ActorInterface);
RPG.Engine.Brain.prototype.init = function(being) {
	this.being = being;
	being.setBrain(this);
}
