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
			
			var fake = new RPG.Cells.Wall.Fake();
			fake.setup(cell);
			this._map.setCell(c, fake);
		}
	}
	return this;
}

RPG.Dungeon.Decorator.prototype.decorateRoomDoors = function(room, options) {
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
				var fake = new RPG.Cells.Wall.Fake();
				fake.setup(new o.corridor());
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
				var fake = new RPG.Cells.Wall.Fake();
				fake.setup(cell);
				this._map.setCell(c, fake);
			} /* if fake */

		} /* for y */
	} /* for x */
	return this;
}

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
			
			/* FIXME add monster generator */
		}
	}
}


/** FIXME: rework into a factory */
RPG.Dungeon.Decorator.prototype._generateTreasure = function() {
	if (Math.random() < 0.7) {
		var gold = new RPG.Items.Gold();
		gold.setAmount(1+Math.floor(Math.random()*100));
		return gold;
	} else {
		return RPG.Factories.Gem.getInstance();
		var gems = [];
		for (var p in RPG.Items) {
			var item = RPG.Items[p];
			if (item._extend == RPG.Items.Gem) { gems.push(item); }
		}
		var gem = gems[Math.floor(Math.random() * gems.length)];
		return new gem();
	}
}

/**
 * Return number of free neighbors
 */
RPG.Dungeon.Decorator.prototype._freeNeighbors = function(center) {
	var result = 0;
	for (var i=-1;i<=1;i++) {
		for (var j=-1;j<=1;j++) {
			if (!i && !j) { continue; }
			var coords = new RPG.Misc.Coords(i, j).plus(center);
			if (!this._map.isValid(coords)) { continue; }
			if (this._map.at(coords) instanceof RPG.Cells.Corridor) { result++; }
		}
	}
	return result;
}
