/**
 * @namespace Game world
 */
RPG.World = {
	_running: 0,
	_ticks: 0,
	_map: null,
	_scheduler: null,
	_pc: null,
	
	_newActorNeeded: true,
	_nothingToDo: false,
	_actions: []
};

/**
 * Event dispatcher, static version
 */
RPG.World.dispatch = OZ.Class().prototype.dispatch;

/**
 * Add new actor
 * @param {RPG.Engine.ActorInterface} actor
 */
RPG.World.addActor = function(actor) {
	this._scheduler.addActor(actor);
}

/**
 * Remove given actor
 * @param {RPG.Engine.ActorInterface} actor
 */
RPG.World.removeActor = function(actor) {
	this._scheduler.removeActor(actor);
}

/**
 * Switch to a new map
 * @param {RPG.Engine.Map} map
 */
RPG.World.setMap = function(map) {
	this._map = map;
	this._scheduler.clearActors();

	var beings = this._map.getBeings();
	for (var i=0;i<beings.length;i++) { /* get all beings in map and assign them to scheduler */
		this.addActor(beings[i]);
	}
	
	RPG.UI.adjust(map);
}

RPG.World.getMap = function() {
	return this._map;
}

RPG.World.getPC = function() {
	return this._pc;
}

RPG.World.setPC = function(being) {
	this._pc = being;
}

RPG.World.setScheduler = function(scheduler) {
	this._scheduler = scheduler;
}

/**
 * Add an action to be processed
 * @param {RPG.Actions.BaseAction} a
 */
RPG.World.action = function(a) {
	this._actions.push(a);
	if (this._nothingToDo) { 
		this._nothingToDo = false;
		this.run(); 
	}
}

/**
 * Enter main loop
 */
RPG.World.run = function() {
	this._running++;
	if (this._running > 1) { throw new Error("Running too much"); }
	if (this._running > 0) { this._loop(); }
}

/**
 * Pause 
 */
RPG.World.pause = function() {
	this._running--;
}

/**
 * Main loop
 */
RPG.World._loop = function() {
	while (1) {
		if (this._running < 1) { return; }
		if (this._actions.length) { /* there are actions to process */
			var action = this._actions.shift(); /* get first action */
			action.execute(); /* execute it */
			this.dispatch("action", action); /* let everyone know it happened */
			if (action.tookTime()) { /* our actor has made a non-null action */
				RPG.UI.lock(); /* lock ui */
				this._ticks++;
				this._newActorNeeded = true; 
			} 
		} else if (this._newActorNeeded) { /* no pending actions, we need new actor */
			var actor = this._scheduler.scheduleActor(); /* find next actor */
			if (actor) {
				if (actor == this._pc) { RPG.UI.unlock(); }
				this._newActorNeeded = false;
				actor.yourTurn(); /* let actor know he should do some action */
			} else { /* no actor available, just sleep */
				this.pause();
			}
		} else { /* nothing to do, waiting for the action */
			this._nothingToDo = true;
			this.pause();
		}
	}
}
