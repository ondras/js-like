/**
 * @class Map decorator
 */
RPG.Dungeon.Decorator = OZ.Class();

RPG.Dungeon.Decorator.prototype.init = function() {
	this._map = null;
	this._size = null;
}

RPG.Dungeon.Decorator.prototype.setMap = function(map) {
	this._map = map;
	this._size = map.getSize();
	return this;
}

RPG.Dungeon.Decorator.prototype.addHiddenCorridors = function(percentage) {
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=0;i<this._size.x;i++) {
		for (var j=0;j<this._size.y;j++) {
			c.x = i;
			c.y = j;
			var cell = this._map.at(c);
			if (!(cell instanceof RPG.Cells.Corridor)) { continue; }
			if (this._freeNeighbors(c) != 2) { continue; }
			if (Math.random() >= percentage) { continue; }
			
			var fake = new RPG.Cells.Wall.Fake(cell);
			this._map.setCell(c, fake);
		}
	}
	return this;
}

RPG.Dungeon.Decorator.prototype.addRoomDoors = function(room, options) {
	var o = {
		corridor: RPG.Cells.Corridor,
		doors: true,
		closed: 0.5,
		locked: 0.05,
		fakeDoors: 0.1,
		fakeCorridors: 1
	}
	for (var p in options) { o[p] = options[p]; }
	
	var corner1 = room.getCorner1();
	var corner2 = room.getCorner2();
	var left = corner1.x-1;
	var right = corner2.x+1;
	var top = corner1.y-1;
	var bottom = corner2.y+1;
	
	var north = new RPG.Misc.Coords(0, -1);
	var south = new RPG.Misc.Coords(0, 1);
	var east = new RPG.Misc.Coords(1, 0);
	var west = new RPG.Misc.Coords(-1, 0);

	var c = new RPG.Misc.Coords(0, 0);
	var dir = false;
	for (var i=left;i<=right;i++) {
		for (var j=top;j<=bottom;j++) {
			/* no corners */
			if (i == left && (j == top || j == bottom)) { continue; }
			if (i == right && (j == top || j == bottom)) { continue; }

			dir = false;
			if (i == left) { dir = west; }
			if (i == right) { dir = east; }
			if (j == top) { dir = north; }
			if (j == bottom) { dir = south; }
			/* no interior cells */
			if (!dir) { continue; }
			
			c.x = i;
			c.y = j;
			var cell = this._map.at(c);
			if (!cell) { continue; }
			
			var feature = cell.getFeature()
			if (cell instanceof RPG.Cells.Wall) {
				/* try fake corridor, if applicable */
				if (Math.random() >= o.fakeCorridors) { continue; } /* bad luck */
				var nc = this._freeNeighbors(c);
				if (nc != 4) { continue; } /* bad neighbor count */
				
				var after = c.clone().plus(dir);
				if (!this._map.isValid(after) || !(this._map.at(after) instanceof RPG.Cells.Corridor)) { continue; } /* bad layout */
				
				/* fake corridor */
				var fake = new RPG.Cells.Wall.Fake(new o.corridor());
				this._map.setCell(c, fake);
				continue;
			}
			
			if (!feature && o.doors) {
				/* add door */
				feature = new RPG.Features.Door();
				cell.setFeature(feature);
			}
			
			if (!(feature instanceof RPG.Features.Door)) { continue; } /* not a door */
			if (Math.random() < o.closed) { feature.close(); } /* close door */
			if (Math.random() < o.locked) { feature.lock(); } /* lock door */

			/* fake wall */
			if (Math.random() < o.fakeDoors) {
				var fake = new RPG.Cells.Wall.Fake(cell);
				this._map.setCell(c, fake);
			} /* if fake */

		} /* for y */
	} /* for x */
	return this;
}

/* FIXME refactor */
RPG.Dungeon.Decorator.prototype.decorateRoomInterior = function(room, options) {
	var o = {
		treasure: 0,
		monster: 0
	}
	for (var p in options) { o[p] = options[p]; }
	
	var c1 = room.getCorner1();
	var c2 = room.getCorner2();
	for (var i=c1.x;i<=c2.x;i++) {
		for (var j=c1.y;j<=c2.y;j++) {
			var cell = this._map.at(new RPG.Misc.Coords(i, j));
			
			if (Math.random() < o.treasure) {
				var treasure = this._generateTreasure();
				cell.addItem(treasure);
				continue;
			}
			
		}
	}
}

RPG.Dungeon.Decorator.prototype.addBeings = function(count) {
	for (var i=0;i<count;i++) {
		var b = RPG.Beings.NPC.getInstance();
		var c = this._map.getFreeCoords(true);
		this._map.at(c).setBeing(b);
	}
}

RPG.Dungeon.Decorator.prototype.addItems = function(count) {
	for (var i=0;i<count;i++) {
		var item = RPG.Items.getInstance();
		var c = this._map.getFreeCoords(true);
		this._map.at(c).addItem(item);
	}
}

RPG.Dungeon.Decorator.prototype.addTraps = function(count) {
	for (var i=0;i<count;i++) {
		var trap = RPG.Features.Trap.getInstance();
		var c = this._map.getFreeCoords(true);
		this._map.at(c).setFeature(trap);
	}
}

RPG.Dungeon.Decorator.prototype._generateTreasure = function() {
	if (Math.randomPercentage() < 67) {
		return new RPG.Items.Gold();
	} else {
		return RPG.Items.Gem.getInstance();
	}
}

/**
 * Return number of free neighbors
 */
RPG.Dungeon.Decorator.prototype._freeNeighbors = function(center) {
	var result = 0;
	var cells = this._map.cellsInCircle(center, 1, false);
	for (var i=0;i<cells.length;i++) {
		if (cells[i] instanceof RPG.Cells.Corridor) { result++; }
	}
	return result;
}
