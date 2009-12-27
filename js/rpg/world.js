/**
 * @namespace Game world
 */
RPG.World = {
	_actor: false, /* current actor */
	_actionResult: RPG.ACTION_TIME, /* result of current action */
	_lock: 0, /* lock level */
	_map: null,
	_scheduler: null,
	pc: null
};

RPG.World.init = function() {
	this._scheduler = new RPG.Misc.Scheduler();

	var f = new RPG.Misc.Factory().add(RPG.Items.BaseItem);
	RPG.Items.getInstance = f.bind(f.getInstance);

	var f = new RPG.Misc.Factory().add(RPG.Items.Gem);
	RPG.Items.Gem.getInstance = f.bind(f.getInstance);

	var f = new RPG.Misc.Factory().add(RPG.Beings.NPC);
	RPG.Beings.NPC.getInstance = f.bind(f.getInstance);
	RPG.Beings.NPC.getClass = f.bind(f.getClass);

	var f = new RPG.Misc.Factory().add(RPG.Features.Trap);
	RPG.Features.Trap.getInstance = f.bind(f.getInstance);

	var f = new RPG.Misc.Factory().add(RPG.Spells.BaseSpell);
	RPG.Spells.getInstance = f.bind(f.getInstance);
	RPG.Spells.getClass = f.bind(f.getClass);
}

/**
 * Add new actor
 * @param {RPG.Misc.IActor} actor
 */
RPG.World.addActor = function(actor) {
	this._scheduler.addActor(actor);
}

/**
 * Remove given actor
 * @param {RPG.Misc.IActor} actor
 */
RPG.World.removeActor = function(actor) {
	this._scheduler.removeActor(actor);
}

/**
 * Switch to a new map
 * @param {RPG.Map} map
 */
RPG.World.setMap = function(map) {
	this._map = map;
	this._scheduler.clearActors();

	var beings = this._map.getBeings();
	for (var i=0;i<beings.length;i++) { /* get all beings in map and assign them to scheduler */
		this.addActor(beings[i]);
	}
}

RPG.World.getMap = function() {
	return this._map;
}

/**
 * Enter main loop. This goes until the world gets locked.
 */
RPG.World.run = function() {
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
RPG.World.actionResult = function(actionResult) {
	this._actionResult = actionResult;
	this.unlock();
}

/**
 * Pause 
 */
RPG.World.lock = function() {
	this._lock++;
}

/**
 * Resume 
 */
RPG.World.unlock = function() {
	this._lock--;
	this.run();
}

RPG.World._newActor = function() {
	var actor = this._scheduler.scheduleActor();

	if (actor == this.pc && this._actor != this.pc) { RPG.UI.setMode(RPG.UI_NORMAL); }
	if (actor && actor != this.pc && this._actor == this.pc) { RPG.UI.setMode(RPG.UI_LOCKED); }
	
	this._actor = actor;
	if (!this._actor) { return; }
	var effects = this._actor.getEffects();
	for (var i=0;i<effects.length;i++) {
		effects[i].go();
	}
}
