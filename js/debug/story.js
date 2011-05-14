/**
 * @class Testbed story
 * @augments RPG.Story
 */
RPG.Story.Testbed = OZ.Class().extend(RPG.Story);

RPG.Story.Testbed.prototype._firstMap = function() {
	var gen = new RPG.Generators.Uniform(new RPG.Misc.Coords(59, 19));
	var map = gen.generate("testbed", 1);

	var rooms = map.getRooms();
	for (var i=0;i<rooms.length;i++) { 
//		RPG.Decorators.Doors.getInstance().decorate(map, rooms[i]);
	}
	
	var up = new RPG.Features.Staircase.Up();
	map.setFeature(up, map.getFreeCoords());
	
	this._staircases["end"] = up;
	this._staircaseCallbacks["end"] = this.end;

	return map;
}

RPG.Story.Testbed.prototype._createPC = function(race, profession, name) {
	var pc = new RPG.Beings.God(race, profession);
	pc.setName(name);
	return pc;
}
