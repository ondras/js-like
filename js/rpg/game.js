/**
 * @namespace Global game namespace
 */
RPG.Game = {
	pc: null,
	_story: null,
	_engine: null,
	_map: null,
	_events: [],
	_version: 2
}

RPG.Game.init = function() {
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

	this._engine = new RPG.Engine();
}

/**
 * Event listeners managed by game are created separately.
 * This is because during game load, all relevant event handlers must be removed.
 */
RPG.Game.addEvent = function(who, event, callback) {
	var id = OZ.Event.add(who, event, callback);
	this._events.push(id);
	return id;
}

RPG.Game.removeEvent = function(id) {
	OZ.Event.remove(id);
	var index = RPG.Game._events.indexOf(id);
	if (index != -1) { RPG.Game._events.splice(index, 1); }
	return RPG.Game;
}

RPG.Game.setStory = function(story) {
	this._story = story;
}

RPG.Game.getStory = function() {
	return this._story;
}

RPG.Game.startMap = function(map, cell) {
	this.setMap(map, cell);
	this._engine.unlock();
}

RPG.Game.getEngine = function() {
	return this._engine;
}

RPG.Game.start = function() {
	if (!this._story) { throw new Error("Cannot start a game without a story!"); }
	this._story.generatePC();
}

RPG.Game.end = function() {
	this._engine.lock();
	this._story.end();
}

/**
 * Change to a new map by moving PC onto "cell"
 * @param {RPG.Map} map New map
 * @param {RPG.Cells.BaseCell} cell PC's cell
 */
RPG.Game.setMap = function(map, cell) {
	if (this._map) { this._map.leave(); }

	this._map = map; /* remember where we are */
	map.entered(); /* welcome, songs, ... */

	RPG.UI.status.updateMap(map.getId()); /* update statusbar */
	
	RPG.UI.map.resize(map.getSize()); /* draw the map */
	RPG.UI.map.redrawAll();

	var result = this.pc.move(cell); /* move PC to the cell -> redraw visible part */
	this._engine.useMap(map); /* switch engine to new actorset */
	return result; /* return result of move action */
}

RPG.Game.getMap = function() {
	return this._map;
}

/**
 * Start creating save data
 * @param {function} readyStateChange Called when progress is made
 */
RPG.Game.save = function(readyStateChange) {
	var stack = [];
	var data = "";
	var header = [this._version, 0];
	
	stack.push(function() {
		readyStateChange(RPG.SAVELOAD_PROCESS, "JSONifying...");
		data = new RPG.Serializer().go();
	});
	
	stack.push(function() {
		readyStateChange(RPG.SAVELOAD_PROCESS, "Compressing...");
		data = Compress.stringToArray(data, Compress.UTF8);
		data = Compress.LZW(data);
	});

	stack.push(function() {
		readyStateChange(RPG.SAVELOAD_PROCESS, "Finalizing...");
		while (header.length) { data.unshift(header.pop()); }
		readyStateChange(RPG.SAVELOAD_DONE, data);
	});

	this._runStack(stack, readyStateChange);
}

/**
 * Restore saved game state
 * @param {string} data Saved data
 * @param {function} readyStateChange Called when progress is made
 */
RPG.Game.load = function(data, readyStateChange) {
	var stack = [];
	var p = new RPG.Parser();
	
	stack.push(function() {
		readyStateChange(RPG.SAVELOAD_PROCESS, "Uncompressing...");
		var header = [data.shift(), data.shift()];
		if (header[0] != this._version) { throw new Error("Incompatible save data"); }
		data = Compress.iLZW(data);
	});
	
	stack.push(function() {
		readyStateChange(RPG.SAVELOAD_PROCESS, "DeJSONifying...");
		data = Compress.arrayToString(data, Compress.UTF8);
		data = p.go(data);
	});

	stack.push(function() {
		readyStateChange(RPG.SAVELOAD_PROCESS, "Finalizing...");
		
		/* backup old event ids */
		var oldEvents = this._events;
		this._events = [];
		
		try {
			p.revive(); /* re-attach */
			this.fromJSON(data); /* restore + attach new events */
			oldEvents.forEach(this.removeEvent); /* remove old events */
			readyStateChange(RPG.SAVELOAD_DONE); /* done */
		} catch (e) {
			this._events.forEach(this.removeEvent); /* remove all partially attached events */
			this._events = oldEvents; /* put back old events */
			throw e; /* rethrow */
		}

	});

	this._runStack(stack, readyStateChange);
}

RPG.Game._runStack = function(stack, readyStateChange) {
	var context = this;
	var step = function() {
		var todo = stack.shift();
		try {
			todo.call(context);
			if (stack.length) { setTimeout(arguments.callee, 100); }
		} catch (e) {
			readyStateChange(RPG.SAVELOAD_FAILURE, e);
		}
	}
	step();
}

/**
 * Return a plain JSON content
 */
RPG.Game.toJSON = function(handler) {
	return handler.toJSON({
		pc: this.pc,
		story: this._story,
		engine: this._engine,
		map: this._map,
		sound: RPG.UI.sound.getBackground(),
		status: RPG.UI.status.toJSON()
	});
}

/**
 * Restore game state from a JSON object
 */
RPG.Game.fromJSON = function(data) {
	this.pc = data.pc;
	this._story = data.story;
	this._engine = data.engine;
	this._map = data.map;
	RPG.UI.sound.playBackground(data.sound);
	RPG.UI.status.fromJSON(data.status);
	
	RPG.UI.map.resize(this._map.getSize());
	RPG.UI.map.redrawAll(); 
}
