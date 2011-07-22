/**
 * @class Small village map
 * @augments RPG.Map.Village
 */
RPG.Map.SmallVillage = OZ.Class().extend(RPG.Map.Village);

RPG.Map.SmallVillage.prototype.init = function() {
    var str = 	"...===............--..............." +
				"...===...####.....--..............." +
				"....===..#__#....----.............." +
				".....===.#___...--..---............" +
				"......===#__#..--.#####-....#####.." +
				"......===####.-...#___#.-...#___#.." +
				".###...==.........#___#..-..#___#.." +
				".#.#....=.###.....###_#.....____#.." +
				".#.#...==.#_#...............#___#.." +
				".#.....===###...............#___#.." +
				".###....==.......###_#......#####.." +
				"........==.......#___#........==..." +
				".......====......#___#.........==.." +
				".......====......#___#............." +
				"......==.==......#####............." +
				".....==..=.........................";

	var width = 35;
	var height = str.length/width;
	var size = new RPG.Misc.Coords(width, height);
	this.parent("A small village", size, 1);

	this._modifiers[RPG.FEAT_SIGHT_RANGE] = 3;
	this._sound = "tristram";
	
	var cells = {
		"=":RPG.Cells.Water.getInstance(), 
		"_":RPG.Cells.Corridor.getInstance(),
		"-":RPG.Cells.Road.getInstance()
	};
	this.fromString(str, cells);
	this.setWelcome("You come to a small peaceful village.");

	this._buildFeatures();
}

RPG.Map.SmallVillage.prototype.entering = function(being) {
	this.parent(being);
	if (being != RPG.Game.pc) { return; }
	RPG.UI.sound.preload("doom");
}

RPG.Map.SmallVillage.prototype._buildFeatures = function() {
    this.setFeature(new RPG.Features.Door().close(), new RPG.Misc.Coords(12,3));
    this.setFeature(new RPG.Features.Door().close(), new RPG.Misc.Coords(21,7));
    this.setFeature(new RPG.Features.Door().close(), new RPG.Misc.Coords(28,7));
    
    /* define areas for buildings - to prevent trees inside them */
    this.addArea(new RPG.Areas.Room(new RPG.Misc.Coords(1, 6), new RPG.Misc.Coords(3, 10)));
    this.addArea(new RPG.Areas.Room(new RPG.Misc.Coords(9, 1), new RPG.Misc.Coords(12, 5)));
    this.addArea(new RPG.Areas.Room(new RPG.Misc.Coords(10, 7), new RPG.Misc.Coords(12, 9)));
    this.addArea(new RPG.Areas.Room(new RPG.Misc.Coords(18, 4), new RPG.Misc.Coords(22, 7)));
    this.addArea(new RPG.Areas.Room(new RPG.Misc.Coords(17, 10), new RPG.Misc.Coords(21, 14)));
    this.addArea(new RPG.Areas.Room(new RPG.Misc.Coords(28, 4), new RPG.Misc.Coords(32, 10)));

    var trees = 8;
	while (trees--) {
		var coords = this.getFreeCoords();
		if (this.getArea(coords)) { continue; }
		this.setFeature(new RPG.Features.Tree(), coords);
	}
}
