/**
 * @class Story class
 */
var Story = OZ.Class();

Story.prototype.init = function() {
	this._maps = [];
	this._chat = this._buildChat();
	this._mapgen = new RPG.Dungeon.Generator.Digger(new RPG.Misc.Coords(80, 20));
}

Story.prototype.go = function() {
	var map = this._buildMap();
	RPG.UI.status.updateFeat();
	RPG.UI.status.updateHP();
	RPG.World.setMap(map);
	RPG.World.run();
}

Story.prototype._buildMap = function() {
	var index = this._maps.length + 1;
	var map = this._mapgen.generate("Dungeon #" + index).addHiddenCorridors(0.01).getMap();

	var rooms = map.getRooms();
	for (var i=0;i<rooms.length;i++) { this._mapgen.decorateRoomDoors(rooms[i]); }

	/* orc */
	var orc = new RPG.Beings.Orc().setup();
	var dagger = new RPG.Items.Dagger();
	orc.addItem(dagger);
	orc.setWeapon(dagger);
	new RPG.Engine.AI(orc);
	var c = map.getFreeCoords(true);
	map.at(c).setBeing(orc);
	
	/* add some chatting */
	orc.setChat(this._chat);

	/* item */
	var c = map.getFreeCoords(true);
	map.at(c).addItem(new RPG.Items.KlingonSword());

	/* treasure */
	var treasure = rooms.random();
	this._mapgen.decorateRoomDoors(treasure, {locked: 1});
	this._mapgen.decorateRoomInterior(treasure, {treasure: 1});

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
		var pc = new RPG.Beings.PC().setup(new RPG.Races.Human());
		RPG.World.setPC(pc);
		map.at(start.getCenter()).setBeing(pc);
		var dagger = new RPG.Items.Dagger();
		pc.addItem(dagger);
	}
	
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
	var c = new RPG.Misc.Chat("Hi, what am I supposed to do?")
		.addOption("Nothing special")
		.addOption("Some activity please", new RPG.Misc.Chat("What activity?")
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
