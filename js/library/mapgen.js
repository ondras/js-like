/**
 * @class Map generator
 */
RPG.Engine.MapGen = OZ.Class();

RPG.Engine.MapGen.prototype.init = function(size, wall, floor) {
	this._size = size;
	this._wall = RPG.Cells.Wall;
	this._corridor = RPG.Cells.Corridor;
	this._door = RPG.Items.Door;
}

RPG.Engine.MapGen.prototype.generate = function() {
	var map = this._blankMap();
	return map;
}

RPG.Engine.MapGen.prototype._blankMap = function() {
	var map = new RPG.Engine.Map(this._size);
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			c.x = i;
			c.y = j;
			map.setCell(c, new this._wall());
		}
	}
	return map;
}

RPG.Engine.MapGen.prototype._digRoom = function(map, corner1, corner2) {
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=corner1.x;i<=corner2.x;i++) {
		for (var j=corner1.y;j<=corner2.y;j++) {
			c.x = i;
			c.y = j;
			map.setCell(c, new this._corridor());
		}
	}
}

RPG.Engine.MapGen.prototype._generateCoords = function(minSize) {
	var padding = 2 + minSize - 1;
	var x = Math.floor(Math.random()*(this._size.x-padding)) + 1;
	var y = Math.floor(Math.random()*(this._size.y-padding)) + 1;
	return new RPG.Misc.Coords(x, y);
}

RPG.Engine.MapGen.prototype._generateSize = function(corner, minSize, maxWidth, maxHeight) {
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
RPG.Engine.MapGen.prototype._freeSpace = function(map, corner1, corner2) {
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=corner1.x; i<=corner2.x; i++) {
		for (var j=corner1.y; j<=corner2.y; j++) {
			c.x = i;
			c.y = j;
			if (!map.isValid(c)) { return false; }

			var cell = map.at(c);
			if (!(cell instanceof this._wall)) { return false; }
		}
	}
	return true;
}

/**
 * @class Arena map generator
 * @augments RPG.Engine.MapGen
 */
RPG.Engine.MapGen.Arena = OZ.Class().extend(RPG.Engine.MapGen);

RPG.Engine.MapGen.Arena.prototype.generate = function() {
	var map = this._blankMap();
	var c1 = new RPG.Misc.Coords(1, 1);
	var c2 = new RPG.Misc.Coords(this._size.x-1, this._size.y-1);
	this._digRoom(map, c1, c2);
	return map;
}

/**
 * @class Random map generator
 * @augments RPG.Engine.MapGen
 */ 
RPG.Engine.MapGen.Random = OZ.Class().extend(RPG.Engine.MapGen);

RPG.Engine.MapGen.Random.prototype.init = function(size) {
	this.parent(size);
	this._roomAttempts = 10; /* new room is created N-times until is considered as impossible to generate */
	this._roomPercentage = 0.2; /* we stop after this percentage of level area has been dug out */
	this._minSize = 3; /* minimum room dimension */
	this._maxWidth = 7; /* maximum room width */
	this._maxHeight = 5; /* maximum room height */
	this._roomSeparation = 2; /* minimum amount of cells between two rooms */
}

RPG.Engine.MapGen.Random.prototype.generate = function() {
	while (1) {
		var map = this._blankMap();
		var rooms = this._generateRooms(map);
		var result = this._generateCorridors(map, rooms);
		if (result == 1) { return map; }
	}
}

/**
 * Generates a suitable amount of rooms
 */
RPG.Engine.MapGen.Random.prototype._generateRooms = function(map) {
	var rooms = [];
	var digged = 0;
	
	do {
		var room = this._generateRoom(map, rooms);
		
		if (room) { 
			rooms.push(room);

			/* dig the room */
			this._digRoom(map, room[0], room[1]);
			
			/* maybe we were digging enough? */
			digged += (room[1].x-room[0].x) * (room[1].y - room[0].y);
			var w = this._size.x-2;
			var h = this._size.y-2;
			if (digged/(w*h) > this._roomPercentage) { break; }
		}
	} while (room);

	return rooms;
}

/**
 * Generates connectors beween rooms
 * @returns {bool} success Was this attempt successfull?
 */
RPG.Engine.MapGen.Random.prototype._generateCorridors = function(map, rooms) {
	return 1;
}

/**
 * Try to generate one room
 */
RPG.Engine.MapGen.Random.prototype._generateRoom = function(map, rooms) {
	var count = 0;
	do {
		count++;
		
		/* generate corner */
		var corner1 = this._generateCoords(this._minSize);
		
		/* and room size */
		var dims = this._generateSize(corner1, this._minSize, this._maxWidth, this._maxHeight);
		
		/* this is the room */
		var corner2 = corner1.clone();
		corner2.x += dims.x-1;
		corner2.y += dims.y-1;
		
		/* enlarge for fitting */
		var c1 = corner1.clone();
		c1.x--;
		c1.y--;
		var c2 = corner2.clone();
		c2.x += 1;
		c2.y += 1;
		
		/* is this one room okay? */
		var fits = this._freeSpace(map, c1, c2);
		if (fits) { return [corner1, corner2]; }
	} while (count < this._roomAttempts);

	/* no room was generated in a given number of attempts */
	return false;
}

RPG.Engine.MapGen.Random.prototype._intersects = function(rooms, room) {
	var roomw = room[1].x - room[0].x + 1;
	var roomh = room[1].y - room[0].y + 1;
	
	for (var i=0;i<rooms.length;i++) {
		var r = rooms[i];
		var rw = r[1].x - r[0].x + 1;
		var rh = r[1].y - r[0].y + 1;
		
		var availw = roomw+rw + this._roomSeparation-1;
		var availh = roomh+rh + this._roomSeparation-1;
		
		/* compute bounding box of room union */
		var left = Math.min(room[0].x, r[0].x); 
		var right = Math.max(room[1].x, r[1].x);
		var top = Math.min(room[0].y, r[0].y);
		var bottom = Math.max(room[1].y, r[1].y);
		
		if (right-left < availw && bottom-top < availh) { return true; }
	}
	return false;
}

/**
 * @class Random dungeon generator using human-like digging patterns.
 * Heavily based on Mike Andrson's ideas from the "Tyrant" algo, mentioned at 
 * http://www.roguebasin.roguelikedevelopment.org/index.php?title=Dungeon-Building_Algorithm .
 * @augments RPG.Engine.MapGen
 */
RPG.Engine.MapGen.Digger = OZ.Class().extend(RPG.Engine.MapGen);

RPG.Engine.MapGen.Digger.prototype.init = function(size) {
	this.parent(size);
	this._features = {
		"room": 2,
		"corridor": 2
	}
	this._featureAttempts = 15; /* how many times do we try to create a feature on a suitable wall */
	this._maxLength = 10; /* max corridor length */
	this._minLength = 2; /* min corridor length */
	this._minSize = 3; /* min room size */
	this._maxWidth = 8; /* max room width */
	this._maxHeight = 5; /* max room height */
	this._diggedPercentage = 0.25; /* we stop after this percentage of level area has been dug out */
	
	this._freeWalls = []; /* these are available for digging */
	this._forcedWalls = []; /* these are forced for digging */

}

RPG.Engine.MapGen.Digger.prototype.generate = function() {
	var map = this._blankMap();
	this._digged = 0;

	this._firstRoom(map);
	var area = (this._size.x-2) * (this._size.y-2);

	do {
		/* find a good wall */
		var wall = this._findWall(map);

		var featureResult = false;
		var featureCount = 0;
		do {
			/* Try adding afeature */
			featureResult = this._tryFeature(map, wall);
			featureCount++;
			/* Feature added, cool */
			if (featureResult) { break; }
		} while (featureCount < this._featureAttempts);
	} while (this._digged/area < this._diggedPercentage || this._forcedWalls.length)
	
	return map;
}

RPG.Engine.MapGen.Digger.prototype._firstRoom = function(map) {
	var corner1 = this._generateCoords(this._minSize);
	var dims = this._generateSize(corner1, this._minSize, this._maxWidth, this._maxHeight);
	
	var corner2 = corner1.clone();
	corner2.x += dims.x-1;
	corner2.y += dims.y-1;
	
	this._digged += dims.x*dims.y;
	
	this._digRoom(map, corner1, corner2);
	this._addSurroundingWalls(map, corner1, corner2);
}

/**
 * This _always_ finds a suitable wall.
 * Suitable wall has 3 neighbor walls and 1 neighbor corridor.
 * @returns {RPG.Misc.Coords}
 */
RPG.Engine.MapGen.Digger.prototype._findWall = function(map) {
	if (this._forcedWalls.length) {
		var index = Math.floor(Math.random()*this._forcedWalls.length);
		var wall = this._forcedWalls[index];
		this._forcedWalls.splice(index, 1);
		return wall;
	} else {
		if (!this._freeWalls.length) { alert("PANIC! No suitable wall found."); }
		var index = Math.floor(Math.random()*this._freeWalls.length);
		return this._freeWalls[index];
	}

	
}

/**
 * Tries adding a feature
 * @returns {bool} was this a successful try?
 */
RPG.Engine.MapGen.Digger.prototype._tryFeature = function(map, wall) {
	var name = this._getFeature();
	var func = this["_feature" + name.charAt(0).toUpperCase() + name.substring(1)];
	if (!func) { alert("PANIC! Non-existant feature '"+name+"'."); }
	
	return func.call(this, map, wall);
}

/**
 * Get a random feature name
 */
RPG.Engine.MapGen.Digger.prototype._getFeature = function() {
	var total = 0;
	for (var p in this._features) { total += this._features[p]; }
	var random = Math.floor(Math.random()*total);
	
	var sub = 0;
	for (var p in this._features) {
		sub += this._features[p];
		if (random < sub) { return p; }
	}
}

/**
 * Wall feature
 */
RPG.Engine.MapGen.Digger.prototype._featureRoom = function(map, wall) {
	/* corridor vector */
	var direction = this._emptyDirection(map, wall);
	var normal = new RPG.Misc.Coords(direction.y, -direction.x);

	var diffX = this._maxWidth - this._minSize + 1;
	var diffY = this._maxHeight - this._minSize + 1;
	var width = Math.floor(Math.random() * diffX) + this._minSize;
	var height = Math.floor(Math.random() * diffY) + this._minSize;
	
	/* one corner of the room, unshifted */
	var corner1 = wall.clone();
	corner1.x += direction.x;
	corner1.y += direction.y;
	
	var corner2 = corner1.clone();
	
	if (direction.x > 0 || direction.y > 0) {
		/* corner1 is top-left */
		corner2.x += width - 1;
		corner2.y += height - 1;
	} else {
		/* corner1 is bottom-right, swap */
		corner1.x -= width + 1;
		corner1.y -= height + 1;
	}
	
	/* shifting */
	var shift = 0;
	var prop = "";
	if (direction.x != 0) {
		/* vertical shift */
		prop = "y";
		var diff = height - 2;
		var shift = Math.floor(Math.random()*diff)+1;
		if (direction.x > 0) { shift = -shift; }
	} else {
		/* horizontal shift */
		prop = "x";
		var diff = width - 2;
		var shift = Math.floor(Math.random()*diff)+1;
		if (direction.y > 0) { shift = -shift; }
	}
	corner1[prop] += shift;
	corner2[prop] += shift;
	
	/* enlarge for testing */
	var c1 = corner1.clone();
	c1.x -= 1;
	c1.y -= 1;
	var c2 = corner2.clone();
	c2.x += 1;
	c2.y += 1;

	var ok = this._freeSpace(map, c1, c2);
	if (!ok) { return false; }
	
	/* dig the wall + room */
	this._digged += 1 + width*height;
	var door = new this._door();
	map.setCell(wall, new this._corridor());
	map.addItem(wall, door);
	this._digRoom(map, corner1, corner2);
	
	/* add to a list of free walls */
	this._addSurroundingWalls(map, corner1, corner2);
	
	/* remove 3 free walls from entrance */
	this._removeFreeWall(wall);
	var c = new RPG.Misc.Coords();
	c.x = wall.x + normal.x;
	c.y = wall.y + normal.y;
	this._removeFreeWall(c);
	c.x = wall.x - normal.x;
	c.y = wall.y - normal.y;
	this._removeFreeWall(c);

	return true;
}

/**
 * Corridor feature
 */
RPG.Engine.MapGen.Digger.prototype._featureCorridor = function(map, wall) {
	/* corridor vector */
	var direction = this._emptyDirection(map, wall);
	var normal = new RPG.Misc.Coords(direction.y, -direction.x);
	
	/* wall length */
	var availSpace = 0;
	var c = wall.clone();
	while (map.isValid(c)) {
		c.x += direction.x;
		c.y += direction.y;
		availSpace++;
	}
	availSpace--;
	
	/* not enough space */
	if (availSpace < this._maxLength) { return false; }
	
	/* random length */
	var diff = this._maxLength - this._minLength + 1;
	var length = Math.floor(Math.random() * diff) + this._minLength;
	length = Math.min(length, availSpace);
	
	/* start point */
	var start = wall.clone();
	
	/* end point */
	var end = start.clone();
	for (var i=1;i<length;i++) {
		end.x += direction.x;
		end.y += direction.y;
	}
	
	var left = Math.min(start.x + normal.x, start.x - normal.x, end.x + normal.x, end.x - normal.x);
	var right = Math.max(start.x + normal.x, start.x - normal.x, end.x + normal.x, end.x - normal.x);
	var top = Math.min(start.y + normal.y, start.y - normal.y, end.y + normal.y, end.y - normal.y);
	var bottom = Math.max(start.y + normal.y, start.y - normal.y, end.y + normal.y, end.y - normal.y);
	
	var corner1 = new RPG.Misc.Coords(left, top);
	var corner2 = new RPG.Misc.Coords(right, bottom);

	var ok = this._freeSpace(map, corner1, corner2);
	if (!ok) { return false; }
	
	/* dig the wall + corridor */
	this._digged += length;
	var c = start.clone();
	for (var i=0;i<length;i++) {
		map.setCell(c, new this._corridor());
		c.x += direction.x;
		c.y += direction.y;
	}
	
	/* add a door? */
	var empty = start.clone();
	empty.x -= direction.x;
	empty.y -= direction.y;
	var c1 = empty.clone();
	var c2 = empty.clone();
	c1.x += normal.x;
	c1.y += normal.y;
	c2.x -= normal.x;
	c2.y -= normal.y;
	if (!(map.at(c1) instanceof this._wall) && !(map.at(c2) instanceof this._wall)) {
		var door = new this._door();
		map.addItem(wall, door);
	} 
	
	this._forcedWalls = [];
	
	/* add forced endings */
	c.x = end.x + direction.x;
	c.y = end.y + direction.y;
	this._addForcedWall(map, c);
	c.x = end.x + normal.x;
	c.y = end.y + normal.y;
	this._addForcedWall(map, c);
	c.x = end.x - normal.x;
	c.y = end.y - normal.y;
	this._addForcedWall(map, c);
	
	/* remove end cell from free walls */
	this._removeFreeWall(end);

	/* normalize start & end order */
	if (start.x > end.x || start.y > end.y) {
		var tmp = start;
		start = end;
		end = tmp;
	}
	/* sync list of free walls */
	this._addSurroundingWalls(map, start, end);
	
	/* remove walls that are not free anymore */
	c.x = wall.x;
	c.y = wall.y;
	this._removeFreeWall(c);
	c.x = wall.x + normal.x;
	c.y = wall.y + normal.y;
	this._removeFreeWall(c);
	c.x = wall.x - normal.x;
	c.y = wall.y - normal.y;
	this._removeFreeWall(c);
	
	return true;
}

/**
 * Adds a new wall to list of available walls
 */
RPG.Engine.MapGen.Digger.prototype._addFreeWall = function(map, coords) {
	/* remove if already exists */
	this._removeFreeWall(coords);
	
	/* is this one ok? */
	var ok = this._emptyDirection(map, coords);
	if (!ok) { return; }
	
	/* ok, so let's add it */
	this._freeWalls.push(coords.clone());
}

/**
 * Adds a new wall to list of forced walls
 */
RPG.Engine.MapGen.Digger.prototype._addForcedWall = function(map, coords) {
	/* is this one ok? */
	var ok = this._emptyDirection(map, coords);
	if (!ok) { return; }
	
	/* ok, so let's add it */
	this._forcedWalls.push(coords.clone());
}

/**
 * Removes a wall from list of walls
 */
RPG.Engine.MapGen.Digger.prototype._removeFreeWall = function(coords) {
	for (var i=0;i<this._freeWalls.length;i++) {
		var wall = this._freeWalls[i];
		if (wall.x == coords.x && wall.y == coords.y) {
			this._freeWalls.splice(i, 1);
			return;
		}
	}
}

/**
 * Returns vector in "digging" direction, or false, if this does not exist (or is not unique)
 */
RPG.Engine.MapGen.Digger.prototype._emptyDirection = function(map, coords) {
	var c = new RPG.Misc.Coords();
	var empty = null;
	var deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
	
	for (var i=0;i<deltas.length;i++) {
		c.x = coords.x+deltas[i][0];
		c.y = coords.y+deltas[i][1];
		
		if (!map.isValid(c)) { return false; }
		
		var cell = map.at(c);
		if (!(cell instanceof this._wall)) { 
			
			/* there already is another empty neighbor! */
			if (empty) { return false; }
			
			empty = c.clone();
		}
	}
	
	/* no empty neighbor */
	if (!empty) { return false; }
	
	return new RPG.Misc.Coords(coords.x - empty.x, coords.y - empty.y);
}

/**
 * For a given rectangular area, adds all relevant surrounding walls to list of free walls
 */
RPG.Engine.MapGen.Digger.prototype._addSurroundingWalls = function(map, corner1, corner2) {
	var c = new RPG.Misc.Coords(0, 0);
	var left = corner1.x-1;
	var right = corner2.x+1;
	var top = corner1.y-1;
	var bottom = corner2.y+1;
	
	for (var i=left;i<=right;i++) {
		for (var j=top;j<=bottom;j++) {
			if (i == left || i == right || j == top || j == bottom) {
				c.x = i;
				c.y = j;
				this._addFreeWall(map, c);
			}
		}
	}
}
