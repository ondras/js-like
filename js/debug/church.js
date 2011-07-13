/**
 * @class Church map
 * @augments RPG.Map
 */
RPG.Map.Church = OZ.Class().extend(RPG.Map);

RPG.Map.Church.prototype.init = function() {
	var str =	"                                                                      " +
				"                                                                      " +
				"                                                                      " +
				"               #######################################                " +
				"              ##.............................#.......##               " +
				"              #.......................................#               " +
				"              #..............................#........#               " +
				"              #....##..##..##..##..##..##..######..##########         " +
				"              #.............................................###       " +
				"              ................................................##      " +
				"              ................................................##      " +
				"              #.............................................###       " +
				"              #....##..##..##..##..##..##..######..##########         " +
				"              #..............................#........#               " +
				"              #.......................................#               " +
				"              ##.............................#.......##               " +
				"               #######################################                " +
				"                                                                      " +
				"                                                                      " +
				"                                                                      ";
				
	this.parent("Old church", new RPG.Misc.Coords(70, 20), 1);
	this._modifiers[RPG.FEAT_SIGHT_RANGE] = 2;
	
	this._default.empty = RPG.Cells.Grass.getInstance();
	this._default.full = RPG.Cells.Wall.getInstance();
	
	this.fromString(str, {" ":RPG.Cells.Grass.getInstance(), ".":RPG.Cells.Corridor.getInstance()});
	
	var altars = [
		new RPG.Misc.Coords(57, 9),
		new RPG.Misc.Coords(51, 5),
		new RPG.Misc.Coords(51, 14)
	];
	for (var i=0;i<altars.length;i++) { this.setFeature(new RPG.Features.Altar(), altars[i]); }
	
	var benchStart = new RPG.Misc.Coords(24, 9);
	var benches = 13;
	for (var i=0;i<benches;i++) {
		var c = new RPG.Misc.Coords(0, 0);
		c.x = benchStart.x + 2*i;
		c.y = benchStart.y;
		this.setFeature(new RPG.Features.Bench(), c);
		c.y++;
		this.setFeature(new RPG.Features.Bench(), c);
	}
	
	var doors = [
		new RPG.Misc.Coords(14, 9),
		new RPG.Misc.Coords(14, 10),
		new RPG.Misc.Coords(49, 7),
		new RPG.Misc.Coords(50, 7),
		new RPG.Misc.Coords(49, 12),
		new RPG.Misc.Coords(50, 12)
	];
	for (var i=0;i<doors.length;i++) { this.setFeature(new RPG.Features.Door().close(), doors[i]); }
	
}
