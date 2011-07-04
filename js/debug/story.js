/**
 * @class Testbed story
 * @augments RPG.Story
 */
RPG.Story.Testbed = OZ.Class().extend(RPG.Story);


/*
 * killing
 * looking
 * ascending
 */

RPG.Story.Testbed.prototype._firstMap = function() {
	var str =	"                    #####                                   " +
				"              #######...#                      ######       " +
				"              #.........#                      #....#       " +
				"              #.#####...#                      #....#       " +
				"  #######     #.#   #####                      #....#       " +
				"  #.....#######.#############       #######    ###.##       " +
				"  #.........................#       #.....#      #.#        " +
				"  #.....#######.###########.#########.....########.#        " +
				"  #######     #.#         #........................#        " +
				"              #.#         ###########.....##########        " +
				"              #.#                   #.....#                 " +
				"              #.#                   ###.###                 " +
				"            ###.#                     #.#                   " +
				"            #...#                     #.#     #######       " +
				"            #.###                     #.#######.....#       " +
				"    ######  #.#                       #.............#       " +
				"    #....####.#                       #########.....#       " +
				"    #.........#                               #######       " +
				"    #....######                                             " +
				"    ######                                                  ";
	var map = new RPG.Map.Dungeon("Beginner's dungeon", new RPG.Misc.Coords(60,20), 1);
	map.fromString(str);
	
	var T = OZ.Class().extend(RPG.Areas.Tutorial);
	T.prototype._messages = {
		"13,17": "tut1",
		"13,14": "tut2"
	}
	map.addArea(new T());
	
	/*
	var map = RPG.Generators.Uniform.getInstance().generate("testbed", new RPG.Misc.Coords(59, 19), 1);

	var rooms = map.getRooms();
	var o = {
		closed: 1,
		fakeDoors: 0,
		fakeCorridors: 0
	};
	for (var i=0;i<rooms.length;i++) { 
		RPG.Decorators.Doors.getInstance().decorate(map, rooms[i], o);
	}
	*/
	
	/* starting position */
	map.setFeature(new RPG.Features.Staircase.Down(), new RPG.Misc.Coords(7, 17));
	
	/* first closed door */
	map.setFeature(new RPG.Features.Door().close(), new RPG.Misc.Coords(15, 10));
	
	/* gold */
	map.addItem(new RPG.Items.Gold(10), new RPG.Misc.Coords(3, 5));

	/* closed door at gold */
	map.setFeature(new RPG.Features.Door().close(), new RPG.Misc.Coords(8, 6));

	/* torch */
	map.addItem(new RPG.Items.Torch(), new RPG.Misc.Coords(15, 2));

	/* something fixme */
	map.addItem(new RPG.Items.Torch(), new RPG.Misc.Coords(22, 2));

	/* goblin */
	map.setBeing(new RPG.Beings.Goblin(), new RPG.Misc.Coords(39, 8));

	/* goblin doors */
	map.setFeature(new RPG.Features.Door().close(), new RPG.Misc.Coords(42, 8));
	map.setFeature(new RPG.Features.Door().close(), new RPG.Misc.Coords(39, 11));

	/* ending position */
	var up = new RPG.Features.Staircase.Up();
	map.setFeature(up, new RPG.Misc.Coords(49, 15));

	/* lockpick */
	map.addItem(new RPG.Items.Lockpick(), new RPG.Misc.Coords(8, 17));

	this._staircases["end"] = up;
	this._staircaseCallbacks["end"] = this.end;

	return map;
}

RPG.Story.Testbed.prototype._createPC = function(race, profession, name) {
	var pc = new RPG.Beings.God(race, profession);
	pc.setName(name);
	
	pc.adjustFeat(RPG.FEAT_MAX_MANA, 50);
	
	var beer = new RPG.Items.Beer();
	pc.addItem(beer);
	
	var scroll = new RPG.Items.Scroll(RPG.Spells.MagicBolt);
	scroll.setPrice(123);
	pc.addItem(scroll);

	pc.addSpell(RPG.Spells.Heal);
	pc.addSpell(RPG.Spells.MagicBolt);
	pc.addSpell(RPG.Spells.MagicExplosion);
	pc.addSpell(RPG.Spells.Fireball);
	pc.fullStats();
	
	return pc;
}
