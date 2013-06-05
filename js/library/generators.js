/**
 * @class Arena map generator
 * @augments RPG.Generators.BaseGenerator
 */
RPG.Generators.Arena = OZ.Singleton().extend(RPG.Generators.BaseGenerator);

RPG.Generators.Arena.prototype.generate = function(id, size, danger, options) {
	this.parent(id, size, danger, options);
	
	var c1 = new RPG.Coords(1, 1);
	var c2 = new RPG.Coords(this._size.x-2, this._size.y-2);
	this._digRoom(c1, c2);

	return this._convertToMap(id, danger);
}

/**
 * @class Random map generator, tries to fill the space evenly. Generates independent rooms and tries to connect them.
 * @augments RPG.Generators.BaseGenerator
 */ 
RPG.Generators.Uniform = OZ.Singleton().extend(RPG.Generators.BaseGenerator);

RPG.Generators.Uniform.prototype.init = function() {
	this.parent();
	
	this._roomAttempts = 10; /* new room is created N-times until is considered as impossible to generate */
	this._corridorAttempts = 50; /* corridors are tried N-times until the level is considered as impossible to connect */
	this._roomPercentage = 0.1; /* we stop createing rooms after this percentage of level area has been dug out */
	this._minSize = 3; /* minimum room dimension */
	this._maxWidth = 9; /* maximum room width */
	this._maxHeight = 5; /* maximum room height */
	
	this._connected = []; /* list of already connected rooms */
	this._unconnected = []; /* list of remaining unconnected rooms */
}

RPG.Generators.Uniform.prototype.generate = function(id, size, danger, options) {
	this.parent(id, size, danger, options);

	while (1) {
		this._blankMap();
		this._unconnected = [];
		this._generateRooms();
		var result = this._generateCorridors();
		if (result) { return this._convertToMap(id, danger); }
	}
}

RPG.Generators.Uniform.prototype._digRoom = function(c1, c2) {
	var room = this.parent(c1, c2);
	this._unconnected.push(room);
}

/**
 * Generates a suitable amount of rooms
 */
RPG.Generators.Uniform.prototype._generateRooms = function() {
	var w = this._size.x-2;
	var h = this._size.y-2;

	do {
		var result = this._generateRoom();
		if (this._dug/(w*h) > this._roomPercentage) { break; } /* achieved requested amount of free space */
	} while (result);
	
	/* either enough rooms, or not able to generate more of them :) */
}

/**
 * Try to generate one room
 */
RPG.Generators.Uniform.prototype._generateRoom = function() {
	var count = 0;
	while (count < this._roomAttempts) {
		count++;
		
		/* generate corner */
		var corner1 = this._generateCoords(this._minSize);
		
		/* generate second corner */
		var corner2 = this._generateSecondCorner(corner1, this._minSize, this._maxWidth, this._maxHeight);
		
		/* enlarge for fitting */
		corner1.x--;
		corner1.y--;
		corner2.x++;
		corner2.y++;
		
		/* if not good, skip to next attempt */
		if (!this._freeSpace(corner1, corner2)) { continue; }
		
		/* shrink */
		corner1.x++;
		corner1.y++;
		corner2.x--;
		corner2.y--;
		this._digRoom(corner1, corner2);
		return true;
	} 

	/* no room was generated in a given number of attempts */
	return false;
}

/**
 * Generates connectors beween rooms
 * @returns {bool} success Was this attempt successfull?
 */
RPG.Generators.Uniform.prototype._generateCorridors = function() {
	var cnt = 0;
	this._connected = [];
	if (this._unconnected.length) { this._connected.push(this._unconnected.pop()); }
		
	while (this._unconnected.length) {
		cnt++;
		if (cnt > this._corridorAttempts) { return false; } /* no success */
		
		var room1 = this._unconnected[0]; /* start with the first unconnected */
		var center = room1.getCenter();
		this._connected.sort(function(a,b){ /* find closest connected */
			return a.getCenter().distance(center) - b.getCenter().distance(center);
		});
		var room2 = this._connected[0];

		this._connectRooms(room1, room2); /* connect these two */
	};
	
	return true;
}

RPG.Generators.Uniform.prototype._connectRooms = function(room1, room2) {
	var center1 = room1.getCenter();
	var center2 = room2.getCenter();

	var diffX = center2.x - center1.x;
	var diffY = center2.y - center1.y;
	var prop = "";

	if (Math.abs(diffX) < Math.abs(diffY)) { /* first try connecting north-south walls */
		var wall1 = (diffY > 0 ? RPG.S : RPG.N);
		var wall2 = (wall1 + 4) % 8;
		prop = "x";
	} else { /* first try connecting east-west walls */
		var wall1 = (diffX > 0 ? RPG.E : RPG.W);
		var wall2 = (wall1 + 4) % 8;
		prop = "y";
	}

	var minorProp = (prop == "x" ? "y" : "x");
	var min = room2.getCorner1()[prop];
	var max = room2.getCorner2()[prop];	
	var start = this._placeInWall(room1, wall1); /* corridor will start here */
	if (!start) { return; }

	if (start[prop] >= min && start[prop] <= max) { /* possible to connect with straight line */

		var corner = (wall2 == RPG.N || wall2 == RPG.W ? room2.getCorner1() : room2.getCorner2());
		var x = (prop == "x" ? start[prop] : corner.x);
		var y = (prop == "y" ? start[prop] : corner.y);
		var end = new RPG.Coords(x, y);
		return this._digLine([start, end]);
		
	} else if (start[prop] < min-1 || start[prop] > max+1) { /* need to switch target wall (L-like) */
		
		var diff = start[prop] - center2[prop];
		switch (wall2) {
			case RPG.N:
			case RPG.E:	var rotation = (diff < 0 ? 6 : 2); break;
			break;
			case RPG.S:
			case RPG.W:	var rotation = (diff < 0 ? 2 : 6); break;
			break;
		}
		wall2 = (wall2 + rotation) % 8;
		
		var end = this._placeInWall(room2, wall2);
		if (!end) { return; }
		var mid = new RPG.Coords(0, 0);
		mid[prop] = start[prop];
		mid[minorProp] = end[minorProp];
		return this._digLine([start, mid, end]);
		
	} else { /* use current wall pair, but adjust the line in the middle (snake-like) */
	
		var end = this._placeInWall(room2, wall2);
		if (!end) { return; }
		var mid = Math.round((end[minorProp] + start[minorProp])/2);

		var mid1 = new RPG.Coords(0, 0);
		var mid2 = new RPG.Coords(0, 0);
		mid1[prop] = start[prop];
		mid1[minorProp] = mid;
		mid2[prop] = end[prop];
		mid2[minorProp] = mid;
		return this._digLine([start, mid1, mid2, end]);

	}
}

RPG.Generators.Uniform.prototype._placeInWall = function(room, wall) {
	var prop = "";
	var c1 = room.getCorner1();
	var c2 = room.getCorner2();
	var x = 0;
	var y = 0;
	switch (wall) {
		case RPG.N:
			y = c1.y-1;
			x = c1.x + Math.floor(Math.random() * (c2.x-c1.x));
			prop = "x";
		break;
		case RPG.S:
			y = c2.y+1;
			x = c1.x + Math.floor(Math.random() * (c2.x-c1.x));
			prop = "x";
		break;
		case RPG.W:
			x = c1.x-1;
			y = c1.y + Math.floor(Math.random() * (c2.y-c1.y));
			prop = "y";
		break;
		case RPG.E:
			x = c2.x+1;
			y = c1.y + Math.floor(Math.random() * (c2.y-c1.y));
			prop = "y";
		break;
	}
	
	var result = new RPG.Coords(x, y);
	/* check if neighbors are not empty */
	result[prop] -= 1;
	if (this._isValid(result) && !this._boolArray[result.x][result.y]) { return null; }
	result[prop] += 2;
	if (this._isValid(result) && !this._boolArray[result.x][result.y]) { return null; }
	result[prop] -= 1;

	return result; 
	
}

/**
 * Try to dig a polyline. Stop if it crosses any room more than two times.
 */
RPG.Generators.Uniform.prototype._digLine = function(points) {
	var todo = [];
	var rooms = []; /* rooms crossed with this line */
	
	var check = function(coords) {
		todo.push(coords.clone());
		rooms = rooms.concat(this._roomsWithWall(coords));
	}
	
	/* compute and check all coords on this polyline */
	var current = points.shift();
	while (points.length) {
		var target = points.shift();
		var diffX = target.x - current.x;
		var diffY = target.y - current.y;
		var length = Math.max(Math.abs(diffX), Math.abs(diffY));
		var stepX = Math.round(diffX / length);
		var stepY = Math.round(diffY / length);
		for (var i=0;i<length;i++) {
			check.call(this, current);
			current.x += stepX;
			current.y += stepY;
		}
	}
	check.call(this, current);
	
	/* any room violated? */
	var connected = [];
	while (rooms.length) {
		var room = rooms.pop();
		connected.push(room);
		var count = 1;
		for (var i=rooms.length-1; i>=0; i--) {
			if (rooms[i] == room) {
				rooms.splice(i, 1);
				count++;
			}
		}
		if (count > 2) { return; } /* room crossed too many times */
	}
	
	/* mark encountered rooms as connected */
	while (connected.length) {
		var room = connected.pop();
		var index = this._unconnected.indexOf(room);
		if (index != -1) { 
			this._unconnected.splice(index, 1);
			this._connected.push(room);
		}
	}
	
	while (todo.length) { /* do actual digging */
		var coords = todo.pop();
		this._boolArray[coords.x][coords.y] = false;
	}
}

/**
 * Returns a list of rooms which have this wall
 */
RPG.Generators.Uniform.prototype._roomsWithWall = function(coords) {
	var result = [];
	for (var i=0;i<this._rooms.length;i++) {
		var room = this._rooms[i];
		var ok = false;
		var c1 = room.getCorner1();
		var c2 = room.getCorner2();
		
		if ( /* one of vertical walls */
			(coords.x+1 == c1.x || coords.x-1 == c2.x) 
			&& coords.y+1 >= c1.y 
			&& coords.y-1 <= c2.y
		) { ok = true; }
		
		if ( /* one of horizontal walls */
			(coords.y+1 == c1.y || coords.y-1 == c2.y) 
			&& coords.x+1 >= c1.x 
			&& coords.x-1 <= c2.x
		) { ok = true; }

		if (ok) { result.push(room); }		
	}
	return result;
}

/**
 * @class Random dungeon generator using human-like digging patterns.
 * Heavily based on Mike Anderson's ideas from the "Tyrant" algo, mentioned at 
 * http://www.roguebasin.roguelikedevelopment.org/index.php?title=Dungeon-Building_Algorithm .
 * @augments RPG.Generators.BaseGenerator
 */
RPG.Generators.Digger = OZ.Singleton().extend(RPG.Generators.BaseGenerator);

RPG.Generators.Digger.prototype.init = function() {
	this.parent();
	this._features = {
		room: 2,
		corridor: 4
	}
	this._featureAttempts = 15; /* how many times do we try to create a feature on a suitable wall */
	this._maxLength = 10; /* max corridor length */
	this._minLength = 2; /* min corridor length */
	this._minSize = 3; /* min room size */
	this._maxWidth = 9; /* max room width */
	this._maxHeight = 5; /* max room height */
	this._dugPercentage = 0.2; /* we stop after this percentage of level area has been dug out */
	
	this._freeWalls = []; /* these are available for digging */
	this._forcedWalls = []; /* these are forced for digging */
}

RPG.Generators.Digger.prototype.generate = function(id, size, danger, options) {
	this.parent(id, size, danger, options);

	this._freeWalls = []; /* these are available for digging */
	this._forcedWalls = []; /* these are forced for digging */

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
	} while (this._dug/area < this._dugPercentage || this._forcedWalls.length)
	
	this._freeWalls = [];
	return this._convertToMap(id, danger);
}

RPG.Generators.Digger.prototype._firstRoom = function() {
	var corner1 = this._generateCoords(this._minSize);
	var corner2 = this._generateSecondCorner(corner1, this._minSize, this._maxWidth, this._maxHeight);
	
	this._digRoom(corner1, corner2);
	this._addSurroundingWalls(corner1, corner2);
}

/**
 * This _always_ finds a suitable wall.
 * Suitable wall has 3 neighbor walls and 1 neighbor corridor.
 * @returns {RPG.Coords}
 */
RPG.Generators.Digger.prototype._findWall = function() {
	if (this._forcedWalls.length) {
		var index = Math.floor(Math.random()*this._forcedWalls.length);
		var wall = this._forcedWalls[index];
		this._forcedWalls.splice(index, 1);
		return wall;
	} else {
		if (!this._freeWalls.length) { throw new Error("PANIC! No suitable wall found."); }
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
	if (!func) { throw new Error("PANIC! Non-existant feature '"+name+"'."); }
	
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
 * Room feature
 */
RPG.Generators.Digger.prototype._featureRoom = function(wall) {
	/* corridor vector */
	var direction = this._emptyDirection(wall);
	var normal = new RPG.Coords(direction.y, -direction.x);

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
	this._dug += 1;
	this._boolArray[wall.x][wall.y] = false;
	this._digRoom(corner1, corner2);
	
	if (Math.random() > 0.7) {
		/* remove corners */
		this._boolArray[corner1.x][corner1.y] = true;
		this._boolArray[corner1.x][corner2.y] = true;
		this._boolArray[corner2.x][corner1.y] = true;
		this._boolArray[corner2.x][corner2.y] = true;
		this._dug -= 4;
	}
	
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
	var normal = new RPG.Coords(direction.y, -direction.x);
	
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
	
	var corner1 = new RPG.Coords(left, top);
	var corner2 = new RPG.Coords(right, bottom);

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
	this._dug += length;
	var c = start.clone();
	for (var i=0;i<length;i++) {
		this._boolArray[c.x][c.y] = false;
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
	var c = new RPG.Coords();
	var empty = null;
	var deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
	
	for (var i=0;i<deltas.length;i++) {
		c.x = coords.x+deltas[i][0];
		c.y = coords.y+deltas[i][1];
		
		if (!this._isValid(c)) { return false; }
		
		if (!this._boolArray[c.x][c.y]) { 
			/* there already is another empty neighbor! */
			if (empty) { return false; }

			empty = c.clone();
		}
	}
	
	/* no empty neighbor */
	if (!empty) { return false; }
	
	return new RPG.Coords(coords.x - empty.x, coords.y - empty.y);
}

/**
 * For a given rectangular area, adds all relevant surrounding walls to list of free walls
 */
RPG.Generators.Digger.prototype._addSurroundingWalls = function(corner1, corner2) {
	var c = new RPG.Coords(0, 0);
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

/**
 * @class Divided maze generator
 * @augments RPG.Generators.BaseGenerator
 */
RPG.Generators.DividedMaze = OZ.Singleton().extend(RPG.Generators.BaseGenerator);

RPG.Generators.DividedMaze.prototype.init = function() {
	this.parent();
	this._stack = [];
}

RPG.Generators.DividedMaze.prototype.generate = function(id, size, danger, options) {
	this.parent(id, size, danger, options);

	var w = this._size.x;
	var h = this._size.y;
	
	for (var i=0;i<w;i++) {
		for (var j=0;j<h;j++) {
			if (i == 0 || j == 0 || i+1 == w || j+1 == h) { continue; }
			this._boolArray[i][j] = false;
		}
	}
	
	this._stack = [
		[1, 1, w-2, h-2]
	];
	this._process();

	return this._convertToMap(id, danger);
}

RPG.Generators.DividedMaze.prototype._process = function() {
	while (this._stack.length) {
		var room = this._stack.shift(); /* [left, top, right, bottom] */
		this._partitionRoom(room);
	}
}

RPG.Generators.DividedMaze.prototype._partitionRoom = function(room) {
	var availX = [];
	var availY = [];
	
	for (var i=room[0]+1;i<room[2];i++) {
		var top = this._boolArray[i][room[1]-1];
		var bottom = this._boolArray[i][room[3]+1];
		if (top && bottom && !(i % 2)) { availX.push(i); }
	}
	
	for (var j=room[1]+1;j<room[3];j++) {
		var left = this._boolArray[room[0]-1][j];
		var right = this._boolArray[room[2]+1][j];
		if (left && right && !(j % 2)) { availY.push(j); }
	}

	if (!availX.length || !availY.length) { return; }

	var x = availX.random();
	var y = availY.random();
	
	this._boolArray[x][y] = true;
	
	var walls = [];
	
	var w = []; walls.push(w); /* left part */
	for (var i=room[0]; i<x; i++) { 
		this._boolArray[i][y] = true;
		w.push([i, y]); 
	}
	
	var w = []; walls.push(w); /* right part */
	for (var i=x+1; i<=room[2]; i++) { 
		this._boolArray[i][y] = true;
		w.push([i, y]); 
	}

	var w = []; walls.push(w); /* top part */
	for (var j=room[1]; j<y; j++) { 
		this._boolArray[x][j] = true;
		w.push([x, j]); 
	}
	
	var w = []; walls.push(w); /* bottom part */
	for (var j=y+1; j<=room[3]; j++) { 
		this._boolArray[x][j] = true;
		w.push([x, j]); 
	}
		
	var solid = walls.random();
	for (var i=0;i<walls.length;i++) {
		var w = walls[i];
		if (w == solid) { continue; }
		
		var hole = w.random();
		this._boolArray[hole[0]][hole[1]] = false;
	}

	this._stack.push([room[0], room[1], x-1, y-1]); /* left top */
	this._stack.push([x+1, room[1], room[2], y-1]); /* right top */
	this._stack.push([room[0], y+1, x-1, room[3]]); /* left bottom */
	this._stack.push([x+1, y+1, room[2], room[3]]); /* right bottom */
}

/**
 * @class Maze generator - Eller's algorithm
 * See http://homepages.cwi.nl/~tromp/maze.html for explanation
 * @augments RPG.Generators.BaseGenerator
 */
RPG.Generators.Maze = OZ.Singleton().extend(RPG.Generators.BaseGenerator);

RPG.Generators.Maze.prototype.init = function() {
	this.parent();
	this._width = null;
}

RPG.Generators.Maze.prototype.generate = function(id, size, danger, options) {
	this.parent(id, size, danger, options);
	this._width = Math.ceil((this._size.x-2)/2);
	
	var w = this._size.x-2;
	var h = this._size.y-2;
	var rand = /* w/(w+h); */ 9/24;
	
	var L = [];
	var R = [];
	
	for (var i=0;i<this._width;i++) {
		L.push(i);
		R.push(i);
	}
	L.push(this._width-1); /* fake stop-block at the right side */

	for (var j=1;j+3<this._size.y;j+=2) {
		/* one row */
		for (var i=0;i<this._width;i++) {
			/* cell coords (will be always empty) */
			var x = 2*i+1;
			var y = j;
			this._boolArray[x][y] = false;
			
			/* right connection */
			if (i != L[i+1] && Math.random() > rand) {
				this._addToList(i, L, R);
				this._boolArray[x+1][y] = false;
			}
			
			/* bottom connection */
			if (i != L[i] && Math.random() > rand) {
				/* remove connection */
				this._removeFromList(i, L, R);
			} else {
				/* create connection */
				this._boolArray[x][y+1] = false;
			}
		}
	}

	/* last row */
	for (var i=0;i<this._width;i++) {
		/* cell coords (will be always empty) */
		var x = 2*i+1;
		var y = j;
		this._boolArray[x][y] = false;
		
		/* right connection */
		if (i != L[i+1] && (i == L[i] || Math.random() > rand)) {
			/* dig right also if the cell is separated, so it gets connected to the rest of maze */
			this._addToList(i, L, R);
			this._boolArray[x+1][y] = false;
		}
		
		this._removeFromList(i, L, R);
	}
	
	return this._convertToMap(id, danger);
}

/**
 * Remove "i" from its list
 */
RPG.Generators.Maze.prototype._removeFromList = function(i, L, R) {
	R[L[i]] = R[i];
	L[R[i]] = L[i];
	R[i] = i;
	L[i] = i;
}

/**
 * Join lists with "i" and "i+1"
 */
RPG.Generators.Maze.prototype._addToList = function(i, L, R) {
	R[L[i+1]] = R[i];
	L[R[i]] = L[i+1];
	R[i] = i+1;
	L[i+1] = i;
}

/**
 * @class Maze generator - Icey's algorithm
 * See http://www.roguebasin.roguelikedevelopment.org/index.php?title=Simple_maze for explanation
 * @augments RPG.Generators.BaseGenerator
 */
RPG.Generators.IceyMaze = OZ.Singleton().extend(RPG.Generators.BaseGenerator);

RPG.Generators.IceyMaze.prototype.init = function() {
	this.parent();
	this._defOptions.regularity = 10;
}

RPG.Generators.IceyMaze.prototype.generate = function(id, size, danger, options) {
	this.parent(id, size, danger, options);
	
	var width = this._size.x;
	var height = this._size.y;
	if (width % 2) { width--; } 
	if (height % 2) { height--; }
	
	var cx = 0;
	var cy = 0;
	var nx = 0;
	var ny = 0;

	var done = 0;
	var blocked = false;
	var dirs = [
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0]
	];
	do {
		cx = 1 + 2*Math.floor(Math.random()*(width-1) / 2)
		cy = 1 + 2*Math.floor(Math.random()*(height-1) / 2)

		if (!done) { this._boolArray[cx][cy] = 0; }
		if (!this._boolArray[cx][cy]) {
			this._randomize(dirs);
			do {
				if (Math.round(Math.random() * this._options.regularity) == false) { this._randomize(dirs); }
				blocked = true;
				for (var i=0;i<4;i++) {
					nx = cx + dirs[i][0]*2;
					ny = cy + dirs[i][1]*2;
					if (this._isFree(nx, ny, width, height)) {
						this._boolArray[nx][ny] = false;
						this._boolArray[cx + dirs[i][0]][cy + dirs[i][1]] = false;
						cx = nx;
						cy = ny;
						blocked = false;
						done++;
						break;
					}
				}
			} while (!blocked);
		}
	} while (done+1 < (width)*(height)/4);
	
	return this._convertToMap(id, danger);
}

RPG.Generators.IceyMaze.prototype._randomize = function(dirs) {
	for (var i=0;i<4;i++) {
		dirs[i][0] = 0;
		dirs[i][1] = 0;
	}
	
	switch (Math.floor(Math.random()*4)) {
		case 0:
			dirs[0][0] = -1; dirs[1][0] = 1;
			dirs[2][1] = -1; dirs[3][1] = 1;
		break;
		case 1:
			dirs[3][0] = -1; dirs[2][0] = 1;
			dirs[1][1] = -1; dirs[0][1] = 1;
		break;
		case 2:
			dirs[2][0] = -1; dirs[3][0] = 1;
			dirs[0][1] = -1; dirs[1][1] = 1;
		break;
		case 3:
			dirs[1][0] = -1; dirs[0][0] = 1;
			dirs[3][1] = -1; dirs[2][1] = 1;
		break;
	}
}

RPG.Generators.IceyMaze.prototype._isFree = function(x, y, width, height) {
	if (x < 1 || y < 1 || x >= width || y >= height) { return false; }
	return this._boolArray[x][y];
}
