/**
 * @namespace Game world
 */
RPG.World = {
	_turnEnded: false,  /* is current actor finished? */
	_lock: 0, /* lock level */
	_map: null,
	_scheduler: null,
	pc: null
};

/**
 * Event dispatcher, static version
 */
RPG.World.dispatch = OZ.Class().prototype.dispatch;

RPG.World.init = function() {
	this._scheduler = new RPG.Misc.Scheduler();

	var f = new RPG.Misc.Factory().add(RPG.Items.BaseItem);
	RPG.Items.getInstance = f.bind(f.getInstance);

	var f = new RPG.Misc.Factory().add(RPG.Items.Gem);
	RPG.Items.Gem.getInstance = f.bind(f.getInstance);

	var f = new RPG.Misc.Factory().add(RPG.Beings.NPC);
	RPG.Beings.NPC.getInstance = f.bind(f.getInstance);

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
 * @param {RPG.Engine.Map} map
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
 * Enter main loop
 */
RPG.World.run = function() {
	while (!this._lock && this._turnEnded) {
		var actor = this._scheduler.scheduleActor();
		if (!actor) { break; }
		
		var effects = actor.getEffects();
		for (var i=0;i<effects.length;i++) {
			effects[i].go();
		}
		
		if (actor == this.pc) { 
			RPG.UI.status.updateRounds(this.pc.getTurnCount()); 
			RPG.UI.setMode(RPG.UI_NORMAL);
		} else {
			RPG.UI.setMode(RPG.UI_LOCKED);
		}

		this._turnEnded = false;
		actor.yourTurn();
	}
}

/**
 * Current actor's turn is finished.
 */
RPG.World.endTurn = function() {
	this._turnEnded = true;
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
