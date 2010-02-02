/**
 * @class Game engine
 * @augments RPG.Misc.ISerializable
 */
RPG.Engine = OZ.Class().implement(RPG.Misc.ISerializable);

RPG.Engine.prototype.init = function() {
	this._actor = null; /* current actor */
	this._actionResult = RPG.ACTION_TIME; /* result of current action */
	this._lock = 1; /* lock level */
	this._scheduler = new RPG.Misc.Scheduler();
}

RPG.Engine.prototype.serialize = function(serializer) {
	var result = {};
	result.actor = serializer.serialize(this._actor);
	result.scheduler = serializer.serialize(this._scheduler);
	return result;
}

RPG.Engine.prototype.parse = function(data, parser) {
	this._actionResult = RPG.ACTION_NO_TIME;
	this._lock = 1;
	
	parser.parse(data.actor, this, "_actor");
	parser.parse(data.scheduler, this, "_scheduler");
}

/**
 * Add new actor
 * @param {RPG.Misc.IActor} actor
 */
RPG.Engine.prototype.addActor = function(actor) {
	this._scheduler.addActor(actor);
}

/**
 * Remove given actor
 * @param {RPG.Misc.IActor} actor
 */
RPG.Engine.prototype.removeActor = function(actor) {
	this._scheduler.removeActor(actor);
}

/**
 * Switch to a new map
 * @param {RPG.Map} map
 */
RPG.Engine.prototype.useMap = function(map) {
	this._scheduler.clearActors();

	var beings = map.getBeings();
	for (var i=0;i<beings.length;i++) { /* get all beings in map and assign them to scheduler */
		this.addActor(beings[i]);
	}
}

/**
 * Enter main loop. This goes until the engine gets locked.
 */
RPG.Engine.prototype._run = function() {
	while (!this._lock) {
		
		/* evaluate previous action */
		switch (this._actionResult) {
			case RPG.ACTION_DEFER: /* lock and wait until (ui) decides */
				this.lock(); 
			break;
			
			case RPG.ACTION_TIME: /* regular action, go for next actor */
				this._newActor();
			break;
			
			case RPG.ACTION_NO_TIME: /* executed in no time, give him another turn */
			break;
		}

		if (!this._actor) { break; }
		this._actionResult = this._actor.yourTurn();
	}
}

/**
 * Asynchronous action result callback; initiates main loop by unlocking.
 */
RPG.Engine.prototype.actionResult = function(actionResult) {
	this._actionResult = actionResult;
	this.unlock();
}

/**
 * Pause 
 */
RPG.Engine.prototype.lock = function() {
	this._lock++;
}

/**
 * Resume 
 */
RPG.Engine.prototype.unlock = function() {
	this._lock--;
	this._run();
}

RPG.Engine.prototype._newActor = function() {
	var actor = this._scheduler.scheduleActor();

	if (actor == RPG.Game.pc && this._actor != RPG.Game.pc) { RPG.UI.setMode(RPG.UI_NORMAL); }
	if (actor && actor != RPG.Game.pc && this._actor == RPG.Game.pc) { RPG.UI.setMode(RPG.UI_LOCKED); }
	
	this._actor = actor;
	if (!this._actor) { return; }
	var effects = this._actor.getEffects();
	for (var i=0;i<effects.length;i++) {
		effects[i].go();
	}
}
