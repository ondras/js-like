/**
 * @class Arena map generator
 * @augments RPG.Generators.BaseGenerator
 */
RPG.Generators.Arena = OZ.Class().extend(RPG.Generators.BaseGenerator);

RPG.Generators.Arena.prototype.generate = function(id) {
	this._blankMap();
	
	var c1 = new RPG.Misc.Coords(1, 1);
	var c2 = new RPG.Misc.Coords(this._size.x-1, this._size.y-1);
	this._digRoom(c1, c2);

	return this._dig(id);
}

/**
 * @class Village generator
 * @augments RPG.Generators.BaseGenerator
 */
RPG.Generators.Village = OZ.Class().extend(RPG.Generators.BaseGenerator);

RPG.Generators.Village.prototype.generate = function(id) {
    var map = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,2,2,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0],
        [0,0,1,1,1,1,0,0,0,0,0,1,2,2,2,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,1,0,0,0,0],
        [0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ];

    var maptypes = [
        RPG.Cells.Grass,
        RPG.Cells.Wall,
        RPG.Cells.Corridor
    ];

    var danger = 1;

    return RPG.Dungeon.Map.fromIntMap(id,map.transpose(),danger,maptypes);
}


/**
 * @class Random map generator, tries to fill the space evenly
 * @augments RPG.Generators.BaseGenerator
 */ 
RPG.Generators.Uniform = OZ.Class().extend(RPG.Generators.BaseGenerator);

RPG.Generators.Uniform.prototype.init = function(size) {
	this.parent(size);
	
	this._roomAttempts = 10; /* new room is created N-times until is considered as impossible to generate */
	this._corridorAttemps = 50; /* corridors are tried N-times until the level is considered as impossible to connect */
	this._roomPercentage = 0.15; /* we stop after this percentage of level area has been dug out */
	this._minSize = 3; /* minimum room dimension */
	this._maxWidth = 7; /* maximum room width */
	this._maxHeight = 5; /* maximum room height */
	this._roomSeparation = 2; /* minimum amount of cells between two rooms */
	this._digged = 0;
	this._usedWalls = [];
	
	this.NORTH = 0;
	this.EAST = 1;
	this.SOUTH = 2;
	this.WEST = 3;
}

RPG.Generators.Uniform.prototype.generate = function(id, danger) {
	while (1) {
		this._blankMap(id);
		this._generateRooms();
		var result = this._generateCorridors();
		if (result == 1) { 
			return this._dig(id, danger); 
		}
	}
}

RPG.Generators.Uniform.prototype._blankMap = function() {
	this._usedWalls = [];
	this.parent();
}

RPG.Generators.Uniform.prototype._digRoom = function(c1, c2) {
	this.parent(c1, c2);
	var o = {};
	o[this.NORTH] = 0;
	o[this.EAST] = 0;
	o[this.SOUTH] = 0;
	o[this.WEST] = 0;
	this._usedWalls.push(o);
}

/**
 * Generates a suitable amount of rooms
 */
RPG.Generators.Uniform.prototype._generateRooms = function() {
	var digged = 0;
	var w = this._size.x-2;
	var h = this._size.y-2;

	do {
		var result = this._generateRoom();
		if (this._digged/(w*h) > this._roomPercentage) { break; }
	} while (result);
}

/**
 * Generates connectors beween rooms
 * @returns {bool} success Was this attempt successfull?
 */
RPG.Generators.Uniform.prototype._generateCorridors = function() {
	var cnt = 0;
		
	do {
		/* get two distinct rooms with unused walls */
		var rooms = this._findRoomPair();

		/* no such rooms - fuck! */
		if (!rooms) { return false; }
		
		/* connect those two walls with a corridor */
		var result = this._tryCorridor(rooms);
		if (result) {
			/* corridor created */
			cnt = 0;
		} else {
			/* failed to create */
			cnt++;
		}
		/* are we done? */
		if (this._noFreeRooms()) { return true; }
		
	} while (cnt < this._corridorAttempts);
	
	return false;
}

/**
 * Try to generate one room
 */
RPG.Generators.Uniform.prototype._generateRoom = function() {
	var count = 0;
	do {
		count++;
		
		/* generate corner */
		var corner1 = this._generateCoords(this._minSize);
		
		/* and room size */
		var dims = this._generateSize(corner1, this._minSize, this._maxWidth, this._maxHeight);
		
		/* this is the room */
		var corner2 = corner1.clone().plus(dims);
		corner2.x -= 1;
		corner2.y -= 1;
		
		/* enlarge for fitting */
		var c1 = corner1.clone();
		c1.x--;
		c1.y--;
		var c2 = corner2.clone();
		c2.x++;
		c2.y++;
		
		/* is this one room okay? */
		var fits = this._freeSpace(c1, c2);
		
		if (fits) {
			/* dig the room */
			this._digRoom(corner1, corner2);
			this._digged += dims.x*dims.y;
			return true;
		}
		
	} while (count < this._roomAttempts);

	/* no room was generated in a given number of attempts */
	return false;
}

/**
 * Find two rooms that can be connected
 * @returns {false || int[]} [room1index, wall1, room2index, wall2] 
 */
RPG.Generators.Uniform.prototype._findRoomPair = function() {
	var freeIndexes = [];
	for (var i=0;i<this._usedWalls.length;i++) {
		var w = this._usedWalls[i];
		if (!w[this.NORTH] || !w[this.EAST] || !w[this.SOUTH] || !w[this.WEST]) { freeIndexes.push(i); }
	}
	
	/* we are unable to find 2 rooms */
	if (freeIndexes.length < 2) { return false; }
	
	while (1) {
		var room1i = freeIndexes.random();
		var room2i = room1i;
		while (room1i == room2i) { room2i = freeIndexes.random(); }
		
		var room1 = this._rooms[room1i];
		var room2 = this._rooms[room2i];
		var walls1 = this._usedWalls[room1i];
		var walls2 = this._usedWalls[room2i];
		var avail1 = [];
		var avail2 = [];
		
		/* find maximum horizontal/vertical distance */
		var width1 = Math.abs(room1[0].x - room2[1].x);
		var width2 = Math.abs(room1[1].x - room2[0].x);
		var height1 = Math.abs(room1[0].y - room2[1].y);
		var height2 = Math.abs(room1[1].y - room2[0].y);
		
		var w = Math.max(width1, width2);
		var h = Math.max(height1, height2);
		var total = Math.max(w, h);
		
		/* get list of available walls for both rooms */
		for (var i=0;i<4;i++) {
			switch (i) {
				case this.WEST:
					if (!walls1[i] && (total != w || room1[0].x > room2[0].x)) { avail1.push(i); }
					if (!walls2[i] && (total != w || room2[0].x > room1[0].x)) { avail2.push(i); }
				break;
				case this.EAST:
					if (!walls1[i] && (total != w || room1[1].x < room2[1].x)) { avail1.push(i); }
					if (!walls2[i] && (total != w || room2[1].x < room1[1].x)) { avail2.push(i); }
				break;
				case this.NORTH:
					if (!walls1[i] && (total != h || room1[0].y > room2[0].y)) { avail1.push(i); }
					if (!walls2[i] && (total != h || room2[0].y > room1[0].y)) { avail2.push(i); }
				break;
				case this.SOUTH:
					if (!walls1[i] && (total != h || room1[1].y < room2[1].y)) { avail1.push(i); }
					if (!walls2[i] && (total != h || room2[1].y < room1[1].y)) { avail2.push(i); }
				break;
			}
		}
		
		/* these two rooms have no suitable walls */
		if (!avail1.length || !avail2.length) { continue; }
		
		return [room1i, avail1.random(), room2i, avail2.random()];
	}
}

/**
 * Try connecting two rooms with given walls
 * @param {array} rooms [room1, wall1, room2, wall2]
 */
RPG.Generators.Uniform.prototype._tryCorridor = function(rooms) {
	var room1i = rooms[0];
	var wall1 = rooms[1];
	var room2i = rooms[2];
	var wall2 = rooms[3];
	var room1 = this._rooms[room1i];
	var room2 = this._rooms[room2i];
	
	return false;
}

/**
 * Are there no unconnected rooms remaining?
 */
RPG.Generators.Uniform.prototype._noFreeRooms = function() {
	return true;
	for (var i=0;i<this._usedWalls.length;i++) {
		var w = this._usedWalls[i];
		if (w[this.NORTH] + w[this.EAST] + w[this.SOUTH] + w[this.WEST] == 0) { return false; }
	}
	return true;
}


/**
 * @class Random dungeon generator using human-like digging patterns.
 * Heavily based on Mike Anderson's ideas from the "Tyrant" algo, mentioned at 
 * http://www.roguebasin.roguelikedevelopment.org/index.php?title=Dungeon-Building_Algorithm .
 * @augments RPG.Generators.BaseGenerator
 */
RPG.Generators.Digger = OZ.Class().extend(RPG.Generators.BaseGenerator);

RPG.Generators.Digger.prototype.init = function(size) {
	this.parent(size);
	this._features = {
		"room": 2,
		"corridor": 4
	}
	this._featureAttempts = 15; /* how many times do we try to create a feature on a suitable wall */
	this._maxLength = 10; /* max corridor length */
	this._minLength = 2; /* min corridor length */
	this._minSize = 3; /* min room size */
	this._maxWidth = 8; /* max room width */
	this._maxHeight = 5; /* max room height */
	this._diggedPercentage = 0.2; /* we stop after this percentage of level area has been dug out */
	
	this._freeWalls = []; /* these are available for digging */
	this._forcedWalls = []; /* these are forced for digging */
}

RPG.Generators.Digger.prototype.generate = function(id, danger) {
	this._freeWalls = []; /* these are available for digging */
	this._forcedWalls = []; /* these are forced for digging */

	this._blankMap();
	this._digged = 0;

	this._firstRoom();
	var area = (this._size.x-2) * (this._size.y-2);

	do {
		/* find a good wall */
		var wall = this._findWall();

		var featureResult = false;
		var featureCount = 0;
		do {
			/* Try adding afeature */
			featureResult = this._tryFeature(wall);
			featureCount++;
			
			/* Feature added, cool */
			if (featureResult) { break; }
			
		} while (featureCount < this._featureAttempts);
	} while (this._digged/area < this._diggedPercentage || this._forcedWalls.length)
	
	this._freeWalls = [];
	return this._dig(id, danger);
}

RPG.Generators.Digger.prototype._firstRoom = function() {
	var corner1 = this._generateCoords(this._minSize);
	var dims = this._generateSize(corner1, this._minSize, this._maxWidth, this._maxHeight);
	
	var corner2 = corner1.clone().plus(dims);
	corner2.x -= 1;
	corner2.y -= 1;
	
	this._digged += dims.x*dims.y;
	this._digRoom(corner1, corner2);
	this._addSurroundingWalls(corner1, corner2);
}

/**
 * This _always_ finds a suitable wall.
 * Suitable wall has 3 neighbor walls and 1 neighbor corridor.
 * @returns {RPG.Misc.Coords}
 */
RPG.Generators.Digger.prototype._findWall = function() {
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
RPG.Generators.Digger.prototype._tryFeature = function(wall) {
	var name = this._getFeature();
	var func = this["_feature" + name.charAt(0).toUpperCase() + name.substring(1)];
	if (!func) { alert("PANIC! Non-existant feature '"+name+"'."); }
	
	return func.call(this, wall);
}

/**
 * Get a random feature name
 */
RPG.Generators.Digger.prototype._getFeature = function() {
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
RPG.Generators.Digger.prototype._featureRoom = function(wall) {
	/* corridor vector */
	var direction = this._emptyDirection(wall);
	var normal = new RPG.Misc.Coords(direction.y, -direction.x);

	var diffX = this._maxWidth - this._minSize + 1;
	var diffY = this._maxHeight - this._minSize + 1;
	var width = Math.floor(Math.random() * diffX) + this._minSize;
	var height = Math.floor(Math.random() * diffY) + this._minSize;
	
	/* one corner of the room, unshifted */
	var corner1 = wall.clone().plus(direction);
	
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
	c1.x--;
	c1.y--;
	var c2 = corner2.clone();
	c2.x++;
	c2.y++;

	var ok = this._freeSpace(c1, c2);
	if (!ok) { return false; }
	
	/* dig the wall + room */
	this._digged += 1 + width*height;
	this._bitMap[wall.x][wall.y] = 0;
	this._digRoom(corner1, corner2);
	
	/* add to a list of free walls */
	this._addSurroundingWalls(corner1, corner2);
	
	/* remove 3 free walls from entrance */
	this._removeFreeWall(wall);
	var c = wall.clone().plus(normal);
	this._removeFreeWall(c);
	var c = wall.clone().minus(normal);
	this._removeFreeWall(c);

	return true;
}

/**
 * Corridor feature
 */
RPG.Generators.Digger.prototype._featureCorridor = function(wall) {
	/* corridor vector */
	var direction = this._emptyDirection(wall);
	var normal = new RPG.Misc.Coords(direction.y, -direction.x);
	
	/* wall length */
	var availSpace = 0;
	var c = wall.clone();
	while (this._isValid(c)) {
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
		end.plus(direction);
	}
	
	var left = Math.min(start.x + normal.x, start.x - normal.x, end.x + normal.x, end.x - normal.x);
	var right = Math.max(start.x + normal.x, start.x - normal.x, end.x + normal.x, end.x - normal.x);
	var top = Math.min(start.y + normal.y, start.y - normal.y, end.y + normal.y, end.y - normal.y);
	var bottom = Math.max(start.y + normal.y, start.y - normal.y, end.y + normal.y, end.y - normal.y);
	
	var corner1 = new RPG.Misc.Coords(left, top);
	var corner2 = new RPG.Misc.Coords(right, bottom);

	var ok = this._freeSpace(corner1, corner2);
	if (!ok) { return false; }
	
	/* if the last cell of wall is a corner of a corridor, cancel */
	for (var i=0;i<this._rooms.length;i++) {
		var room = this._rooms[i];
		var c1 = room.getCorner1();
		var c2 = room.getCorner2();
		if ((end.x == c1.x-1 || end.x == c2.x+1) && (end.y == c1.y-1 || end.y == c2.y+1)) { return false; }
	}
	
	/* dig the wall + corridor */
	this._digged += length;
	var c = start.clone();
	for (var i=0;i<length;i++) {
		this._bitMap[c.x][c.y] = 0;
		c.plus(direction);
	}
	
	/* add forced endings */
	this._forcedWalls = [];
	c = end.clone().plus(direction);
	this._addForcedWall(c);
	c = end.clone().plus(normal);
	this._addForcedWall(c);
	c = end.clone().minus(normal);
	this._addForcedWall(c);
	
	/* remove end cell from free walls */
	this._removeFreeWall(end);

	/* normalize start & end order */
	if (start.x > end.x || start.y > end.y) {
		var tmp = start;
		start = end;
		end = tmp;
	}
	/* sync list of free walls */
	this._addSurroundingWalls(start, end);
	
	/* remove walls that are not free anymore */
	c = wall;
	this._removeFreeWall(c);
	c = wall.clone().plus(normal);
	this._removeFreeWall(c);
	c = wall.clone().minus(normal);
	this._removeFreeWall(c);
	
	return true;
}

/**
 * Adds a new wall to list of available walls
 */
RPG.Generators.Digger.prototype._addFreeWall = function(coords) {
	/* remove if already exists */
	this._removeFreeWall(coords);
	
	/* is this one ok? */
	var ok = this._emptyDirection(coords);
	if (!ok) { return; }
	
	/* ok, so let's add it */
	this._freeWalls.push(coords.clone());
}

/**
 * Adds a new wall to list of forced walls
 */
RPG.Generators.Digger.prototype._addForcedWall = function(coords) {
	/* is this one ok? */
	var ok = this._emptyDirection(coords);
	if (!ok) { return; }
	
	/* ok, so let's add it */
	this._forcedWalls.push(coords.clone());
}

/**
 * Removes a wall from list of walls
 */
RPG.Generators.Digger.prototype._removeFreeWall = function(coords) {
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
RPG.Generators.Digger.prototype._emptyDirection = function(coords) {
	var c = new RPG.Misc.Coords();
	var empty = null;
	var deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
	
	for (var i=0;i<deltas.length;i++) {
		c.x = coords.x+deltas[i][0];
		c.y = coords.y+deltas[i][1];
		
		if (!this._isValid(c)) { return false; }
		
		if (!this._bitMap[c.x][c.y]) { 
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
RPG.Generators.Digger.prototype._addSurroundingWalls = function(corner1, corner2) {
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
				this._addFreeWall(c);
			}
		}
	}
}
