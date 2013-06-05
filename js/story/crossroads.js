/**
 * @class Crossroads map
 * @augments RPG.Map
 */
RPG.Map.Crossroads = OZ.Class().extend(RPG.Map);

RPG.Map.Crossroads.prototype.init = function() {
	var str =	"                  ..          " +
				"                 ..     ......" +
				"                ..    ........" +
				"                ..  ....      " +
				"                ......        " +
				"...             ....          " +
				"........         ....         " +
				"   .........   .......        " +
				"        ..........  ..        " +
				"           ....      ..       " +
				"          ..          ...     " +
				"       ....            ....   " +
				"      ....               ....." +
				"     ..                    ...";
	
	var width = 30;
	var height = str.length/width;
	this.parent("Crossroads", new RPG.Coords(width, height), 1);
	
	this._welcome = "You come to a small crossroads.";
	this._modifiers[RPG.FEAT_SIGHT_RANGE] = 3;
	
	this._default.empty = RPG.Cells.Grass.getInstance();
	this._default.full = RPG.Cells.Wall.getInstance();
	
	var cells = {
		" ": RPG.Cells.Grass.getInstance(), 
		".": RPG.Cells.Road.getInstance()
	}
	this.fromString(str, cells);
	
}
