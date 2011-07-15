/**
 * @class Priest
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Priest = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Priest.factory.frequency = 0;
RPG.Beings.Priest.visual = { color:"#909", desc:"priest", image:"fixme" };
RPG.Beings.Priest.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	
	this.fullStats();
}

/**
 * @class Church map
 * @augments RPG.Map
 */
RPG.Map.Church = OZ.Class().extend(RPG.Map);

RPG.Map.Church.prototype.init = function() {
	var str =	"                                                                 " +
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
				"o        #..............................#........#      +        " +
				"         #.......................................#         +     " +
				"         ##.............................#.......##   +           " +
				"          #######################################        +   +   " +
				"                                       +         +               " +
				"                                 +   +      +         +   +      " +
				"                               +                  +         +    " +
				"                                   +           +       +         " +
				"                                       +                     +   ";
	
	var width = 65;
	var height = str.length/width;
	this.parent("Old church", new RPG.Misc.Coords(width, height), 1);
	this._modifiers[RPG.FEAT_SIGHT_RANGE] = 3;
	
	this._default.empty = RPG.Cells.Grass.getInstance();
	this._default.full = RPG.Cells.Wall.getInstance();
	
	var cells = {
		" ": RPG.Cells.Grass.getInstance(), 
		"+": RPG.Cells.Grass.getInstance(), 
		".": RPG.Cells.Corridor.getInstance(),
		"o": RPG.Cells.Road.getInstance()
	}
	this.fromString(str, cells);
	
	for (var i=0;i<str.length;i++) {
		var ch = str.charAt(i);
		if (ch != "+") { continue; }
		
		var x = i % width;
		var y = Math.floor(i / width);
		this.setFeature(new RPG.Features.Tombstone(), new RPG.Misc.Coords(x, y));
	}
	
	
	
	var altars = [
		new RPG.Misc.Coords(52, 7),
		new RPG.Misc.Coords(46, 3),
		new RPG.Misc.Coords(46, 12)
	];
	for (var i=0;i<altars.length;i++) { this.setFeature(new RPG.Features.Altar(), altars[i]); }
	
	var benchStart = new RPG.Misc.Coords(19, 7);
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
		new RPG.Misc.Coords(9, 7),
		new RPG.Misc.Coords(9, 8),
		new RPG.Misc.Coords(44, 5),
		new RPG.Misc.Coords(45, 5),
		new RPG.Misc.Coords(44, 10),
		new RPG.Misc.Coords(45, 10)
	];
	for (var i=0;i<doors.length;i++) { this.setFeature(new RPG.Features.Door().close(), doors[i]); }	
	
	var windowLeft = 14;
	var windowTop = [1, 14];
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
	
	this.setBeing(new RPG.Beings.Priest(), new RPG.Misc.Coords(52, 7));
}
