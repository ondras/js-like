RPG.Engine.World = OZ.Class();
RPG.Engine.World.prototype.init = function() {
	this.running = 0;
	this.ticks = 0;
	this.level = null;
	this.scheduler = null;
	
	this._newActorNeeded = true;
	this._nothingToDo = false;
	this._actions = [];
	RPG._world = this;
}

/**
 * Switch to a new level
 * @param {RPG.Engine.Level} level
 */
RPG.Engine.World.prototype.useLevel = function(level) {
	this.level = level;
	this.scheduler.clearActors();

	var beings = this.level.getBeings();
	for (var i=0;i<beings.length;i++) { /* get all beings in level and assign them to scheduler */
		var b = beings[i];
		var br = b.getBrain();
		if (br) { this.scheduler.addActor(br); }
	}
	
	this.dispatch("level", level);
}

RPG.Engine.World.prototype.currentLevel = function() {
	return this.level;
}

RPG.Engine.World.prototype.useScheduler = function(scheduler) {
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
			var result = action.execute(); /* execute it */
			this.dispatch("action", action); /* let everyone know it happened */
			if (result) { /* our actor has made a non-null action */
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

/**
 * Being requests info about a cell
 * @param {RPG.Beings.BaseBeing} being
 * @param {RPG.Misc.Coords} coords
 */
RPG.Engine.World.prototype.cellInfo = function(being, coords) {
	if (!being) { return this.level.at(coords); }
	var source = being.getCell().getCoords();
	if (this.canSee(source, coords)) {
		return this.level.at(coords);
	} else {
		return null;
	}
}

/**
 * Can a given being see target coords?
 * @param {RPG.Misc.Coords} who
 * @param {RPG.Misc.Coords} what
 * @returns {bool}
 */
RPG.Engine.World.prototype.canSee = function(source, target) {
	if (source.distance(target) <= 1) { return true; } /* optimalization: can see self & surroundings */
	if (source.distance(target) > 5) { return false; } /* FIXME this should depend on perception or so */

	var offsets = [
		[0, 0],
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1]
	];
	var c = source.clone();
	for (var i=0;i<offsets.length;i++) {
		c.x = source.x + offsets[i][0];
		c.y = source.y + offsets[i][1];
		if (!this.level.valid(c) || this.level.at(c).flags & RPG.CELL_BLOCKED) { continue; }
		var tmp = this.level.canSee(c, target);
		if (tmp == true) { return true; }
	}
	return false;
}
