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

    var trees = 8;
	while (trees--) {
		var coords = this.getFreeCoords();
		if (this.getArea(coords)) { continue; } /* FIXME buildings should be defined as areas, will contain trees otherwise */
		this.setFeature(new RPG.Features.Tree(), coords);
	}
}
