/**
 * @namespace Global game namespace
 */
RPG.Game = {
	pc: null,
	_story: null,
	_engine: null,
	_map: null,
	_events: []
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
	var index = this._events.indexOf(id);
	if (index != -1) { this._events.splice(index, 1); }
	return this;
}

RPG.Game.setStory = function(story) {
	this._story = story;
}

RPG.Game.getStory = function() {
	return this._story;
}

RPG.Game.setPC = function(pc, map, cell) {
	this.pc = pc;
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
	var serializer = new RPG.Serializer();
	var lzw = new RPG.LZW();
	var data = "";
	
	var VERSION = 1;
	var HEADER = String.fromCharCode(VERSION, 0);
	
	stack.push(function() {
		readyStateChange(RPG.SAVELOAD_PROCESS, "JSONifying...");
		try {
			data = serializer.go();
		} catch (e) {
			stack = [];
			readyStateChange(RPG.SAVELOAD_FAILURE, e);
		}
	});
	
	stack.push(function() {
		readyStateChange(RPG.SAVELOAD_PROCESS, "Compressing...");
		try {
			data = lzw.encode(data);
		} catch (e) {
			stack = [];
			readyStateChange(RPG.SAVELOAD_FAILURE, e);
		}
	});

	stack.push(function() {
		readyStateChange(RPG.SAVELOAD_PROCESS, "Finalizing...");
		for (var i=0;i<data.length;i++) { data[i] = String.fromCharCode(data[i]); }
		data.unshift(HEADER);
		readyStateChange(RPG.SAVELOAD_DONE, data.join(""));
	});

	var step = function() {
		var todo = stack.shift();
		todo();
		if (stack.length) { setTimeout(arguments.callee, 100); }
	}
	
	step();
}

/**
 * Return a plain JSON content
 */
RPG.Game.serialize = function(ser) {
	return {
		pc: ser.serialize(this.pc),
		story: ser.serialize(this._story),
		engine: ser.serialize(this._engine),
		map: ser.serialize(this._map)
	};
}
