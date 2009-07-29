/**
 * @class Story class
 */
var Story = OZ.Class();

Story.prototype.init = function() {
	this._maps = [];
	this._chat = this._buildChat();
	this._mapgen = new RPG.Dungeon.Generator.Digger(new RPG.Misc.Coords(80, 20));
	this._mapdec = new RPG.Dungeon.Decorator();
}

Story.prototype.go = function() {
	this._pc = this._createPC();
	
	var map = this._buildMap();
	RPG.UI.status.updateFeats();
	RPG.UI.status.updateHP();
	RPG.World.setMap(map);
	RPG.World.run();
}

Story.prototype._createPC = function() {
	var def = {
		1: RPG.Races.Human, 
		2: RPG.Races.Orc, 
		3: RPG.Races.Elf, 
		4: RPG.Races.Dwarf
	};
	
	var race = 0;
	do {
		race = prompt("Pick your race: \n\n1. Human\n2. Orc\n3. Elf\n4. Dwarf", 1);
	} while (!(race in def));
	race = def[race];

	var pc = new RPG.Beings.PC().setup(new race());
	RPG.World.setPC(pc);
	return pc;
}

Story.prototype._buildMap = function() {
	var index = this._maps.length + 1;
	var map = this._mapgen.generate("Dungeon #" + index);
	this._mapdec.setMap(map).addHiddenCorridors(0.01);

	var rooms = map.getRooms();
	for (var i=0;i<rooms.length;i++) { this._mapdec.decorateRoomDoors(rooms[i]); }

	/* enemies */
	var max = 5 + Math.floor(Math.random()*10);
	for (var i=0;i<max;i++) {
		var b = RPG.Beings.NPC.getInstance().setup();
		var ai = new RPG.Engine.AI(b);
		ai.addTask(new RPG.Engine.AI.Kill(this._pc));
		var c = map.getFreeCoords(true);
		map.at(c).setBeing(b);
	}
	
	
	/* add some chatting */
	// b.setChat(this._chat);

	/* item */
	var c = map.getFreeCoords(true);
	map.at(c).addItem(new RPG.Items.KlingonSword());

	/* treasure */
	var treasure = rooms.random();
	this._mapdec.decorateRoomDoors(treasure, {locked: 1});
	this._mapdec.decorateRoomInterior(treasure, {treasure: 1});
	

	/* traps */
	var c = map.getFreeCoords(true);
	var t = new RPG.Features.Trap.Pit();
	map.at(c).setFeature(t);
	var c = map.getFreeCoords(true);
	var t = new RPG.Features.Trap.Teleport();
	map.at(c).setFeature(t);

	/* player or stairs up */
	var start = null;
	do {
		start = rooms.random();
	} while (start == treasure);
	
	if (this._maps.length) {
		/* stairs up */
		var up = new RPG.Features.Staircase.Up();
		map.at(start.getCenter()).setFeature(up);
		var prev = this._maps[this._maps.length-1];
		var down = prev.getFeatures(RPG.Features.Staircase.Down)[0];
		up.setTargetMap(prev);
		up.setTargetCoords(down.getCell().getCoords());
	} else {
		/* player */
		map.at(start.getCenter()).setBeing(this._pc);
	}
	
	var troll = new RPG.Beings.Troll().setup();
	var ai = new RPG.Engine.AI(troll);
	ai.addTask(new RPG.Engine.AI.Kill(this._pc));
	map.at(treasure.getCenter()).setBeing(troll);

	var end = null;
	do {
		end = rooms.random();
	} while (end == treasure || end == start);

	var down = new RPG.Features.Staircase.Down();
	down.setTargetGenerator(this.bind(this._generateNext));
	map.at(end.getCenter()).setFeature(down);

	this._maps.push(map);
	return map;
}

Story.prototype._buildChat = function() {
	var c = new RPG.Misc.Chat().setup("Hi, what am I supposed to do?")
		.addOption("Nothing special")
		.addOption("Some activity please", new RPG.Misc.Chat().setup("What activity?")
			.addOption("Kill me!", function(action) {
				action.getTarget().clearTasks();
				action.getTarget().addTask(new RPG.Engine.AI.Kill(action.getSource()));
			})
			.addOption("Attack me!", function(action) {
				action.getTarget().clearTasks();
				action.getTarget().addTask(new RPG.Engine.AI.Attack(action.getSource()));
			})
			.addOption("Run away!", function(action) {
				action.getTarget().clearTasks();
				action.getTarget().addTask(new RPG.Engine.AI.Retreat(action.getSource()));
			})
		);
	return c;
}

Story.prototype._generateNext = function(staircase) {
	var map = this._buildMap();
	staircase.setTargetMap(map);
	
	var up = map.getFeatures(RPG.Features.Staircase.Up)[0];
	staircase.setTargetCoords(up.getCell().getCoords());
}
