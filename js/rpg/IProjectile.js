/**
 * @class Interface for flying objects
 */
RPG.IProjectile = OZ.Class();
RPG.IProjectile.prototype._range = 5;
RPG.IProjectile.prototype._initProjectile = function() {
	this._flying = false;
	
	this._flight = {
		index: -1,
		coords: [],
		dirs: []
	}
	
	this._chars = {};
	this._chars[RPG.N]  = "|";
	this._chars[RPG.NE] = "/";
	this._chars[RPG.E]  = "–";
	this._chars[RPG.SE] = "\\";
	this._chars[RPG.S]  = "|";
	this._chars[RPG.SW] = "/";
	this._chars[RPG.W]  = "–";
	this._chars[RPG.NW] = "\\";
	
	this._suffixes = {};
	this._suffixes[RPG.N]  = "n";
	this._suffixes[RPG.NE] = "ne";
	this._suffixes[RPG.E]  = "e";
	this._suffixes[RPG.SE] = "se";
	this._suffixes[RPG.S]  = "s";
	this._suffixes[RPG.SW] = "sw";
	this._suffixes[RPG.W]  = "w";
	this._suffixes[RPG.NW] = "nw";
}

RPG.IProjectile.prototype._getFlightVisualProperty = function(name) {
	if (!this._flying) { return null; }
	
	/* we are in flight, use special visual representation */
	var index = this._flight.index;
	var dir = this._flight.dirs[index];
	
	if (name == "ch") { return this._chars[dir]; }
	if (name == "image") { 
		var suffix = this._suffixes[dir];
		if (!suffix) { return null; }
		return this.getVisualProperty("image") + "-" + suffix; 
	}
}

RPG.IProjectile.prototype.getRange = function() {
	return this._range;
}

/**
 * Launch this projectile
 * @param {RPG.Coords} source
 * @param {RPG.Coords} target
 * @param {RPG.Map} map
 */
RPG.IProjectile.prototype.launch = function(source, target, map) {
	this.computeTrajectory(source, target, map);
	this._flying = true;
	this._flight.index = 0; /* starting from first coords in line */
	RPG.Game.getEngine().lock();
	var interval = 75;
	this._interval = setInterval(this.bind(this._step), interval);
}

/**
 * Flying...
 */
RPG.IProjectile.prototype._fly = function() {
	var coords = this._flight.coords[this._flight.index];
	RPG.UI.map.addProjectile(coords, this);
}

/**
 * Preview projectile's planned trajectory
 * @param {RPG.Coords} source
 * @param {RPG.Coords} target
 * @param {RPG.Map} map
 */
RPG.IProjectile.prototype.showTrajectory = function(source, target, map) {
	this.computeTrajectory(source, target, map);
	var pc = RPG.Game.pc;
	
	RPG.UI.map.removeProjectiles();
	for (var i=1;i<this._flight.coords.length;i++) {
		var coords = this._flight.coords[i];
		if (!pc.canSee(coords)) { continue; }
		
		var mark = (i+1 == this._flight.coords.length ? RPG.IProjectile.endMark : RPG.IProjectile.mark);
		RPG.UI.map.addProjectile(coords, mark);
	}
}

RPG.IProjectile.prototype._step = function() {
	this._flight.index++;
	var index = this._flight.index;
	
	if (index == this._flight.coords.length) { 
		clearInterval(this._interval); 
		this._flightDone();
		return;
	}
	
	this._fly(this._flight.coords[index]);
}

RPG.IProjectile.prototype._flightDone = function() {
	this._flying = false;
	RPG.UI.map.removeProjectiles();
	RPG.Game.getEngine().unlock();
}

/**
 * Precompute trajectory + its visuals. Stop at first non-free coords.
 * @param {RPG.Coords} source
 * @param {RPG.Coords} target
 * @param {RPG.Map} map
 */
RPG.IProjectile.prototype.computeTrajectory = function(source, target, map) {
	this._flight.index = 0;
	this._flight.coords = [];
	this._flight.dirs = [];

	var coords = map.getCoordsInLine(source, target);
	var max = Math.min(this.getRange()+1, coords.length);

	for (var i=0;i<max;i++) {
		var c = coords[i];
		this._flight.coords.push(c);
		this._flight.dirs.push(i ? this._flight.coords[i-1].dirTo(c) : null);
		if (i && map.blocks(RPG.BLOCKS_MOVEMENT, c)) { break; } /* stop at non-starting blocking cell */
	}
	
	return this._flight;
}

/**
 * @class Projectile mark
 * @augments RPG.Visual.IVisual
 */
RPG.IProjectile.Mark = OZ.Class().implement(RPG.Visual.IVisual);
RPG.IProjectile.Mark.visual = { ch:"*", color:"#fff", image:"crosshair", path:"misc" };
RPG.IProjectile.mark = new RPG.IProjectile.Mark();

/**
 * @class Projectile end mark
 * @augments RPG.Visual.IVisual
 */
RPG.IProjectile.EndMark = OZ.Class().implement(RPG.Visual.IVisual);
RPG.IProjectile.EndMark.visual = { ch:"X", color:"#fff", image:"crosshair-end", path:"misc" };
RPG.IProjectile.endMark = new RPG.IProjectile.EndMark();
