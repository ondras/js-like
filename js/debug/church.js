/**
 * @class Church map
 * @augments RPG.Map
 */
RPG.Map.Church = OZ.Class().extend(RPG.Map);

RPG.Map.Church.prototype.init = function() {
	var str =	"                                                                 " +
				"                                                                 " +
				"                                                                 " +
				"          #######################################                " +
				"         ##.............................#.......##               " +
				"         #.......................................#               " +
				"         #..............................#........#               " +
				"         #....##..##..##..##..##..##..######..##########         " +
				"         #.............................................###       " +
				"      ooo................................................##      " +
				"   oooooo................................................##      " +
				" ooooo   #.............................................###       " +
				"ooo      #....##..##..##..##..##..##..######..##########         " +
				"o        #..............................#........#               " +
				"         #.......................................#               " +
				"         ##.............................#.......##               " +
				"          #######################################                " +
				"                                                                 " +
				"                                                                 " +
				"                                                                 ";
				
	this.parent("Old church", new RPG.Misc.Coords(65, 20), 1);
	this._modifiers[RPG.FEAT_SIGHT_RANGE] = 2;
	
	this._default.empty = RPG.Cells.Grass.getInstance();
	this._default.full = RPG.Cells.Wall.getInstance();
	
	var cells = {
		" ": RPG.Cells.Grass.getInstance(), 
		".": RPG.Cells.Corridor.getInstance(),
		"o": RPG.Cells.Road.getInstance()
	}
	this.fromString(str, cells);
	
	var altars = [
		new RPG.Misc.Coords(52, 9),
		new RPG.Misc.Coords(46, 5),
		new RPG.Misc.Coords(46, 14)
	];
	for (var i=0;i<altars.length;i++) { this.setFeature(new RPG.Features.Altar(), altars[i]); }
	
	var benchStart = new RPG.Misc.Coords(19, 9);
	var benches = 13;
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=0;i<benches;i++) {
		c.x = benchStart.x + 2*i;
		c.y = benchStart.y;
		this.setFeature(new RPG.Features.Bench(), c);
		c.y++;
		this.setFeature(new RPG.Features.Bench(), c);
	}
	
	var doors = [
		new RPG.Misc.Coords(9, 9),
		new RPG.Misc.Coords(9, 10),
		new RPG.Misc.Coords(44, 7),
		new RPG.Misc.Coords(45, 7),
		new RPG.Misc.Coords(44, 12),
		new RPG.Misc.Coords(45, 12)
	];
	for (var i=0;i<doors.length;i++) { this.setFeature(new RPG.Features.Door().close(), doors[i]); }	
	
	var windowLeft = 14;
	var windowTop = [3, 16];
	var windowCount = 6;
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=0;i<windowCount;i++) {
		for (var j=0;j<windowTop.length;j++) {
			c.x = windowLeft + 6*i;
			c.y = windowTop[j];
			this.setFeature(new RPG.Features.StainedGlassWindow(), c);
			c.x++;
			this.setFeature(new RPG.Features.StainedGlassWindow(), c);
		}
	}
}
