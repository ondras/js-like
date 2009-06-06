/**
 * @class Game world
 */
RPG.Engine.World = OZ.Class();
RPG.Engine.World.prototype.init = function() {
	this.running = 0;
	this.ticks = 0;
	this._map = null;
	this.scheduler = null;
	
	this._newActorNeeded = true;
	this._nothingToDo = false;
	this._actions = [];
	RPG._world = this;
}

/**
 * Switch to a new map
 * @param {RPG.Engine.Map} map
 */
RPG.Engine.World.prototype.setMap = function(map) {
	this._map = map;
	this.scheduler.clearActors();

	var beings = this._map.getBeings();
	for (var i=0;i<beings.length;i++) { /* get all beings in map and assign them to scheduler */
		var b = beings[i];
		var br = b.getBrain();
		if (br) { this.scheduler.addActor(br); }
	}
	
	this.dispatch("map", map);
}

RPG.Engine.World.prototype.getMap = function() {
	return this._map;
}

RPG.Engine.World.prototype.setScheduler = function(scheduler) {
	this.scheduler = scheduler;
}

/**
 * Add an action to be processed
 * @param {RPG.Actions.BaseAction} a
 */
RPG.Engine.World.prototype.action = function(a) {
	this._actions.push(a);
	if (this._nothingToDo) { 
		this._nothingToDo = false;
		this.run(); 
	}
}

/**
 * Enter main loop
 */
RPG.Engine.World.prototype.run = function() {
	this.running++;
	if (this.running > 1) { throw new Error("Running too much"); }
	if (this.running > 0) { this._loop(); }
}

/**
 * Pause 
 */
RPG.Engine.World.prototype.pause = function() {
	this.running--;
}

/**
 * Main loop
 */
RPG.Engine.World.prototype._loop = function() {
	while (1) {
		if (this.running < 1) { return; }
		if (this._actions.length) { /* there are actions to process */
			var action = this._actions.shift(); /* get first action */
			action.execute(); /* execute it */
			this.dispatch("action", action); /* let everyone know it happened */
			if (action.tookTime()) { /* our actor has made a non-null action */
				this.ticks++;
				this._newActorNeeded = true; 
			} 
		} else if (this._newActorNeeded) { /* no pending actions, we need new actor */
			var actor = this.scheduler.scheduleActor(); /* find next actor */
			if (actor) {
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
