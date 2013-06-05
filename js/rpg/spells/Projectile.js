/**
 * @class Abstract projectile spell
 * @augments RPG.Spells.Attack
 * @augments RPG.IProjectile
 */
RPG.Spells.Projectile = OZ.Class().extend(RPG.Spells.Attack)
				  .implement(RPG.IProjectile);

RPG.Spells.Projectile.factory.frequency = 0;
RPG.Spells.Projectile.prototype.init = function(caster) {
	this.parent(caster);
	this._initProjectile();
	this._flight.bounces = [];

	this._bounces = true;
}

RPG.Spells.Projectile.prototype.getImage = function() {
	var fvp = this._getFlightVisualProperty("image");
	return (fvp ? this.getVisualProperty("path") + "/" + fvp : this.parent());
}

RPG.Spells.Projectile.prototype.getChar = function() {
	return this._getFlightVisualProperty("ch") || this.parent();
}

RPG.Spells.Projectile.prototype.cast = function(target) {
	this.launch(this._caster.getCoords(), target, this._caster.getMap());
}

RPG.Spells.Projectile.prototype._fly = function() {
	this.parent();

	var coords = this._flight.coords[this._flight.index];
	var bounce = this._flight.bounces[this._flight.index];
	
	if (bounce && RPG.Game.pc.canSee(coords)) {
		var s = RPG.Misc.format("%The bounces!", this);
		RPG.UI.buffer.message(s);
	}
}

RPG.Spells.Projectile.prototype.computeTrajectory = function(source, target, map) {
	if (this._type == RPG.SPELL_TARGET) { 
		/* same as basic projectiles */
		return this.parent(source, target, map);
	}
	
	if (this._type == RPG.SPELL_DIRECTION) {
		/* target = direction */
		var dir = target;
		
		this._flight.index = -1;
		this._flight.coords = [source];
		this._flight.dirs = [null];
		this._flight.bounces = [false];

		var dist = 0;
		while (dist < this._range) {
			dist++;
			var prev = this._flight.coords[this._flight.coords.length-1];
			var coords = prev.neighbor(dir);
			if (!map.getCell(coords)) { return this._flight; }
			
			if (!map.blocks(RPG.BLOCKS_LIGHT, coords) || !this._bounces) {
				/* either free space or non-bouncing end obstacle */
				this._flight.bounces.push(false);
				this._flight.coords.push(coords);
				this._flight.dirs.push(dir);
				if (map.blocks(RPG.BLOCKS_LIGHT, coords)) { break; }
			} else {
				/* bounce! */
				dir = this._computeBounce(prev, dir);
			}
		}
		
		return this._flight;
	}
	
	throw new Error("Cannot compute trajectory for a non-projectile spell");
}

/**
 * Compute bouncing
 * @param {RPG.Coords} coords Previous (free) coords
 * @param {int} dir Direction to current (blocking) coords
 */
RPG.Spells.Projectile.prototype._computeBounce = function(coords, dir) {
	var newCoords = coords;
	var newDir = null;
	var map = this._caster.getMap();
	
	var leftDir = (dir+7) % 8;
	var rightDir = (dir+1) % 8;
	var leftCoords = coords.neighbor(leftDir);
	var rightCoords = coords.neighbor(rightDir);
	
	var leftFree = !map.blocks(RPG.BLOCKS_LIGHT, leftCoords);
	var rightFree = !map.blocks(RPG.BLOCKS_LIGHT, rightCoords);
	
	if (leftFree == rightFree) { /* backwards */
		newDir = (dir+4) % 8;
	} else if (leftFree) { /* bounce to the left */
		newCoords = leftCoords;
		newDir = (dir+6) % 8;
	} else { /* bounce to the right */
		newCoords = rightCoords;
		newDir = (dir+2) % 8;
	}
	
	this._flight.bounces.push(true);
	this._flight.coords.push(newCoords);
	this._flight.dirs.push(newDir);
	
	return newDir;
}
