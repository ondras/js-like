/**
 * @class Map cell
 * @augments RPG.IEnterable
 * @augments RPG.Visual.IVisual
 */
RPG.Cells.BaseCell = OZ.Singleton().implement(RPG.Visual.IVisual)
				   .implement(RPG.IEnterable);

RPG.Cells.BaseCell.visual = { path:"cells" };
RPG.Cells.BaseCell.prototype._blocks = RPG.BLOCKS_NOTHING;
RPG.Cells.BaseCell.prototype.init = function() {
	this._modifiers = {};
	this._fake = false;
	this._cell = null;
	this._feature = null;
	this._water = false;
}

RPG.Cells.BaseCell.prototype.revive = function() {
	this.constructor._instance = this;
}

RPG.Cells.BaseCell.prototype.isFake = function() {
	return this._fake;
}

RPG.Cells.BaseCell.prototype.isWater = function() {
	return this._water;
}

RPG.Cells.BaseCell.prototype.blocks = function(what) {
	return (this._blocks >= what);
}
/**
 * Called by map 
 */
RPG.Cells.BaseCell.prototype.hide = function(map, coords) {
	this._cell = map.getCell(coords);
	this._feature = map.getFeature(coords);
	map.setFeature(null, coords);
}

/**
 * Not called by map
 */
RPG.Cells.BaseCell.prototype.reveal = function(map, coords) {
	map.setCell(this._cell, coords);
	map.setFeature(this._feature, coords);
}

/**
 * @class Area, a logical subset of map
 * @augments RPG.IEnterable
 */
RPG.Areas.BaseArea = OZ.Class().implement(RPG.IEnterable);

RPG.Areas.BaseArea.prototype.init = function() {
	this._map = null;
	this._modifiers = {};
	this._welcome = null;
}

/**
 * Area occupies all these coordinates
 * @returns {RPG.Coords[]} 
 */
RPG.Areas.BaseArea.prototype.getCoords = function() {
	return [];
}

RPG.Areas.BaseArea.prototype.setWelcome = function(text) {
	this._welcome = text;
	return this;
}

RPG.Areas.BaseArea.prototype.setMap = function(map) {
	this._map = map;
}

RPG.Areas.BaseArea.prototype.getMap = function() {
	return this._map;
}

/**
 * @see RPG.IEnterable#entering
 */
RPG.Areas.BaseArea.prototype.entering = function(being) {
	this.parent(being);
	if (this._welcome && being == RPG.Game.pc) { RPG.UI.buffer.message(this._welcome); }
}

/**
 * @class Room (rectangular) area
 * @augments RPG.Areas.BaseArea
 */
RPG.Areas.Room = OZ.Class().extend(RPG.Areas.BaseArea);

RPG.Areas.Room.prototype.init = function(corner1, corner2) {
	this.parent();
	this._corner1 = corner1.clone();
	this._corner2 = corner2.clone();
}

RPG.Areas.Room.prototype.getCorner1 = function() {
	return this._corner1;
}

RPG.Areas.Room.prototype.getCorner2 = function() {
	return this._corner2;
}

RPG.Areas.Room.prototype.getCenter = function() {
	var x = Math.round((this._corner1.x + this._corner2.x)/2);
	var y = Math.round((this._corner1.y + this._corner2.y)/2);
	return new RPG.Coords(x, y);
}

RPG.Areas.Room.prototype.getCoords = function() {
	var arr = [];
	for (var i=this._corner1.x; i<=this._corner2.x; i++) {
		for (var j=this._corner1.y; j<=this._corner2.y; j++) {
			arr.push(new RPG.Coords(i, j));
		}
	}
	return arr;
}

/**
 * @class Dungeon feature
 * @augments RPG.Visual.IVisual
 * @augments RPG.IEnterable
 */
RPG.Features.BaseFeature = OZ.Class().implement(RPG.Visual.IVisual)
				     .implement(RPG.IEnterable);

RPG.Features.BaseFeature.visual = { path:"features" };
RPG.Features.BaseFeature.prototype._blocks = RPG.BLOCKS_NOTHING;
RPG.Features.BaseFeature.prototype.init = function() {
	this._coords = null;
	this._map = null;
	this._modifiers = {};
}

RPG.Features.BaseFeature.prototype.setCoords = function(coords) {
	this._coords = coords.clone();
}

RPG.Features.BaseFeature.prototype.getCoords = function() {
	return this._coords;
}

RPG.Features.BaseFeature.prototype.setMap = function(map, coords) {
	this._map = map;
	this.setCoords(coords);
}

RPG.Features.BaseFeature.prototype.getMap = function() {
	return this._map;
}

RPG.Features.BaseFeature.prototype.blocks = function(what) {
	return (this._blocks >= what);
}


/**
 * @class Dungeon map
 * @augments RPG.IEnterable
 */
RPG.Map = OZ.Class().implement(RPG.IEnterable);

RPG.Map.prototype.init = function(id, size, danger) {
	this._modifiers = {};
	this._id = id;
	this._welcome = "";
	this._sound = null;
	this._active = false; /* is this the current map? */
	this._size = size.clone();
	this._danger = danger;
	
	this._default = {
		empty: RPG.Cells.BaseCell.getInstance(),
		full: RPG.Cells.BaseCell.getInstance()
	}
	
	this._areas = [];
	this._areasByCoords = {};

	/* hashmaps */
	this._cells = {}; 
	this._beings = {}; 
	this._items = {}; 
	this._features = {}; 
}

RPG.Map.prototype.toString = function() {
	var s = "";
	for (var j=0;j<this._size.y;j++) {
		if (j) { s += "\n"; }
		for (var i=0;i<this._size.x;i++) {
			var ch = " ";
			var id = i+","+j;
			if (this._cells[id]) {
				s += (this._cells[id].blocks(RPG.BLOCKS_MOVEMENT) ? "#" : ".");
			}
		}
	}
	return s;
}

RPG.Map.prototype.setActive = function(active) {
	this._active = active;
	return this;
}

RPG.Map.prototype.isActive = function() {
	return this._active;
}

RPG.Map.prototype.getDefaultEmptyCell = function() {
	return this._default.empty;
}

RPG.Map.prototype.getDefaultFullCell = function() {
	return this._default.full;
}

/**
 * Populates cells in this map based on an array of arrays of bools.
 * true = default full cell, false = default empty cell
 * Full cells surrounded by full cells are ignored.
 * @param {bool[][]} boolArray
 */
RPG.Map.prototype.fromBoolArray = function(boolArray) {
	var w = this._size.x;
	var h = this._size.y;

	/* second, decide which should be included in this map */
	var coords = new RPG.Coords(0, 0);
	for (var x=0;x<w;x++) { 
		for (var y=0;y<h;y++) {
			coords.x = x;
			coords.y = y;

			/* passable section */
			if (!boolArray[x][y]) {
				this.setCell(this._default.empty, coords);
				continue;
			}
			
			/* check neighbors; create nonpassable only if there is at least one passable neighbor */
			var ok = false;
			var minW = Math.max(  0, x-1);
			var maxW = Math.min(w-1, x+1);
			var minH = Math.max(  0, y-1);
			var maxH = Math.min(h-1, y+1);
			for (var i=minW;i<=maxW;i++) {
				for (var j=minH;j<=maxH;j++) {
					if (!boolArray[i][j]) { ok = true; }
				}
			}
			
			if (ok) {
				var cell = (boolArray[x][y] ? this._default.full : this._default.empty);
				this.setCell(cell, coords);
			}
		}
	}
}

/**
 * Populates cells in map from the string. Newlines are stripped.
 * @param {string} str
 * @param {object} cellMap char-to-cell mapping
 */
RPG.Map.prototype.fromString = function(str, cellMap) {
	var map = {
		" ": null,
		".": this._default.empty,
		"#": this._default.full
	}
	for (var p in cellMap) { map[p] = cellMap[p]; }
	var s = str.replace(/\n/g, "");
	
	var width = this._size.x;
	var height = this._size.y;
	var coords = new RPG.Coords(0, 0);
	for (var i=0;i<width;i++) {
		for (var j=0;j<height;j++) {
			var char = str.charAt(width*j + i);
			if (!(char in map)) { throw new Error("Unknown character '"+char+"' in stringified map"); }
			var cell = map[char];
			if (!cell) { continue; }
			
			coords.x = i;
			coords.y = j;
			this.setCell(cell, coords)
		}
	}
}

/**
 * @see RPG.IEnterable#entering
 */
RPG.Map.prototype.entering = function(being) {
	this.parent(being);
	if (being != RPG.Game.pc) { return; }
	
	if (this._sound) { RPG.UI.sound.playBackground(this._sound); }
	if (this._welcome) { RPG.UI.buffer.message(this._welcome); }
}

RPG.Map.prototype.leaving = function(being) {
	this.parent(being);

	var coords = being.getCoords();
	delete this._beings[coords.x+","+coords.y];
	
	if (being == RPG.Game.pc) { being.memorizeVisible(); }
}

RPG.Map.prototype.getID = function() {
	return this._id;
}

RPG.Map.prototype.getDanger = function() {
	return this._danger;
}

/**
 * Map size
 */
RPG.Map.prototype.getSize = function() {
	return this._size;
}

RPG.Map.prototype.setWelcome = function(text) {
	this._welcome = text;
	return this;
}

RPG.Map.prototype.setSound = function(sound) {
	this._sound = sound;
	return this;
}

RPG.Map.prototype.getSound = function() {
	return this._sound;
}

/**
 * Get all beings in this Map
 */ 
RPG.Map.prototype.getBeings = function() {
	var all = [];
	for (var hash in this._beings) { all.push(this._beings[hash]); }
	return all;
}

RPG.Map.prototype.getItems = function(coords) {
	return (this._items[coords.x+","+coords.y] || []);
}

RPG.Map.prototype.addItem = function(item, coords) {
	var id = coords.x+","+coords.y;
	if (!(id in this._items)) { this._items[id] = []; }
	item.mergeInto(this._items[id]);
	if (this._active) { RPG.Game.pc.coordsChanged(coords); }
}

RPG.Map.prototype.removeItem = function(item) {
	for (var hash in this._items) {
		var list = this._items[hash];
		var index = list.indexOf(item);
		if (index == -1) { continue; }
		
		list.splice(index, 1);
		if (!list.length) { delete this._items[hash]; }
		if (this._active) { RPG.Game.pc.coordsChanged(RPG.Coords.fromString(hash)); }
		return;
	}
	throw new Error("Cannot remove item '"+item+"'");
}

RPG.Map.prototype.getFeature = function(coords) {
	return this._features[coords.x+","+coords.y];
}

RPG.Map.prototype.setFeature = function(feature, coords) {
	var id = coords.x+","+coords.y;
	if (feature) {
		this._features[id] = feature;
		feature.setMap(this, coords);
	} else if (this._features[id]) {
		delete this._features[id];
	}
	if (this._active) { RPG.Game.pc.coordsChanged(coords); }
}

RPG.Map.prototype.getBeing = function(coords) {
	return this._beings[coords.x+","+coords.y];
}

RPG.Map.prototype.setBeing = function(being, coords, ignoreOldPosition) {
	var id = coords.x+","+coords.y;

	if (!being) { /* just remove being (dead, for example) */
		var b = this._beings[id];
		if (b) {
			this.leaving(b);
			delete this._beings[id];
			if (this._active) { RPG.Game.pc.coordsChanged(coords); }
		}
		return;
	}
	
	this._beings[id] = being;

	var oldCoords = being.getCoords();
	var newCoords = coords;
	var oldMap = being.getMap();
	var newMap = this;
	var oldArea = (oldMap ? oldMap.getArea(oldCoords) : null);
	var newArea = this.getArea(newCoords);
	var oldCell = (oldMap ? oldMap.getCell(oldCoords) : null);
	var newCell = this.getCell(newCoords);
	var oldFeature = (oldMap ? oldMap.getFeature(oldCoords) : null);
	var newFeature = this.getFeature(newCoords);
	
	if (oldMap != newMap) { /* map change */
		if (oldMap) { oldMap.leaving(being); }
		this.entering(being);
		being.setMap(this, coords);
	} else { /* same map */
		if (!ignoreOldPosition) { delete this._beings[oldCoords.x+","+oldCoords.y]; } /* same map - remove being from old coords */
		being.setCoords(newCoords);
	}

	if (this._active) { 
		if (oldCoords) { RPG.Game.pc.coordsChanged(oldCoords); }
		RPG.Game.pc.coordsChanged(newCoords); 
	}
	
	if (oldArea != newArea) { /* area change */
		if (oldArea) { oldArea.leaving(being); }
		if (newArea) { newArea.entering(being); }
	}
	
	if (oldCell != newCell) { /* cell change */
		if (oldCell) { oldCell.leaving(being); }
		newCell.entering(being);
	}

	if (oldFeature != newFeature) { /* feature change */
		if (oldFeature) { oldFeature.leaving(being); }
		if (newFeature) { newFeature.entering(being); }
	}
}
	
RPG.Map.prototype.getCell = function(coords) {
	return this._cells[coords.x+","+coords.y];
}

RPG.Map.prototype.setCell = function(cell, coords) {
	var id = coords.x+","+coords.y;
	if (cell) {
		if (cell.isFake()) { cell.hide(this, coords); }
		this._cells[id] = cell;
	} else if (this._cells[id]) {
		delete this._cells[id];
	}
	if (this._active) { RPG.Game.pc.coordsChanged(coords); }
}

RPG.Map.prototype.isValid = function(coords) {
	if (Math.min(coords.x, coords.y) < 0) { return false; }
	if (coords.x >= this._size.x) { return false; }
	if (coords.y >= this._size.y) { return false; }
	return true;
}

/**
 * Return all features of a given type
 */
RPG.Map.prototype.getFeatures = function(ctor) {
	var arr = [];
	for (var id in this._features) {
		var f = this._features[id];
		if (f && f instanceof ctor) { arr.push(f); }
	}
	return arr;
}

/**
 * Add a new area. Areas may NOT overlap.
 * @param {RPG.Areas.BaseArea} area
 */
RPG.Map.prototype.addArea = function(area) {
	this._areas.push(area);
	area.setMap(this);
	var coords = area.getCoords();
	for (var i=0;i<coords.length;i++) {
		var id = coords[i].x+","+coords[i].y;
		this._areasByCoords[id] = area;
	}
}

/**
 * Returns list of rooms in this map
 * @returns {RPG.Areas.BaseArea[]}
 */
RPG.Map.prototype.getAreas = function() {
	return this._areas;
}

/**
 * Get area containing these coordinates
 */
RPG.Map.prototype.getArea = function(coords) {
	return this._areasByCoords[coords.x+","+coords.y];
}

RPG.Map.prototype.getFreeCoords = function(noItems) {
	var all = [];
	var c = new RPG.Coords();
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			c.x = i;
			c.y = j;
			var id = c.x+","+c.y;
			if (!(id in this._cells)) { continue; }
			if (id in this._features) { continue; }
			
			if (this.blocks(RPG.BLOCKS_MOVEMENT, c)) { continue; }
			
			var items = this._items[id];
			if (noItems && items && items.length) { continue; }
			
			all.push(c.clone());
		}
	}
	
	return all.random();
}

/**
 * Return array of coords forming a "circle", e.g. having constant radius from a center point
 * @param {RPG.Coords} center
 * @param {int} radius
 * @param {bool} includeInvalid Include "null" value where a cell does not exist?
 * @returns {RPG.Coords[]}
 */
RPG.Map.prototype.getCoordsInCircle = function(center, radius, includeInvalid) {
	var arr = [];
	var W = this._size.x;
	var H = this._size.y;
	var c = center.clone().plus(new RPG.Coords(radius, radius));
	
	var dirs = [RPG.N, RPG.W, RPG.S, RPG.E];
	
	var count = 8*radius;
	for (var i=0;i<count;i++) {
		if (c.x < 0 || c.y < 0 || c.x >= W || c.y >= H) {
			if (includeInvalid) { arr.push(null); }
		} else {
			if (this._cells[c.x+","+c.y]) {
				arr.push(c.clone());
			} else if (includeInvalid) {
				arr.push(null);
			}
		}
		
		var dir = dirs[Math.floor(i*dirs.length/count)];
		c.plus(RPG.DIR[dir]);
	}
	return arr;
}

/**
 * Line connecting two coords
 * @param {RPG.Coords} c1
 * @param {RPG.Coords} c2
 * @returns {RPG.Coords[]}
 */
RPG.Map.prototype.getCoordsInLine = function(c1, c2) {
	var result = [c1.clone()];
	
	var dx = c2.x-c1.x;
	var dy = c2.y-c1.y;
	if (Math.abs(dx) > Math.abs(dy)) {
		var major = "x";
		var minor = "y";
		var majorstep = dx > 0 ? 1 : -1;
		var minorstep = dy > 0 ? 1 : -1;
		var delta = Math.abs(dy/dx);
	} else {
		var major = "y";
		var minor = "x";
		var majorstep = dy > 0 ? 1 : -1;
		var minorstep = dx > 0 ? 1 : -1;
		var delta = Math.abs(dx/dy);
	}
	var error = 0;
	var current = c1.clone();
	while (current[major] != c2[major]) {
		current[major] += majorstep;
		error += delta;
		if (error + 0.001 > 0.5) {
			current[minor] += minorstep;
			error -= 1;
		}
		result.push(current.clone());
	}
	
	return result;
}

/**
 * Returns coords in a flood-filled area
 * @param {RPG.Coords} center
 * @param {int} radius
 */
RPG.Map.prototype.getCoordsInArea = function(center, radius) {
	var result = [];
	
	function go(x, depth) {
		var index = -1;
		for (var i=0;i<result.length;i++) {
			var item = result[i];
			if (!item[0].equals(x)) { continue; }
			if (item[1] <= depth) { 
				return; /* we have this one with better depth */
			} else {
				index = i;
			}
		}
		
		if (index == -1) {
			result.push([x, depth]); /* new node */
			if (depth == radius) { return; }
		} else {
			result[0][1] = depth; /* we had this one with worse depth */
		}
		
		/* check neighbors */
		for (var i=0;i<8;i++) {
			var n = x.neighbor(i);
			if (!n) { continue; }
			if (this.blocks(RPG.BLOCKS_LIGHT, n)) { continue; }
			arguments.callee.call(this, n, depth+1);
		}
		
	}
	
	go.call(this, center, 0);
	
	var arr = [];
	for (var i=0;i<result.length;i++) {
		arr.push(result[i][0]);
	}
	
	return arr;
}

/**
 * Returns first free coords closest to a coordinate
 * @param {RPG.Coords} center
 * @param {int} max radius
 */
RPG.Map.prototype.getClosestRandomFreeCoords = function(center, radius) {
	var sx = this._size.x;
	var sy = this._size.y;
	var max = radius * radius || (sx * sx + sy * sy);

	var coords = false;
	var r = 0;

	while (!coords && (r * r) < max) {
		var candidates = this.getCoordsInCircle(center, r, false);
		var avail = [];

		for (var j=0;j<candidates.length;j++) {
			var c = candidates[j];
			if (!this.blocks(RPG.BLOCKS_MOVEMENT, c)) { avail.push(c); }
		}

		if (avail.length) { coords = avail.random(); }

		r++;
	}

	return coords;
}

/**
 * Returns two free coords located in opposite corners
 */
RPG.Map.prototype.getCoordsInTwoCorners = function() {
	var corners = this._getCorners();

	var i1 = Math.floor(Math.random()*corners.length);
	var i2 = (i1+2) % corners.length;
	var indexes = [i1, i2];
	var result = [];

	for (var i=0;i<indexes.length;i++) {
		var center = corners[indexes[i]];
		var coords = this.getClosestRandomFreeCoords(center);
		if (coords) { result.push(coords) }
	}

	return result;
}

/**
 * Returns free coords most distant to a given coords
 * @param {RPG.Coords} coords Source, we want to get as far as possible
 */
RPG.Map.prototype.getFurthestFreeCoords = function(coords) {
	var corners = this._getCorners();

	/* find most distant corner */
	var max = -Infinity;
	var c = false;

	for (var i=0;i<corners.length;i++) {
		var corner = corners[i];
		var d = coords.distance(corner);
		if (d > max) { c = corner; max = d; }
	}

	return this.getClosestRandomFreeCoords(c);
}


RPG.Map.prototype.blocks = function(what, coords) {
	var id = coords.x+","+coords.y;

	var c = this._cells[id];
	if (!c) { return true; }
	if (c.blocks(what)) { return true; }

	if (this._beings[id] && what == RPG.BLOCKS_MOVEMENT) { return true; }
	if (this._features[id] && this._features[id].blocks(what)) { return true; }

	return false;
}

/**
 * Returns map corner coordinates
 * @returns {RPG.Coords[]}
 */
RPG.Map.prototype._getCorners = function() {
	return [
		new RPG.Coords(0, 0),
		new RPG.Coords(this._size.x-1, 0),
		new RPG.Coords(this._size.x-1, this._size.y-1),
		new RPG.Coords(0, this._size.y-1)
	];
}

/**
 * @class Dungeon map
 * @augments RPG.Map
 */
RPG.Map.Dungeon = OZ.Class().extend(RPG.Map);

RPG.Map.Dungeon.prototype.init = function(id, size, danger) {
	this.parent(id, size, danger);
	this._default.empty = RPG.Cells.Corridor.getInstance();
	this._default.full = RPG.Cells.Wall.getInstance();
	this._rooms = [];
}

RPG.Map.Dungeon.prototype.addRoom = function(room) {
	this._rooms.push(room);
	this.addArea(room);
}

RPG.Map.Dungeon.prototype.getRooms = function() {
	return this._rooms;
}

/**
 * @class Village map
 * @augments RPG.Map
 */
RPG.Map.Village = OZ.Class().extend(RPG.Map);

RPG.Map.Village.prototype.init = function(id, size, danger) {
	this.parent(id, size, danger);
	this._default.empty = RPG.Cells.Grass.getInstance();
	this._default.full = RPG.Cells.Wall.getInstance();
}

/**
 * @class Map decorator
 */
RPG.Decorators.BaseDecorator = OZ.Singleton();

RPG.Decorators.BaseDecorator.prototype.decorate = function(map) {
	return this;
}

/**
 * Return number of free neighbors
 */
RPG.Decorators.BaseDecorator.prototype._freeNeighbors = function(map, center) {
	var result = 0;
	var coords = map.getCoordsInCircle(center, 1, false);
	for (var i=0;i<coords.length;i++) {
		if (!map.blocks(RPG.BLOCKS_MOVEMENT, coords[i])) { result++; }
	}
	return result;
}

/**
 * @class Map generator
 */
RPG.Generators.BaseGenerator = OZ.Singleton();

RPG.Generators.BaseGenerator.prototype.init = function() {
	this._defOptions = {
		ctor: RPG.Map.Dungeon
	}
	this._size = null;

	/* there are initialized by _blankMap */
	this._dug = 0;
	this._boolArray = null;
	this._rooms = [];
}

RPG.Generators.BaseGenerator.prototype.generate = function(id, size, danger, options) {
	this._options = {};
	for (var p in this._defOptions) { this._options[p] = this._defOptions[p]; }
	for (var p in options) { this._options[p] = options[p]; }

	this._size = size;
	this._blankMap();
}

RPG.Generators.BaseGenerator.prototype._convertToMap = function(id, danger) {
	var map = new this._options.ctor(id, this._size, danger);
	map.fromBoolArray(this._boolArray);
	
	while (this._rooms.length) { map.addRoom(this._rooms.shift()); }
	this._boolArray = null;
	return map;
}

RPG.Generators.BaseGenerator.prototype._isValid = function(coords) {
	if (coords.x < 0 || coords.y < 0) { return false; }
	if (coords.x >= this._size.x || coords.y >= this._size.y) { return false; }
	return true;
}

/**
 * Return number of free neighbors
 */
RPG.Generators.BaseGenerator.prototype._freeNeighbors = function(center) {
	var result = 0;
	for (var i=-1;i<=1;i++) {
		for (var j=-1;j<=1;j++) {
			if (!i && !j) { continue; }
			var coords = new RPG.Coords(i, j).plus(center);
			if (!this._isValid(coords)) { continue; }
			if (!this._boolArray[coords.x][coords.y]) { result++; }
		}
	}
	return result;
}

RPG.Generators.BaseGenerator.prototype._blankMap = function() {
	this._rooms = [];
	this._boolArray = [];
	this._dug = 0;
	
	for (var i=0;i<this._size.x;i++) {
		this._boolArray.push([]);
		for (var j=0;j<this._size.y;j++) { this._boolArray[i].push(true); }
	}
}

RPG.Generators.BaseGenerator.prototype._digRoom = function(corner1, corner2) {
	var room = new RPG.Areas.Room(corner1, corner2);
	this._rooms.push(room);
	
	for (var i=corner1.x;i<=corner2.x;i++) {
		for (var j=corner1.y;j<=corner2.y;j++) {
			this._boolArray[i][j] = false;
		}
	}
	
	this._dug += (corner2.x-corner1.x) * (corner2.y-corner1.y);
	return room;
}

/**
 * Randomly picked coords. Can represent top-left corner of a room minSize*minSize
 * @param {int} minSize
 */
RPG.Generators.BaseGenerator.prototype._generateCoords = function(minSize) {
	var padding = 2 + minSize - 1;
	var x = Math.floor(Math.random()*(this._size.x-padding)) + 1;
	var y = Math.floor(Math.random()*(this._size.y-padding)) + 1;
	return new RPG.Coords(x, y);
}

/**
 * Randomly picked bottom-right corner
 * @param {RPG.Coords} corner top-left corner
 * @param {int} minSize
 * @param {int} maxWidth
 * @param {int} maxHeight
 */
RPG.Generators.BaseGenerator.prototype._generateSecondCorner = function(corner, minSize, maxWidth, maxHeight) {
	var availX = this._size.x - corner.x - minSize;
	var availY = this._size.y - corner.y - minSize;
	
	availX = Math.min(availX, maxWidth - minSize + 1);
	availY = Math.min(availY, maxHeight - minSize + 1);
	
	var width = Math.floor(Math.random()*availX) + minSize;
	var height = Math.floor(Math.random()*availY) + minSize;
	return new RPG.Coords(corner.x + width - 1, corner.y + height - 1);
}

/**
 * Can a given rectangle fit in a map?
 */
RPG.Generators.BaseGenerator.prototype._freeSpace = function(corner1, corner2) {
	var c = new RPG.Coords(0, 0);
	for (var i=corner1.x; i<=corner2.x; i++) {
		for (var j=corner1.y; j<=corner2.y; j++) {
			c.x = i;
			c.y = j;
			if (!this._isValid(c)) { return false; }
			if (!this._boolArray[i][j]) { return false; }
		}
	}
	return true;
}
