/**
 * @class Testbed story
 * @augments RPG.Story
 */
RPG.Story.Testbed = OZ.Class().extend(RPG.Story);

RPG.Story.Testbed.prototype._firstMap = function() {
	var str =	"                  #####                                     " +
				"              #####...#                        ######       " +
				"              #.......#                        #....#       " +
				"              #.####..#                        #....#       " +
				"  #######     #.# #####                        #....#       " +
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
	
	/* first closed door */
	map.setFeature(new RPG.Features.Door().close(), new RPG.Misc.Coords(15, 10));
	
	/* gold */
	map.addItem(new RPG.Items.Gold(10), new RPG.Misc.Coords(3, 5));

	/* closed door at gold */
	map.setFeature(new RPG.Features.Door().close(), new RPG.Misc.Coords(8, 6));

	/* torch */
	map.addItem(new RPG.Items.Torch(), new RPG.Misc.Coords(15, 3));

	/* something */
	map.addItem(new RPG.Items.Clothes(), new RPG.Misc.Coords(20, 2));

	/* goblin */
	var g = new RPG.Beings.Goblin();
	g.unequip(RPG.SLOT_WEAPON);
	map.setBeing(g, new RPG.Misc.Coords(39, 8));

	/* goblin doors */
	map.setFeature(new RPG.Features.Door().close(), new RPG.Misc.Coords(42, 8));
	map.setFeature(new RPG.Features.Door().close(), new RPG.Misc.Coords(39, 11));

	/* rat */
	map.setBeing(new RPG.Beings.Rat(), new RPG.Misc.Coords(50, 3));

	/* ending position */
	var up = new RPG.Features.StaircaseUp();
	map.setFeature(up, new RPG.Misc.Coords(49, 15));

	var T = OZ.Class().extend(RPG.Areas.Tutorial);
	T.prototype._messages = {
		"7,17":		"Welcome to the dungeon! Your character is represented by the <strong>@</strong> sign; " +
					"to display all available commands, press '<strong>?</strong>'.<br/>"  +
					"To move around, use arrow keys. You can move in eight directions, " + 
					"but your movement is restricted by the walls (<strong>#</strong>). The only " + 
					"way from this room is a corridor, leading eastward...",
		"13,17":	"You will encounter all types of different objects and beings in this game. " +
					"When unsure, you can always use the 'Look' command (by pressing '<strong>l</strong>'), which " +
					"puts you into an observation mode. In observation mode, the game is paused " +
					"and arrow keys move the cursor around the map. The object under cursor is described " +
					"at the top message window.<br/>" +
					"To exit the observation mode and continue playing, press '<strong>z</strong>'. ",
		"15,13":	"Doors are quite common in underground dungeons. Closed doors are " + 
					"represented by '<strong>+</strong>', open doors by '<strong>/</strong>'. To open a closed door, stand next " +
					"to it and press '<strong>o</strong>' (or just move towards a closed door). Similarly, you can '<strong>c</strong>'lose an open door. ",
		"15,6":		"You can pick up any items lying around. To do so, step on the tile with " +
					"an item and press the comma (<strong>,</strong>).",
		"15,2":		"The items you pick up are stored in your backpack. Certain items (such as " + 
					"the torch), however, can be equipped on your body. To equip stuff, open " + 
					"your '<strong>i</strong>'nventory and press the button next to the body slot you want to change. " + 
					"The torch fits as a weapon (slot '<strong>d</strong>').<br/>" + 
					"When you are finished adjusting your equipment, close the dialog by pressing '<strong>z</strong>'.",
		"31,8":		"There are many beings living in the depths of the dungeon. Not all are " + 
					"initially hostile; the safest way to check their attitude is to '<strong>l</strong>'ook at them.<br/>" + 
					"To attack a monster, just try to move to its position. ",
		"44,15":	"Staircases connect various underground levels. To enter a staircase, " + 
					"press either '<strong>&lt;</strong>' (to climb up) or '<strong>&gt;</strong>' (to climb down)."
	}
	map.addArea(new T());


	this._staircases["end"] = up;
	this._staircaseCallbacks["end"] = this.end;

	return [map, new RPG.Misc.Coords(7, 17)];
}

RPG.Story.Testbed.prototype._createPC = function(race, profession, name) {
	var pc = new RPG.Beings.PC(race, profession);
	pc.setName(name);

	var beer = new RPG.Items.Beer();
	pc.addItem(beer);

/*	
	pc.adjustFeat(RPG.FEAT_MAX_MANA, 50);
	
	
	var scroll = new RPG.Items.Scroll(RPG.Spells.MagicBolt);
	scroll.setPrice(123);
	pc.addItem(scroll);

	pc.addSpell(RPG.Spells.Heal);
	pc.addSpell(RPG.Spells.MagicBolt);
	pc.addSpell(RPG.Spells.MagicExplosion);
	pc.addSpell(RPG.Spells.Fireball);
	pc.fullStats();
*/	
	return pc;
}
