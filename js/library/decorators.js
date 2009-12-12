/**
 * @class Hidden walls decorator
 * @augments RPG.Decorators.BaseDecorator
 */
RPG.Decorators.Hidden = OZ.Class().extend(RPG.Decorators.BaseDecorator);
RPG.Decorators.Hidden.getInstance = RPG.Decorators.BaseDecorator.getInstance;
RPG.Decorators.Hidden.prototype.decorate = function(map, percentage) {
	var c = new RPG.Misc.Coords(0, 0);
	var size = map.getSize();
	for (var i=0;i<size.x;i++) {
		for (var j=0;j<size.y;j++) {
			c.x = i;
			c.y = j;
			var cell = map.at(c);
			if (!(cell instanceof RPG.Cells.Corridor)) { continue; }
			if (this._freeNeighbors(map, c) != 2) { continue; }
			if (Math.random() >= percentage) { continue; }
			
			var fake = new RPG.Cells.Wall.Fake(cell);
			map.setCell(c, fake);
		}
	}
	return this;
}

/**
 * @class Beings decorator
 * @augments RPG.Decorators.BaseDecorator
 */
RPG.Decorators.Beings = OZ.Class().extend(RPG.Decorators.BaseDecorator);
RPG.Decorators.Beings.getInstance = RPG.Decorators.BaseDecorator.getInstance;
RPG.Decorators.Beings.prototype.decorate = function(map, count) {
	var danger = map.getDanger();
	for (var i=0;i<count;i++) {
		var b = RPG.Beings.NPC.getInstance(danger);
		var c = map.getFreeCell(true);
		if (!c) { return this; }
		c.setBeing(b);
	}
	return this;
}

/**
 * @class Items decorator
 * @augments RPG.Decorators.BaseDecorator
 */
RPG.Decorators.Items = OZ.Class().extend(RPG.Decorators.BaseDecorator);
RPG.Decorators.Items.getInstance = RPG.Decorators.BaseDecorator.getInstance;
RPG.Decorators.Items.prototype.decorate = function(map, count) {
	var danger = map.getDanger();
	for (var i=0;i<count;i++) {
		var item = RPG.Items.getInstance(danger);
		var c = map.getFreeCell(true);
		c.addItem(item);
	}
	return this;
}

/**
 * @class Traps decorator
 * @augments RPG.Decorators.BaseDecorator
 */
RPG.Decorators.Traps = OZ.Class().extend(RPG.Decorators.BaseDecorator);
RPG.Decorators.Traps.getInstance = RPG.Decorators.BaseDecorator.getInstance;
RPG.Decorators.Traps.prototype.addTraps = function(map, count) {
	var danger = map.getDanger();
	for (var i=0;i<count;i++) {
		var trap = RPG.Features.Trap.getInstance(danger);
		var c = map.getFreeCell(true);
		c.setFeature(trap);
	}
	return this;
}

/**
 * @class Map decorator
 * @augments RPG.Decorators.BaseDecorator
 */
RPG.Decorators.Doors = OZ.Class().extend(RPG.Decorators.BaseDecorator);
RPG.Decorators.Doors.getInstance = RPG.Decorators.BaseDecorator.getInstance;
RPG.Decorators.Doors.prototype.decorate = function(map, room, options) {
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
			var cell = map.at(c);
			if (!cell) { continue; }
			
			var feature = cell.getFeature()
			if (cell instanceof RPG.Cells.Wall) {
				/* try fake corridor, if applicable */
				if (Math.random() >= o.fakeCorridors) { continue; } /* bad luck */
				var nc = this._freeNeighbors(map, c);
				if (nc != 4) { continue; } /* bad neighbor count */
				
				var after = c.clone().plus(dir);
				if (!map.isValid(after) || !(map.at(after) instanceof RPG.Cells.Corridor)) { continue; } /* bad layout */
				
				/* fake corridor */
				var fake = new RPG.Cells.Wall.Fake(new o.corridor());
				map.setCell(c, fake);
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
				map.setCell(c, fake);
			} /* if fake */

		} /* for y */
	} /* for x */
	return this;
}

/**
 * @class Treasure decorator
 * @augments RPG.Decorators.BaseDecorator
 */
RPG.Decorators.Treasure = OZ.Class().extend(RPG.Decorators.BaseDecorator);
RPG.Decorators.Treasure.getInstance = RPG.Decorators.BaseDecorator.getInstance;
RPG.Decorators.Treasure.prototype.decorate = function(map, room, options) {
	var o = {
		treasure: 0
	}
	var danger = map.getDanger();
	for (var p in options) { o[p] = options[p]; }
	
	var c1 = room.getCorner1();
	var c2 = room.getCorner2();
	for (var i=c1.x;i<=c2.x;i++) {
		for (var j=c1.y;j<=c2.y;j++) {
			var cell = map.at(new RPG.Misc.Coords(i, j));
			
			if (Math.random() < o.treasure) {
				var treasure = this._generateTreasure(danger);
				cell.addItem(treasure);
				continue;
			}
			
		}
	}
	return this;
}
RPG.Decorators.Treasure.prototype._generateTreasure = function(danger) {
	if (Math.randomPercentage() < 67) {
		return RPG.Items.Gold.factory.method(danger);
	} else {
		return RPG.Items.Gem.getInstance(danger);
	}
}

