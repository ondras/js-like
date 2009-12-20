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
RPG.Spells.Attack.prototype.explode = function(center, radius, explosion) {
	RPG.World.lock();
	var map = this._caster.getCell().getMap();
	var cells = map.cellsInArea(center, radius);
	for (var i=0;i<cells.length;i++) {
		var cell = cells[i];
		RPG.UI.map.addProjectile(cell.getCoords(), explosion);
	}
	setTimeout(this.bind(function(){
		this._afterExplosion(cells);
	}), 10000);
}

RPG.Spells.Attack.prototype._afterExplosion = function(cells) {
	for (var i=0;i<cells.length;i++) {
		var cell = cells[i];
		var b = cell.getBeing();
		if (!b) { continue; }
		if (b == this._caster && !i) { continue; }
		
		this._caster.attackMagic(b, this);
	}

	
	RPG.UI.map.removeProjectiles();
	RPG.World.unlock();
}

/**
 * @class Explosion visual
 * @augments RPG.Misc.IVisual
 */
RPG.Spells.Attack.Explosion = OZ.Class().implement(RPG.Misc.IVisual);
RPG.Spells.Attack.Explosion.factory.ignore = true;
RPG.Spells.Attack.Explosion.prototype.init = function(ch, color, image) {
	this._initVisuals();
	this._char = ch;
	this._color = color;
	this._image = image;
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
	this._range = 5;
}

RPG.Spells.Projectile.prototype.cast = function(target) {
	this.launch(this._caster.getCell(), target);
}

RPG.Spells.Projectile.prototype.fly = function(cell) {
	var b = cell.getBeing();
	if (b) {
		this._caster.attackMagic(b, this);
	} else if (!cell.isFree()) {
		if (RPG.World.pc.canSee(cell.getCoords())) {
			var s = RPG.Misc.format("%The hits %a and disappears.", this, cell.getFeature() || cell);
			RPG.UI.buffer.message(s);
		}
		return;
	}

	RPG.Misc.IProjectile.prototype.fly.call(this, cell);
}

RPG.Spells.Projectile.prototype._getTrajectory = function(source, target) {
	if (this._type == RPG.SPELL_TARGET) { 
		/* same as basic projectiles */
		return RPG.Misc.IProjectile.prototype._getTrajectory.call(this, source, target); 
	}
	
	if (this._type == RPG.SPELL_DIRECTION) {
		/* target = direction */
		var result = [];
		
		var cell = source;
		var dist = 0;
		while (dist < this._range) {
			dist++;
			cell = cell.neighbor(target);
			if (!cell) { return result; }
			result.push(cell);
			if (!cell.getBeing() && !cell.isFree()) { break; }
		}
		return result;
	}
	
	throw new Error("Cannot compute trajectory for a non-projectile spell");
}

