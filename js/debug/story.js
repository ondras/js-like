/**
 * @class Testbed story
 * @augments RPG.Story
 */
RPG.Story.Testbed = OZ.Class().extend(RPG.Story);

RPG.Story.Testbed.prototype._firstMap = function() {
	var gen = new RPG.Generators.Uniform(new RPG.Misc.Coords(59, 19));
	var map = gen.generate("testbed", 1);

	var rooms = map.getRooms();
	var o = {
		closed: 1,
		fakeDoors: 0,
		fakeCorridors: 0
	};
	for (var i=0;i<rooms.length;i++) { 
		RPG.Decorators.Doors.getInstance().decorate(map, rooms[i], o);
	}
	
	var up = new RPG.Features.Staircase.Up();
	var coords = map.getFreeCoords();
	map.setFeature(up, coords);
	
	var trap = new RPG.Features.Trap.Flash();
	map.setFeature(trap, coords.neighbor(RPG.W));

	var goblin = new RPG.Beings.Goblin();
	map.setBeing(goblin, coords.neighbor(RPG.E));

	this._staircases["end"] = up;
	this._staircaseCallbacks["end"] = this.end;

	return map;
}

RPG.Story.Testbed.prototype._createPC = function(race, profession, name) {
	var pc = new RPG.Beings.PC(race, profession);
	pc.setName(name);
	return pc;
}
