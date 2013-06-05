/**
 * @class Game engine
 */
RPG.Engine = OZ.Class();

RPG.Engine.prototype.init = function() {
	this._actor = null; /* current actor */
	this._actionResult = RPG.ACTION_TIME; /* result of current action */
	this._lock = 1; /* lock level */
	this._scheduler = new RPG.Scheduler();
	this._addEvents();
}

RPG.Engine.prototype.revive = function() {
	this._addEvents();
}

/**
 * Switch to a new map
 * @param {RPG.Map} map
 */
RPG.Engine.prototype.useMap = function(map) {
	this._scheduler.clearActors();

	var beings = map.getBeings();
	for (var i=0;i<beings.length;i++) { this.addActor(beings[i]); } /* get all beings in map and assign them to scheduler */
}

RPG.Engine.prototype.addActor = function(actor) {
	this._scheduler.addActor(actor);
	return this;
}

RPG.Engine.prototype.removeActor = function(actor) {
	this._scheduler.removeActor(actor);
	return this;
}

RPG.Engine.prototype._addEvents = function() {
	RPG.Game.addEvent(null, "being-death", this._death.bind(this));
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
	if (actionResult == RPG.ACTION_DEFER) { return; }
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
	for (var i=0;i<effects.length;i++) { effects[i].go(); }
}

RPG.Engine.prototype._death = function(e) {
	this._scheduler.removeActor(e.target);
}
