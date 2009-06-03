RPG.Engine.World = OZ.Class();
RPG.Engine.World.prototype.init = function() {
	/* world states */
	this.SCHEDULE = 1;
	this.ACTOR = 2;
	this.ACTION = 3;
	this.RESULT = 4;

	this.running = 0;
	this.actors = null;
	this.ticks = 0;
	this.level = null;
	this.scheduler = null;
	
	this._state = this.SCHEDULE;
	this._actor = null;
	this._action = null;
	this._actionResult = null;
}
/**
 * Switch to a new level
 * @param {RPG.Engine.Level} level
 */
RPG.Engine.World.prototype.useLevel = function(level) {
	if (this.level) { /* old level - let beings know that they leave the world */
		var beings = this.level.getBeings();
		for (var i=0;i<beings.length;i++) { beings[i].setWorld(null); }
	}
	
	this.level = level;
	this.scheduler.clearActors();

	var beings = this.level.getBeings();
	for (var i=0;i<beings.length;i++) { /* get all beings in level and assign them to scheduler */
		var b = beings[i];
		b.setWorld(this); 
		this.scheduler.addActor(b);
	}
}
RPG.Engine.World.prototype.getLevel = function() {
	return this.level;
}
RPG.Engine.World.prototype.useScheduler = function(scheduler) {
	this.scheduler = scheduler;
}
/**
 * Call this if you deferred action selection
 * @param {RPG.Actions.BaseAction} a
 */
RPG.Engine.World.prototype.act = function(a) {
	this._action = a;
	this._state = this.ACTION;
	this.run();
}
/**
 * Enter main loop
 */
RPG.Engine.World.prototype.run = function() {
	this.running++;
	if (this.running > 1) { throw new Error("Running too much"); }
	if (this.running > 0) { this._decide(); }
}
/**
 * Pause 
 */
RPG.Engine.World.prototype.pause = function() {
	this.running--;
}
/**
 * Actor requests info about itself and surroundings
 * @param {RPG.Engine.ActorInterface} actor
 * @param {int} infoType constant
 * @param {any} [params]
 */
RPG.Engine.World.prototype.info = function(actor, infoType, params) {
	switch (infoType) {
		case RPG.INFO_POSITION:
			return this.level.find(actor);
		break;
		case RPG.INFO_CELL:
			if (!actor || this.canSee(actor, params)) {
				return this.level.at(params);
			} else {
				return null;
			}
		break;
		case RPG.INFO_SIZE:
			return this.level.getSize();
		break;
		case RPG.INFO_ACTION:
			return this._action;
		break;
	}
}
/**
 * Main loop
 */
RPG.Engine.World.prototype._decide = function() {
	while (1) {
		if (this.running < 1) { return; }
		
		switch (this._state) {
			case this.SCHEDULE: /* our goal is to find an actor */
				this._actor = this.scheduler.scheduleActor();
				if (this._actor) {
					this._state = this.ACTOR;
				} else { /* no actor available */
					this.pause();
				}
			break;
			
			case this.ACTOR: /* our goal is to make actor create an action */
				this._action = this._actor.act();
				if (this._action) {
					this._state = this.ACTION;
				} else {
					this.pause();
				}
			break;
			
			case this.ACTION: /* our goal is to execute the action */
				var result = this._action.execute();
				this.dispatch("action");
				if (result) { 
					this.ticks++; 
					this._state = this.SCHEDULE;
				} else {
					this._state = this.ACTOR;
				}
			break;
		}
	}
}
/**
 * Can a given being see target coords?
 * @param {RPG.Beings.BaseBeing} who
 * @param {RPG.Misc.Coords} what
 * @returns {bool}
 */
RPG.Engine.World.prototype.canSee = function(who, what) {
	var coords = this.level.find(who);
	if (coords.distance(what) <= 1) { return true; } /* optimalization: can see self & surroundings */
	if (coords.distance(what) > 5) { return false; } /* FIXME this should depend on perception or so */
	return this.level.canSee(coords, what);
}
