/**
 * @class Tutorial map
 * @augments RPG.Map
 */
RPG.Map.Tutorial = OZ.Class().extend(RPG.Map.Dungeon);

RPG.Map.Tutorial.prototype.init = function() {
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
	this.parent("Beginner's dungeon", new RPG.Coords(60,20), 1);
	this.fromString(str);
	
	/* first closed door */
	this.setFeature(new RPG.Features.Door().close(), new RPG.Coords(15, 10));
	
	/* gold */
	this.addItem(new RPG.Items.Gold(10), new RPG.Coords(3, 5));

	/* closed door at gold */
	this.setFeature(new RPG.Features.Door().close(), new RPG.Coords(8, 6));

	/* torch */
	this.addItem(new RPG.Items.Torch(), new RPG.Coords(15, 3));

	/* something */
	this.addItem(new RPG.Items.Clothes(), new RPG.Coords(20, 2));

	/* goblin */
	var g = new RPG.Beings.Goblin();
	g.unequip(RPG.SLOT_WEAPON);
	this.setBeing(g, new RPG.Coords(39, 8));

	/* goblin doors */
	this.setFeature(new RPG.Features.Door().close(), new RPG.Coords(42, 8));
	this.setFeature(new RPG.Features.Door().close(), new RPG.Coords(39, 11));

	/* rat */
	this.setBeing(new RPG.Beings.Rat(), new RPG.Coords(50, 3));

	this.addArea(new RPG.Areas.StoryTutorial());
}

/**
 * @class Story tutorial
 * @augments RPG.Areas.Tutorial
 */
RPG.Areas.StoryTutorial = OZ.Class().extend(RPG.Areas.Tutorial);
RPG.Areas.StoryTutorial.prototype._messages = {
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
	"15,6":		"You can pick up any items lying around. To do so, step on a tile with " +
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
