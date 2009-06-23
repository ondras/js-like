/**
 * @class Map generator
 */
RPG.Engine.MapGen = OZ.Class();

RPG.Engine.MapGen.prototype.init = function(size, wall, floor) {
	this._size = size;
	this._wall = RPG.Cells.Wall;
	this._corridor = RPG.Cells.Corridor;
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

/**
 * @class Arena map generator
 */
RPG.Engine.MapGen.Arena = OZ.Class().extend(RPG.Engine.MapGen);

RPG.Engine.MapGen.Arena.prototype.generate = function() {
	var map = this._blankMap();
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=1;i<this._size.x-1;i++) {
		for (var j=1;j<this._size.y-1;j++) {
			c.x = i;
			c.y = j;
			map.setCell(c, new this._corridor());
		}
	}
	return map;
}

/**
 * @class Random map generator
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
	
	while (1) {
		var room = this._generateRoom(map, rooms);
		
		if (room) { 
			/* dig the room */
			var corner1 = room[0];
			var corner2 = room[1];
			var c = new RPG.Misc.Coords(0, 0);
			for (var i=corner1.x;i<=corner2.x;i++) {
				for (var j=corner1.y;j<=corner2.y;j++) {
					c.x = i;
					c.y = j;
					map.setCell(c, new this._corridor());
					digged++;
				}
			}
			
			rooms.push(room);
			
			var w = this._size.x-2;
			var h = this._size.y-2;
			if (digged/(w*h) > this._roomPercentage) { break; }
		} else { 
			break; 
		}
		
	}
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
	while (1) {
		count++;
		
		/* generate corner */
		var corner1 = this._generateCoords();
		
		/* and room size */
		var dims = this._generateSize(corner1);
		
		/* this is the room */
		var corner2 = corner1.clone();
		corner2.x += dims.x-1;
		corner2.y += dims.y-1;
		
		var room = [corner1, corner2];
		
		/* test for possible conflicts with other rooms */
		if (!this._intersects(rooms, room)) { return room; }
		
		/* no room was generated in a given number of attempts */
		if (count == this._roomAttempts) { return false; }
	}
}

RPG.Engine.MapGen.Random.prototype._generateCoords = function() {
	var padding = 2 + this._minSize - 1;
	var x = Math.floor(Math.random()*(this._size.x-padding)) + 1;
	var y = Math.floor(Math.random()*(this._size.y-padding)) + 1;
	return new RPG.Misc.Coords(x, y);
}

RPG.Engine.MapGen.Random.prototype._generateSize = function(corner) {
	var availX = this._size.x - corner.x - this._minSize;
	var availY = this._size.y - corner.y - this._minSize;
	
	availX = Math.min(availX, this._maxWidth - this._minSize + 1);
	availY = Math.min(availY, this._maxHeight - this._minSize + 1);
	
	var x = Math.floor(Math.random()*availX) + this._minSize;
	var y = Math.floor(Math.random()*availY) + this._minSize;
	return new RPG.Misc.Coords(x, y);
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
