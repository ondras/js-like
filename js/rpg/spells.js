/**
 * @class Base abstract spell
 * @augments RPG.Misc.ISerializable
 * @augments RPG.Misc.IVisual
 */
RPG.Spells.BaseSpell = OZ.Class()
						.implement(RPG.Misc.ISerializable)
						.implement(RPG.Misc.IVisual);
RPG.Spells.BaseSpell.factory.ignore = true;
RPG.Spells.BaseSpell.cost = null;
RPG.Spells.BaseSpell.name = "";
RPG.Spells.BaseSpell.damage = null;

RPG.Spells.BaseSpell.prototype.init = function(caster) {
	this._initVisuals();
	
	this._type = RPG.SPELL_SELF;
	this._caster = caster;
}

RPG.Spells.BaseSpell.prototype.describe = function() {
	return this.constructor.name;
}

RPG.Spells.BaseSpell.prototype.cast = function(target) {
}

RPG.Spells.BaseSpell.prototype.getCost = function() { 
	return this.constructor.cost;
}

RPG.Spells.BaseSpell.prototype.getType = function() { 
	return this._type;
}

RPG.Spells.BaseSpell.prototype.getCaster = function() {
	return this._caster;
}

/**
 * @class Abstract attack spell
 * @augments RPG.Spells.BaseSpell
 * @augments RPG.Misc.IWeapon
 */
RPG.Spells.Attack = OZ.Class()
					.extend(RPG.Spells.BaseSpell)
					.implement(RPG.Misc.IWeapon);

RPG.Spells.Attack.prototype.init = function(caster) {
	this.parent(caster);
	this._hit = new RPG.Misc.RandomValue(5, 3);
	this._damage = null;
}
					
RPG.Spells.Attack.prototype.getDamage = function() {
	var base = this.constructor.damage;
	var m = base.mean + this._caster.getFeat(RPG.FEAT_DAMAGE_MAGIC);
	var v = base.variance;
	return new RPG.Misc.RandomValue(m, v);
}

RPG.Spells.Attack.prototype.getHit = function() {
	var base = this._hit;
	var m = base.mean + this._caster.getFeat(RPG.FEAT_HIT_MAGIC);
	var v = base.variance;
	return new RPG.Misc.RandomValue(m, v);
}

/**
 * Explosion
 * @param {RPG.Misc.Coords} center
 * @param {int} radius
 * @param {RPG.Misc.IVisual} explosion effect
 */
RPG.Spells.Attack.prototype.explode = function(center, radius, ignoreCenter) {
	this._image = this._explosionImage;
	this._char = "*";

	RPG.UI.map.removeProjectiles();
	RPG.World.lock();
	var map = this._caster.getCell().getMap();
	var cells = map.cellsInArea(center, radius);
	if (ignoreCenter) { cells.shift(); }
	
	for (var i=0;i<cells.length;i++) {
		var cell = cells[i];
		RPG.UI.map.addProjectile(cell.getCoords(), this);
	}
	setTimeout(this.bind(function(){
		this._afterExplosion(cells);
	}), 100);
}

RPG.Spells.Attack.prototype._afterExplosion = function(cells) {
	for (var i=0;i<cells.length;i++) {
		var cell = cells[i];
		var b = cell.getBeing();
		if (!b) { continue; }
		this._caster.attackMagic(b, this);
	}
	
	RPG.UI.map.removeProjectiles();
	RPG.World.unlock();
}

/**
 * @class Abstract projectile spell
 * @augments RPG.Spells.Attack
 * @augments RPG.Misc.IProjectile
 */
RPG.Spells.Projectile = OZ.Class()
						.extend(RPG.Spells.Attack)
						.implement(RPG.Misc.IProjectile);
RPG.Spells.Projectile.factory.ignore = true;

RPG.Spells.Projectile.prototype.init = function(caster) {
	this.parent(caster);
	this._initProjectile();
	this._flight.bounces = [];

	this._bounces = true;
}

RPG.Spells.Projectile.prototype.cast = function(target) {
	this.launch(this._caster.getCell(), target);
}

RPG.Spells.Projectile.prototype._fly = function() {
	RPG.Misc.IProjectile.prototype._fly.call(this);

	var cell = this._flight.cells[this._flight.index];
	var bounce = this._flight.bounces[this._flight.index];
	
	if (bounce && RPG.World.pc.canSee(cell.getCoords())) {
		var s = RPG.Misc.format("%The bounces!", this);
		RPG.UI.buffer.message(s);
	}
}

RPG.Spells.Projectile.prototype._computeTrajectory = function(source, target) {
	if (this._type == RPG.SPELL_TARGET) { 
		/* same as basic projectiles */
		RPG.Misc.IProjectile.prototype._computeTrajectory.call(this, source, target); 
		return;
	}
	
	if (this._type == RPG.SPELL_DIRECTION) {
		/* target = direction */
		var dir = target;
		
		this._flight.index = -1;
		this._flight.cells = [];
		this._flight.chars = [];
		this._flight.images = [];
		this._flight.bounces = [];

		var dist = 0;
		while (dist < this._range) {
			dist++;
			var prev = (this._flight.cells.length ? this._flight.cells[this._flight.cells.length-1] : source);
			var cell = prev.neighbor(dir);
			if (!cell) { return; }
			
			if (cell.visibleThrough() || !this._bounces) {
				/* either free space or non-bouncing end obstacle */
				this._flight.bounces.push(false);
				this._flight.cells.push(cell);
				this._flight.chars.push(this._chars[dir]);
				this._flight.images.push(this._baseImage + "-" + this._suffixes[dir]);
				
				if (!cell.visibleThrough()) { break; }
			} else {
				/* bounce! */
				dir = this._computeBounce(prev, dir);
			}
		}
		
		return;
	}
	
	throw new Error("Cannot compute trajectory for a non-projectile spell");
}

/**
 * Compute bouncing
 * @param {RPG.Cells.BaseCell} cell Previous (free) cell
 * @param {int} dir Direction to current (blocking) cell
 */
RPG.Spells.Projectile.prototype._computeBounce = function(cell, dir) {
	var newCell = cell;
	var newDir = null;
	
	var leftDir = (dir-1) % 8;
	var rightDir = (dir+1) % 8;
	var leftCell = cell.neighbor(leftDir);
	var rightCell = cell.neighbor(rightDir);
	
	var leftFree = !leftCell || leftCell.visibleThrough();
	var rightFree = !rightCell || rightCell.visibleThrough();
	
	if (leftFree == rightFree) { /* backwards */
		newDir = (dir+4) % 8;
	} else if (leftFree) { /* bounce to the left */
		newCell = leftCell; /* FIXME does this _always_ exist? */
		newDir = (dir-2) % 8;
	} else { /* bounce to the right */
		newCell = rightCell; /* FIXME does this _always_ exist? */
		newDir = (dir+2) % 8;
	}
	
	this._flight.bounces.push(true);
	this._flight.cells.push(newCell);
	this._flight.chars.push(this._chars[newDir]);
	this._flight.images.push(this._baseImage + "-" + this._suffixes[newDir]);
	
	return newDir;
}
