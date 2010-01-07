/**
 * @class Testbed story
 * @augments RPG.Story
 */
RPG.Story.Testbed = OZ.Class().extend(RPG.Story);

RPG.Story.Testbed.prototype._getMap = function() {
	var gen = new RPG.Generators.IceyMaze(new RPG.Misc.Coords(59, 19));
	var map = gen.generate("testbed", 1);
	
	var up = new RPG.Features.Staircase.Up();
	map.getFreeCell().setFeature(up);
	up.setTarget(this.bind(this._endGame));

	return map;
}

RPG.Story.Testbed.prototype._createPC = function(race, profession, name) {
	RPG.World.pc = new RPG.Beings.God(new race(), new profession());
	RPG.World.pc.setName(name);
	OZ.Event.add(RPG.World.pc, "death", this.bind(this._death));
}
