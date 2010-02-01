/**
 * @namespace Global game namespace
 */
RPG.Game = {
	pc: null,
	_story: null,
	_engine: null,
	_map: null
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

RPG.Game.parse = function(data, parser) {
	parser.parse(data.pc, this, "pc");
	parser.parse(data.story, this, "_story");
	parser.parse(data.engine, this, "_engine");
	parser.parse(data.map, this, "_map");
}
