/**
 * @class Dungeon cell
 * @augments RPG.Misc.IModifier
 * @augments RPG.Misc.ISerializable
 * @augments RPG.Misc.IVisual
 */
RPG.Cells.BaseCell = OZ.Class()
						.implement(RPG.Misc.IVisual)
						.implement(RPG.Misc.ISerializable)
						.implement(RPG.Misc.IModifier);
RPG.Cells.BaseCell.prototype.init = function() {
	this._initVisuals();
	this._items = [];
	this._modifiers = {};
	this._being = null;
	this._feature = null;
	this._coords = null;
	this._map = null;
	this._room = null;
	this._type = RPG.BLOCKS_NOTHING;
	this._memory = {
		state: RPG.MAP_UNKNOWN,
		data: []
	}
}

RPG.Cells.BaseCell.prototype.customSerialize = function(serializer) {
	var options = {
		exclude: ["_image", "_char", "_description", "_color"]
	}
	return serializer.serialize(this, options);
}

RPG.Cells.BaseCell.prototype.serialize = function(serializer) {
	var result = {};
	if (this._coords) { result.coords = this._coords.toString(); }

	if (this._items.length) {
		result.items = [];
		for (var i=0;i<this._items.length;i++) {
			result.items.push(serializer.serialize(this._items[i]));
		}
	}
	
	if (this._being) {
		result.being = serializer.serialize(this._being);
	}
	
	if (this._feature) {
		result.feature = serializer.serialize(this._feature);
	}
	
	if (this._room) {
		result.room = serializer.serialize(this._room);
	}
	
	result.memory = {
		state: this._memory.state,
		data: []
	};
	for (var i=0;i<this._memory.data.length;i++) {
		var item = this._memory.data[i];
		var tmp;
		if (item instanceof RPG.Misc.VisualTrace) {
			tmp = item.toJSON();
		} else {
			tmp = serializer.serialize(item);
		}
		result.memory.data.push(tmp);
	}
	
	return result;
}

RPG.Cells.BaseCell.prototype.parse = function(data, parser) {
	if (data.coords) {
		this._coords = RPG.Misc.Coords.fromString(data.coords);
	}

	if (data.items) {
		for (var i=0;i<data.items.length;i++) {
			var item = data.items[i];
			this._items.push(null);
			parser.parse(item, this._items, this._items.length-1);
		}
	}
	
	if (data.being) {
		parser.parse(data.being, this, "_being");
	}
	
	if (data.feature) {
		parser.parse(data.feature, this, "_feature");
	}
	
	if (data.room) {
		parser.parse(data.room, this, "_room");
	}
	
	var m = data.memory;
	this._memory.state = m.state;
	for (var i=0;i<m.data.length;i++) {
		var tmp = m.data[i];
		if (tmp instanceof Object) {
			this._memory.data.push(RPG.Misc.VisualTrace.fromJSON(tmp));
		} else {
			this._memory.data.push(null);
			parser.parse(tmp, this._memory.data, this._memory.data.length-1);
		}
	}
}

RPG.Cells.BaseCell.prototype.getMemory = function() {
	return this._memory;
}

RPG.Cells.BaseCell.prototype.setMemoryState = function(state) {
	this._memory.state = state;
	if (state == RPG.MAP_UNKNOWN) { 
		this._memory.data = [];
		return;
	}
	
	var arr = [this];
	
	if (this._being && state == RPG.MAP_VISIBLE) { /* being? */
		arr.push(this._being);
	} else if (this._items.length) {
		arr.push(this._items[this._items.length-1]);
	} else if (this._feature && this._feature.knowsAbout(RPG.Game.pc)) {
		arr.push(this._feature);
	}
	
	/* remembered stack uses clones */
	if (state == RPG.MAP_REMEMBERED) {
		for (var i=0;i<arr.length;i++) {
			arr[i] = new RPG.Misc.VisualTrace(arr[i]);
		}
	}
	
	this._memory.data = arr;
	
}

RPG.Cells.BaseCell.prototype.neighbor = function(dir) {
	var c = this._coords.clone().plus(RPG.DIR[dir]);
	return this._map.at(c);
}

RPG.Cells.BaseCell.prototype.addItem = function(item) {
	item.mergeInto(this._items);
}

RPG.Cells.BaseCell.prototype.removeItem = function(item) {
	var index = this._items.indexOf(item);
	if (index == -1) { throw new Error("Item not found"); }
	this._items.splice(index, 1);
}

RPG.Cells.BaseCell.prototype.getItems = function() {
	return this._items;
}

RPG.Cells.BaseCell.prototype.setBeing = function(being) {
	this._being = being;
	if (!being) { return; }

	var oldCell = being.getCell();
	if (this._room && (!oldCell || oldCell.getRoom() != this._room)) {
		/* entering a new room */
		this._room.entered(this);
	}
	
	being.setCell(this); 
	
	/* entering a feature */
	if (this._feature) { this._feature.entered(being); }
}

RPG.Cells.BaseCell.prototype.getBeing = function() {
	return this._being;
}

RPG.Cells.BaseCell.prototype.setMap = function(map) {
	this._map = map;
}

RPG.Cells.BaseCell.prototype.getMap = function() {
	return this._map;
}

RPG.Cells.BaseCell.prototype.setCoords = function(coords) {
	this._coords = coords.clone();
}

RPG.Cells.BaseCell.prototype.getCoords = function() {
	return this._coords;
}

RPG.Cells.BaseCell.prototype.setFeature = function(feature) {
	this._feature = feature;
	if (feature) { feature.setCell(this); }
}

RPG.Cells.BaseCell.prototype.getFeature = function() {
	return this._feature;
}

RPG.Cells.BaseCell.prototype.setRoom = function(room) {
	this._room = room;
	return this;
}

RPG.Cells.BaseCell.prototype.getRoom = function() {
	return this._room;
}

RPG.Cells.BaseCell.prototype.getType = function() {
	return this._type;
}

/**
 * Can a being move to this cell?
 */
RPG.Cells.BaseCell.prototype.isFree = function() {
	if (this._being) { return false; }
	if (this._type >= RPG.BLOCKS_MOVEMENT) { return false; }
	if (this._feature) { return this._feature.isFree(); }
	return true;
}

/**
 * Can a being see through this cell?
 */
RPG.Cells.BaseCell.prototype.visibleThrough = function() {
	if (this._type >= RPG.BLOCKS_LIGHT) { return false; }
	if (this._feature) { return this._feature.visibleThrough(); }
	return true;
}

/**
 * @class Room, a logical group of cells
 * @augments RPG.Misc.IModifier
 * @augments RPG.Misc.ISerializable
 * @param {RPG.Map} map
 * @param {RPG.Misc.Coords} corner1 top-left corner
 * @param {RPG.Misc.Coords} corner2 bottom-right corner
 */
RPG.Rooms.BaseRoom = OZ.Class()
						.implement(RPG.Misc.IModifier)
						.implement(RPG.Misc.ISerializable);

RPG.Rooms.BaseRoom.prototype.init = function(corner1, corner2) {
	this._modifiers = {};
	this._welcome = null;
	this._corner1 = corner1.clone();
	this._corner2 = corner2.clone();
	this._type = null;
}

RPG.Rooms.BaseRoom.prototype.serialize = function(serializer) {
	return {
		welcome: this._welcome,
		corner1: this._corner1.toString(),
		corner2: this._corner2.toString()
	};
}

RPG.Rooms.BaseRoom.prototype.revive = function(data, parser) {
	var c1 = RPG.Misc.Coords.fromString(data.corner1);
	var c2 = RPG.Misc.Coords.fromString(data.corner2);
	return new this.constructor(c1, c2);
}

RPG.Rooms.BaseRoom.prototype.parse = function(data, parser) {
	this._welcome = data.welcome;
}

RPG.Rooms.BaseRoom.prototype.setWelcome = function(text) {
	this._welcome = text;
	return this;
}

RPG.Rooms.BaseRoom.prototype.getWelcome = function() {
	return this._welcome;
}

RPG.Rooms.BaseRoom.prototype.getCorner1 = function() {
	return this._corner1;
}

RPG.Rooms.BaseRoom.prototype.getCorner2 = function() {
	return this._corner2;
}

RPG.Rooms.BaseRoom.prototype.getCenter = function() {
	var x = Math.round((this._corner1.x + this._corner2.x)/2);
	var y = Math.round((this._corner1.y + this._corner2.y)/2);
	return new RPG.Misc.Coords(x, y);
}

/**
 * A being entered this room
 * @param {RPG.Beings.BaseBeing} being
 */
RPG.Rooms.BaseRoom.prototype.entered = function(being) {
	if (this._welcome && being == RPG.Game.pc) { RPG.UI.buffer.message(this._welcome); }
}

/**
 * @class Dungeon feature
 * @augments RPG.Misc.IVisual
 * @augments RPG.Misc.ISerializable
 */
RPG.Features.BaseFeature = OZ.Class()
							.implement(RPG.Misc.IVisual)
							.implement(RPG.Misc.ISerializable);
RPG.Features.BaseFeature.prototype.init = function() {
	this._cell = null;
	this._initVisuals();
	this._type = RPG.BLOCKS_NOTHING;
}


RPG.Features.BaseFeature.prototype.serialize = function(serializer) {
	var result = {
		cell: serializer.serialize(this._cell)
	};
	return result;
}

RPG.Features.BaseFeature.prototype.parse = function(data, parser) {
	parser.parse(data.cell, this, "_cell");
}

RPG.Features.BaseFeature.prototype.knowsAbout = function(being) {
	return true;
}

RPG.Features.BaseFeature.prototype.setCell = function(cell) {
	this._cell = cell;
}

RPG.Features.BaseFeature.prototype.getCell = function() {
	return this._cell;
}

/**
 * Notify feature that a being came here
 * @param {RPG.Beings.BaseBeing} being
 */
RPG.Features.BaseFeature.prototype.entered = function(being) {
}

RPG.Features.BaseFeature.prototype.getType = function() {
	return this._type;
}

/**
 * Can a being move to this feature?
 */
RPG.Features.BaseFeature.prototype.isFree = function() {
	return (this._type < RPG.BLOCKS_MOVEMENT);
}

/**
 * Can a being see through this feature?
 */
RPG.Features.BaseFeature.prototype.visibleThrough = function() {
	return (this._type < RPG.BLOCKS_LIGHT);
}

/**
 * @class Dungeon map
 * @augments RPG.Misc.IModifier
 * @augments RPG.Misc.ISerializable
 */
RPG.Map = OZ.Class()
			.implement(RPG.Misc.IModifier)
			.implement(RPG.Misc.ISerializable);

RPG.Map.prototype.init = function(id, size, danger) {
	this._modifiers = {};
	this._id = id;
	this._welcome = "";
	this._sound = null;
	this._size = size.clone();
	this._data = [];
	this._rooms = [];
	this._danger = danger;

	this._blank();
}

RPG.Map.prototype.serialize = function(serializer) {
	var result = {
		modifiers: this._modifiers,
		id: this._id,
		welcome: this._welcome,
		sound: this._sound,
		size: this._size.toString(),
		danger: this._danger
	};
	
	result.rooms = [];
	for (var i=0;i<this._rooms.length;i++) {
		result.rooms.push(serializer.serialize(this._rooms[i]));
	}
	
	result.cells = [];
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			var cell = this._data[i][j];
			if (cell) { result.cells.push(serializer.serialize(cell)); }
		}
	}
	
	return result;
}

RPG.Map.prototype.revive = function(data, parser) {
	var size = RPG.Misc.Coords.fromString(data.size);
	return new this.constructor(data.id, size, data.danger);
}

RPG.Map.prototype.parse = function(data, parser) {
	this._rooms = [];
	this._data = [];
	this._welcome = data.welcome;
	this._sound = data.sound;
	
	for (var i=0;i<data.rooms.length;i++) {
		var room = data.rooms[i];
		this._rooms.push(null);
		parser.parse(room, this._rooms, this._rooms.length-1);
	}
	
	this._blank();
	for (var i=0;i<data.cells.length;i++) {
		var cell = parser.parse(data.cells[i]);
		cell.setMap(this);
		var c = cell.getCoords();
		this._data[c.x][c.y] = cell;
	}
}


/**
 * This will be used now.
 */
RPG.Map.prototype.entered = function() {
	if (this._sound) { RPG.UI.sound.playBackground(this._sound); }
	if (this._welcome) { RPG.UI.buffer.message(this._welcome); }
}

/**
 * This map will not be used now
 */
RPG.Map.prototype.leave = function() {
	/* mark visible cells as remembered */
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			var c = this._data[i][j];
			if (!c) { continue; }
			var m = c.getMemory();
			if (m.state == RPG.MAP_VISIBLE) { c.setMemoryState(RPG.MAP_REMEMBERED); }
		}
	}
}

/**
 * Populates cells in this map based on an array of arrays of integers.
 * @param {int[][]} intMap
 * @param {RPG.Cells.BaseCell[]} cells Array of used cells
 */
RPG.Map.prototype.fromIntMap = function(intMap, cells) {
	var tmpCells = [];
	
	var w = intMap.length;
	var h = intMap[0].length;
	
	/* first, create all cells */
	for (var i=0;i<w;i++) {
		tmpCells.push([]);
		for (var j=0;j<h;j++) {
			var cell = this._cellFromNumber(intMap[i][j], cells);
			tmpCells[i].push(cell);
		}
	}
	
	/* second, decide which should be included in this map */
	var coords = new RPG.Misc.Coords(0, 0);
	for (var x=0;x<w;x++) { 
		for (var y=0;y<h;y++) {
			coords.x = x;
			coords.y = y;
            var cell = tmpCells[x][y];

			/* passable section */
			if (cell.visibleThrough()) {
				this.setCell(coords, cell);
				continue;
			}
			
			/* check neighbors; create nonpassable only if there is at least one passable neighbor */
			var ok = false;
			var neighbor = coords.clone();
			var minW = Math.max(0, x-1);
			var maxW = Math.min(w-1, x+1);
			var minH = Math.max(0, y-1);
			var maxH = Math.min(h-1, y+1);
			for (var i=minW;i<=maxW;i++) {
				for (var j=minH;j<=maxH;j++) {
					neighbor.x = i;
					neighbor.y = j;
					var neighborCell = tmpCells[i][j];
					if (neighborCell.visibleThrough()) { ok = true; }
				}
			}
			
			if (ok) {
				this.setCell(coords, cell);
				continue;
			}
		}
	}

	return this;
}

RPG.Map.prototype.setWelcome = function(text) {
	this._welcome = text;
	return this;
}

RPG.Map.prototype.getWelcome = function() {
	return this._welcome;
}

RPG.Map.prototype.setSound = function(sound) {
	this._sound = sound;
	return this;
}

RPG.Map.prototype.getSound = function() {
	return this._sound;
}

RPG.Map.prototype.getId = function() {
	return this._id;
}

RPG.Map.prototype.getDanger = function() {
	return this._danger;
}

/**
 * Get all beings in this Map
 */ 
RPG.Map.prototype.getBeings = function() {
	var all = [];
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			var cell = this._data[i][j];
			if (!cell) { continue; }
			var b = cell.getBeing();
			if (b) { all.push(b); }
		}
	}
	return all;
}

/**
 * Map size
 */
RPG.Map.prototype.getSize = function() {
	return this._size;
}

RPG.Map.prototype.setCell = function(coords, cell) {
	this._data[coords.x][coords.y] = cell;
	cell.setCoords(coords);
	cell.setMap(this);
}

RPG.Map.prototype.at = function(coords) {
	if (coords.x < 0 || coords.y < 0 || coords.x >= this._size.x || coords.y >= this._size.y) { return null; }
	return this._data[coords.x][coords.y];
}

RPG.Map.prototype.isValid = function(coords) {
	var size = this._size;
	if (Math.min(coords.x, coords.y) < 0) { return false; }
	if (coords.x >= size.x) { return false; }
	if (coords.y >= size.y) { return false; }
	return true;
}

/**
 * Return all features of a given type
 */
RPG.Map.prototype.getFeatures = function(ctor) {
	var arr = [];
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			var cell = this._data[i][j];
			if (!cell) { continue; }
			var f = cell.getFeature();
			if (f && f instanceof ctor) { arr.push(f); }
		}
	}
	return arr;
}

/**
 * Add a new room
 * @param {RPG.Misc.Coords} corner1
 * @param {RPG.Misc.Coords} corner2
 */
RPG.Map.prototype.addRoom = function(room) {
	this._rooms.push(room);
	this._assignRoom(room.getCorner1(), room.getCorner2(), room);
	return room;
}

/**
 * Replace old room with a new one. They must have the same position.
 */
RPG.Map.prototype.replaceRoom = function(oldRoom, newRoom) {
	var index = this._rooms.indexOf(oldRoom);
	if (index == -1) { throw new Error("Cannot find room"); }
	this._rooms[index] = newRoom;
	this._assignRoom(newRoom.getCorner1(), newRoom.getCorner2(), newRoom);
	
}

RPG.Map.prototype.removeRoom = function(room) {
	var index = this._rooms.indexOf(room);
	if (index == -1) { throw new Error("Cannot find room"); }
	this._rooms.splice(index, 1);
	this._assignRoom(room.getCorner1(), room.getCorner2(), null);
}

/**
 * Returns list of rooms in this map
 * @returns {RPG.Rooms.BaseRoom[]}
 */
RPG.Map.prototype.getRooms = function() {
	return this._rooms;
}

/**
 * Is it possible to see from one cell to another?
 * @obsolete
 * @param {RPG.Misc.Coords} c1
 * @param {RPG.Misc.Coords} c2
 * @returns {bool}
 */
RPG.Map.prototype.lineOfSight = function(c1, c2) {
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
	while (1) {
		current[major] += majorstep;
		error += delta;
		if (error + 0.001 > 0.5) {
			current[minor] += minorstep;
			error -= 1;
		}
		if (current[major] == c2[major]) { return true; }
		if (!this._data[current.x][current.y].visibleThrough()) { return false; }
	}
	
	return true;
}

RPG.Map.prototype.getFreeCell = function(noItems) {
	var all = [];
	var c = new RPG.Misc.Coords();
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			c.x = i;
			c.y = j;
			var cell = this._data[i][j];
			if (!cell) { continue; }
			if (!cell.isFree()) { continue; }
			if (cell.getFeature()) { continue; }
			if (noItems && cell.getItems().length) { continue; }
			all.push(cell);
		}
	}
	
	var index = Math.floor(Math.random()*all.length);
	return all[index];
}

/**
 * Return array of cells forming a "circle", e.g. having constant radius from a center point
 * @param {RPG.Misc.Coords} center
 * @param {int} radius
 * @param {bool} includeInvalid Include "null" value where a cell does not exist?
 * @returns {RPG.Cells.BaseCell[]}
 */
RPG.Map.prototype.cellsInCircle = function(center, radius, includeInvalid) {
	var arr = [];
	var W = this._size.x;
	var H = this._size.y;
	var c = center.clone();
	c.x += radius;
	c.y += radius;
	
	var dirs = [RPG.N, RPG.W, RPG.S, RPG.E];
	
	var count = 8*radius;
	for (var i=0;i<count;i++) {
		if (c.x < 0 || c.y < 0 || c.x >= W || c.y >= H) {
			if (includeInvalid) { arr.push(false); }
		} else {
			arr.push(this._data[c.x][c.y]);
		}
		
		var dir = dirs[Math.floor(i*dirs.length/count)];
		c.plus(RPG.DIR[dir]);
	}
	return arr;
}

/**
 * Line connecting two cells
 * @param {RPG.Misc.Coords} c1
 * @param {RPG.Misc.Coords} c2
 * @returns {RPG.Cells.BaseCell[]}
 */
RPG.Map.prototype.cellsInLine = function(c1, c2) {
	var result = [this._data[c1.x][c1.y]];
	
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
		result.push(this._data[current.x][current.y]);
	}
	
	return result;
}

/**
 * Returns cells in a flood-filled area
 * @param {RPG.Misc.Coords} center
 * @param {int} radius
 */
RPG.Map.prototype.cellsInArea = function(center, radius) {
	var result = [];
	var cell = this._data[center.x][center.y];
	
	function go(x, depth) {
		var index = -1;
		for (var i=0;i<result.length;i++) {
			var item = result[i];
			if (item[0] != x) { continue; }
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
			if (!n.visibleThrough()) { continue; }
			arguments.callee(n, depth+1);
		}
		
	}
	
	go(cell, 0);
	
	var arr = [];
	for (var i=0;i<result.length;i++) {
		arr.push(result[i][0]);
	}
	
	return arr;
}

/**
 * Returns map corner coordinates
 * @returns {RPG.Misc.Coords[]}
 */
RPG.Map.prototype.getCorners = function()
{
	return [
		new RPG.Misc.Coords(0, 0),
		new RPG.Misc.Coords(this._size.x-1, 0),
		new RPG.Misc.Coords(this._size.x-1, this._size.y-1),
		new RPG.Misc.Coords(0, this._size.y-1)
	];
}

/**
 * Returns first free cell closest to a coordinate
 * @param {RPG.Misc.Coords} center
 * @param {int} max radius
 */
RPG.Map.prototype.getClosestRandomFreeCell = function(center,radius)
{
	var sx = this._size.x;
	var sy = this._size.y;
	var max = radius * radius || (sx * sx + sy * sy);

	var cell = false;
	var r = 0;

	while (!cell && (r * r) < max) {
		var candidates = this.cellsInCircle(center, r, false);
		var avail = [];

		for (var j=0;j<candidates.length;j++) {
			var c = candidates[j];
			if (c.isFree()) { avail.push(c); }
		}

		if (avail.length) { cell = avail.random(); }

		r++;
	}

	return cell;
}

/**
 * Returns two free cells located in opposite corners
 */
RPG.Map.prototype.cellsInTwoCorners = function() {
	var corners = this.getCorners();

	var i1 = Math.floor(Math.random()*corners.length);
	var i2 = (i1+2) % corners.length;
	var indexes = [i1, i2];
	var result = [];

	for (var i=0;i<indexes.length;i++) {
		var center = corners[indexes[i]];
		var cell = this.getClosestRandomFreeCell(center);
		if (cell) { result.push(cell) }
	}

	return result;
}

RPG.Map.prototype._blank = function() {
	for (var i=0;i<this._size.x;i++) {
		var col = [];
		for (var j=0;j<this._size.y;j++) {
			col.push(null);
		}
		this._data.push(col);
	}
}

RPG.Map.prototype._assignRoom = function(corner1, corner2, room) {
	for (var i=corner1.x;i<=corner2.x;i++) {
		for (var j=corner1.y;j<=corner2.y;j++) {
			this._data[i][j].setRoom(room);
		}
	}
}

RPG.Map.prototype._cellFromNumber = function(celltype, cells) {
    return new cells[celltype]();
}


/**
 * @class Map decorator
 */
RPG.Decorators.BaseDecorator = OZ.Class();

RPG.Decorators.BaseDecorator.getInstance = function() {
	if (!this._instance) { this._instance = new this(); }
	return this._instance;
}
RPG.Decorators.BaseDecorator.prototype.decorate = function(map) {
	return this;
}

/**
 * Return number of free neighbors
 */
RPG.Decorators.BaseDecorator.prototype._freeNeighbors = function(map, center) {
	var result = 0;
	var cells = map.cellsInCircle(center, 1, false);
	for (var i=0;i<cells.length;i++) {
		if (cells[i] instanceof RPG.Cells.Corridor) { result++; }
	}
	return result;
}

/**
 * @class Map generator
 */
RPG.Generators.BaseGenerator = OZ.Class();

RPG.Generators.BaseGenerator.prototype.init = function(size, maptypes) {
	this._size = size;
	this._maptypes = maptypes || [RPG.Cells.Corridor, RPG.Cells.Wall];

	this._dug = 0;
	this._bitMap = null;
	this._rooms = [];
}

RPG.Generators.BaseGenerator.prototype.generate = function(id, danger) {
	this._blankMap();
	return this._convertToMap(id, danger);
}

RPG.Generators.BaseGenerator.prototype._convertToMap = function(id, danger) {
	var map = new RPG.Map(id, this._size, danger);
	map.fromIntMap(this._bitMap, this._maptypes);
	
	for (var i=0;i<this._rooms.length;i++) {
		map.addRoom(this._rooms[i]);
	}
	this._bitMap = null;
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
			var coords = new RPG.Misc.Coords(i, j).plus(center);
			if (!this._isValid(coords)) { continue; }
			if (!this._bitMap[coords.x][coords.y]) { result++; }
		}
	}
	return result;
}

RPG.Generators.BaseGenerator.prototype._blankMap = function() {
	this._rooms = [];
	this._bitMap = [];
	this._dug = 0;
	
	for (var i=0;i<this._size.x;i++) {
		this._bitMap.push([]);
		for (var j=0;j<this._size.y;j++) {
			this._bitMap[i].push(1);
		}
	}
}

RPG.Generators.BaseGenerator.prototype._digRoom = function(corner1, corner2) {
	var room = new RPG.Rooms.BaseRoom(corner1, corner2);
	this._rooms.push(room);
	
	for (var i=corner1.x;i<=corner2.x;i++) {
		for (var j=corner1.y;j<=corner2.y;j++) {
			this._bitMap[i][j] = 0;
		}
	}
	
	this._dug += (corner2.x-corner1.x) * (corner2.y-corner1.y);
}

RPG.Generators.BaseGenerator.prototype._generateCoords = function(minSize) {
	var padding = 2 + minSize - 1;
	var x = Math.floor(Math.random()*(this._size.x-padding)) + 1;
	var y = Math.floor(Math.random()*(this._size.y-padding)) + 1;
	return new RPG.Misc.Coords(x, y);
}

RPG.Generators.BaseGenerator.prototype._generateSize = function(corner, minSize, maxWidth, maxHeight) {
	var availX = this._size.x - corner.x - minSize;
	var availY = this._size.y - corner.y - minSize;
	
	availX = Math.min(availX, maxWidth - this._minSize + 1);
	availY = Math.min(availY, maxHeight - this._minSize + 1);
	
	var x = Math.floor(Math.random()*availX) + minSize;
	var y = Math.floor(Math.random()*availY) + minSize;
	return new RPG.Misc.Coords(x, y);
}

/**
 * Can a given rectangle fit in a map?
 */
RPG.Generators.BaseGenerator.prototype._freeSpace = function(corner1, corner2) {
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=corner1.x; i<=corner2.x; i++) {
		for (var j=corner1.y; j<=corner2.y; j++) {
			c.x = i;
			c.y = j;
			if (!this._isValid(c)) { return false; }
			if (!this._bitMap[i][j]) { return false; }
		}
	}
	return true;
}
