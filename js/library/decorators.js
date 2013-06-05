/**
 * @class Hidden walls decorator
 * @augments RPG.Decorators.BaseDecorator
 */
RPG.Decorators.Hidden = OZ.Singleton().extend(RPG.Decorators.BaseDecorator);
RPG.Decorators.Hidden.prototype.decorate = function(map, percentage) {
	var c = new RPG.Coords(0, 0);
	var size = map.getSize();
	for (var i=0;i<size.x;i++) {
		for (var j=0;j<size.y;j++) {
			c.x = i;
			c.y = j;
			var cell = map.getCell(c);
			if (!cell) { continue; }
			
			if (!cell.blocks(RPG.BLOCKS_LIGHT)) { continue; }
			if (this._freeNeighbors(map, c) != 2) { continue; }
			if (Math.random() >= percentage) { continue; }
			
			var fake = new RPG.Cells.Wall.Fake();
			map.setCell(fake, c);
		}
	}
	return this;
}

/**
 * @class Beings decorator
 * @augments RPG.Decorators.BaseDecorator
 */
RPG.Decorators.Beings = OZ.Singleton().extend(RPG.Decorators.BaseDecorator);
RPG.Decorators.Beings.prototype.decorate = function(map, count) {
	var danger = map.getDanger();
	for (var i=0;i<count;i++) {
		var b = RPG.Factories.npcs.getInstance(danger);
		var c = map.getFreeCoords(true);
		if (!c) { return this; }
		map.setBeing(b, c);
	}
	return this;
}

/**
 * @class Items decorator
 * @augments RPG.Decorators.BaseDecorator
 */
RPG.Decorators.Items = OZ.Singleton().extend(RPG.Decorators.BaseDecorator);
RPG.Decorators.Items.prototype.decorate = function(map, count) {
	var danger = map.getDanger();
	for (var i=0;i<count;i++) {
		var item = RPG.Factories.items.getInstance(danger);
		var c = map.getFreeCoords(true);
		if (!c) { return this; }
		map.addItem(item, c);
	}
	return this;
}

/**
 * @class Traps decorator
 * @augments RPG.Decorators.BaseDecorator
 */
RPG.Decorators.Traps = OZ.Singleton().extend(RPG.Decorators.BaseDecorator);
RPG.Decorators.Traps.prototype.addTraps = function(map, count) {
	var danger = map.getDanger();
	for (var i=0;i<count;i++) {
		var trap = RPG.Factories.traps.getInstance(danger);
		var c = map.getFreeCoords(true);
		if (!c) { return this; }
		map.setFeature(trap, c);
	}
	return this;
}

/**
 * @class Door decorator
 * - adds doors to surrounding corridors
 * - transforms walls with adjacent corridors to fake walls
 * @augments RPG.Decorators.BaseDecorator
 */
RPG.Decorators.Doors = OZ.Singleton().extend(RPG.Decorators.BaseDecorator);
RPG.Decorators.Doors.prototype.decorate = function(map, room, options) {
	var o = {
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
	
	var north = new RPG.Coords(0, -1);
	var south = new RPG.Coords(0, 1);
	var east = new RPG.Coords(1, 0);
	var west = new RPG.Coords(-1, 0);

	var c = new RPG.Coords(0, 0);
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
			
			var cell = map.getCell(c);
			if (cell instanceof RPG.Cells.Wall) {
				/* try fake corridor, if applicable */
				if (Math.random() >= o.fakeCorridors) { continue; } /* bad luck */
				var nc = this._freeNeighbors(map, c);
				if (nc != 4) { continue; } /* bad neighbor count */
				
				var after = c.clone().plus(dir);
				if (map.blocks(RPG.BLOCKS_MOVEMENT, after)) { continue; } /* bad layout */
				
				/* fake corridor */
				var corridor = map.getDefaultEmptyCell();
				map.setCell(corridor, c);
				var fake = new RPG.Cells.Wall.Fake();
				map.setCell(fake, c);
				continue;
			}
			
			var feature = map.getFeature(c);
			if (!feature && o.doors) {
				/* add door */
				feature = new RPG.Features.Door();
				map.setFeature(feature, c);
			}
			
			if (!(feature instanceof RPG.Features.Door)) { continue; } /* not a door */
			if (Math.random() < o.closed) { feature.close(); } /* close door */
			if (Math.random() < o.locked) { feature.lock(); } /* lock door */

			/* fake wall */
			if (Math.random() < o.fakeDoors) {
				var fake = new RPG.Cells.Wall.Fake();
				map.setCell(fake, c);
			} /* if fake */

		} /* for y */
	} /* for x */
	return this;
}

/**
 * @class Treasure decorator
 * @augments RPG.Decorators.BaseDecorator
 */
RPG.Decorators.Treasure = OZ.Singleton().extend(RPG.Decorators.BaseDecorator);
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
			var c = new RPG.Coords(i, j);
			if (map.blocks(RPG.BLOCKS_MOVEMENT, c)) { continue; }

			if (Math.random() < o.treasure) {
				var treasure = this._generateTreasure(danger);
				map.addItem(treasure, c);
				continue;
			}
			
		}
	}
	return this;
}
RPG.Decorators.Treasure.prototype._generateTreasure = function(danger) {
	if (Math.randomPercentage() < 67) {
		return RPG.Factories.gold.getInstance(danger);
	} else {
		return RPG.Factories.gems.getInstance(danger);
	}
}

