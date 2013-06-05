/**
 * @class Coordinates
 */
RPG.Coords = OZ.Class();
RPG.Coords.fromString = function(str) {
	var parts = str.split(",");
	return new this(parseInt(parts[0]), parseInt(parts[1]));
}

RPG.Coords.prototype.init = function(x, y) {
	this.x = x;
	this.y = y;
}

RPG.Coords.prototype.toString = function() {
	return this.x+","+this.y;
}

RPG.Coords.prototype.distance = function(coords) {
	var dx = Math.abs(this.x - coords.x);
	var dy = Math.abs(this.y - coords.y);
	return Math.max(dx, dy);
}

RPG.Coords.prototype.clone = function() {
	return new this.constructor(this.x, this.y);
}

RPG.Coords.prototype.plus = function(c) {
	this.x += c.x;
	this.y += c.y;
	return this;
}

RPG.Coords.prototype.minus = function(c) {
	this.x -= c.x;
	this.y -= c.y;
	return this;
}

RPG.Coords.prototype.equals = function(c) {
	return (this.x == c.x && this.y == c.y);
}

RPG.Coords.prototype.neighbor = function(dir) {
	return this.clone().plus(RPG.DIR[dir]);
}

/**
 * Direction to another coords
 * @param {RPG.Coords} c
 * @returns {int}
 */
RPG.Coords.prototype.dirTo = function(c) {
	if (c.x == this.x && c.y == this.y) { return RPG.CENTER; }
	var diff = c.clone().minus(this);
	for (var i=0;i<8;i++) {
		var dir = RPG.DIR[i];
		if (dir.x == diff.x && dir.y == diff.y) { return i; }
	}
	throw new Error("Cannot compute direction");
}

RPG.DIR[RPG.N] =  new RPG.Coords( 0, -1);
RPG.DIR[RPG.NE] = new RPG.Coords( 1, -1);
RPG.DIR[RPG.E] =  new RPG.Coords( 1,  0);
RPG.DIR[RPG.SE] = new RPG.Coords( 1,  1);
RPG.DIR[RPG.S] =  new RPG.Coords( 0,  1);
RPG.DIR[RPG.SW] = new RPG.Coords(-1,  1);
RPG.DIR[RPG.W] =  new RPG.Coords(-1,  0);
RPG.DIR[RPG.NW] = new RPG.Coords(-1, -1);
RPG.DIR[RPG.CENTER] =  new RPG.Coords( 0,  0);
