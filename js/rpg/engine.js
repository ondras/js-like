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
RPG.Engine.Scheduler.prototype.clearActors = function(actor) {
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

/** 
 * @class Basic action
 */
RPG.Actions.BaseAction = OZ.Class();

/**
 * @param {?} source Something that performs this action
 * @param {?} target Action target
 * @param {?} params Any params necessary
 */
RPG.Actions.BaseAction.prototype.init = function(source, target, params) {
	this._source = source;
	this._target = target;
	this._params = params;
	this._tookTime = true;
}
RPG.Actions.BaseAction.prototype.getSource = function() {
	return this._source;
}
RPG.Actions.BaseAction.prototype.getTarget = function() {
	return this._target;
}
/**
 * @returns {bool} Did this action took some time?
 */
RPG.Actions.BaseAction.prototype.tookTime = function() {
	return this._tookTime;
}
/**
 * Process this action
 */
RPG.Actions.BaseAction.prototype.execute = function() {
	return this._tookTime;
}

RPG.Actions.BaseAction.prototype._describe = function() {
	var pc = RPG.World.getPC();
	var cell = pc.getCell();
	
	var f = cell.getFeature();
	if (f && f.knowsAbout(pc)) {
		RPG.UI.buffer.message("You see " + f.describeA() + ".");
	}
	
	var items = cell.getItems();
	if (items.length > 1) {
		RPG.UI.buffer.message("Several items are lying here.");
	} else if (items.length == 1) {
		var item = items[0];
		var str = item.describeA().capitalize();
		str += " is lying here.";
		RPG.UI.buffer.message(str);
	}
}

