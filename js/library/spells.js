/**
 * @class Healing spell
 * @augments RPG.Spells.BaseSpell
 */
RPG.Spells.Heal = OZ.Class().extend(RPG.Spells.BaseSpell);
RPG.Spells.Heal.name = "heal";
RPG.Spells.Heal.cost = 4;
RPG.Spells.Heal.prototype.init = function(caster) {
	this.parent(caster);
	this._type = RPG.SPELL_TOUCH;
}

RPG.Spells.Heal.prototype.cast = function(dir) {
	var map = this._caster.getMap();
	var target = this._caster.getCoords().clone().plus(RPG.DIR[dir]);
	var being = map.getBeing(target);

	if (!being) {
		RPG.UI.buffer.message("Nothing happens.");
		return;
	}

	being.heal(5); /* FIXME amount */
}

/**
 * @class Teleporting spell
 * @augments RPG.Spells.BaseSpell
 */
RPG.Spells.Teleport = OZ.Class().extend(RPG.Spells.BaseSpell);
RPG.Spells.Teleport.name = "teleport";
RPG.Spells.Teleport.cost = 7;
RPG.Spells.Teleport.prototype.init = function(caster) {
	this.parent(caster);
	this._type = RPG.SPELL_REMOTE;
}

RPG.Spells.Teleport.prototype.cast = function(coords) {
	var map = this._caster.getMap();
	
	if (map.blocks(RPG.BLOCKS_MOVEMENT, coords)) {
		RPG.UI.buffer.message("You cannot teleport to that place.");
		return;
	}

	this._caster.teleport(coords);
}

/**
 * @class Knocking (unlocking) spell
 * @augments RPG.Spells.BaseSpell
 */
RPG.Spells.Knock = OZ.Class().extend(RPG.Spells.BaseSpell);
RPG.Spells.Knock.name = "knock";
RPG.Spells.Knock.cost = 3;
RPG.Spells.Knock.prototype.init = function(caster) {
	this.parent(caster);
	this._type = RPG.SPELL_TOUCH;
}

RPG.Spells.Knock.prototype.cast = function(dir) {
	var map = this._caster.getMap();
	var target = this._caster.getCoords().clone().plus(RPG.DIR[dir]);
	var feature = map.getFeature(target);

	if (feature && feature instanceof RPG.Features.Door && feature.isLocked()) {
		feature.unlock();
		RPG.UI.buffer.message("The door magically unlocks!");
	} else {
		RPG.UI.buffer.message("Nothing happens.");
		return;
	}
}

/**
 * @class Explosion spell
 * @augments RPG.Spells.Attack
 */
RPG.Spells.MagicExplosion = OZ.Class().extend(RPG.Spells.Attack);
RPG.Spells.MagicExplosion.name = "magic explosion";
RPG.Spells.MagicExplosion.cost = 11;
RPG.Spells.MagicExplosion.damage = new RPG.Misc.RandomValue(5, 3);
RPG.Spells.MagicExplosion.prototype.init = function(caster) {
	this.parent(caster);
	this._type = RPG.SPELL_SELF;
	this._radius = 2;

	this._explosionImage = "magic-explosion";
	this.setVisual({color:"yellow"});
}

RPG.Spells.MagicExplosion.prototype.getRadius = function() {
	return this._radius;
}

RPG.Spells.MagicExplosion.prototype.cast = function() {
	this.explode(this._caster.getCoords(), this._radius, true);
}

/**
 * @class Magic bolt spell
 * @augments RPG.Spells.Projectile
 */
RPG.Spells.MagicBolt = OZ.Class().extend(RPG.Spells.Projectile);
RPG.Spells.MagicBolt.name = "magic bolt";
RPG.Spells.MagicBolt.cost = 8;
RPG.Spells.MagicBolt.damage = new RPG.Misc.RandomValue(4, 1);
RPG.Spells.MagicBolt.prototype.init = function(caster) {
	this.parent(caster);
	this._type = RPG.SPELL_DIRECTION;
	this._range = 5;

	this._baseImage = "magic-bolt";
	this.setVisual({color:"blueviolet"});
}

RPG.Spells.MagicBolt.prototype._fly = function(coords) {
	this.parent(coords);
	var map = this._caster.getMap();

	var b = map.getBeing(coords);
	if (b) {
		this._caster.attackMagic(b, this);
	} else if (map.blocks(RPG.BLOCKS_LIGHT, coords)) {
		if (RPG.Game.pc.canSee(coords)) {
			var s = RPG.Misc.format("%The hits %a and disappears.", this, map.getFeature(coords) || map.getCell(coords));
			RPG.UI.buffer.message(s);
		}
	}
}

/**
 * @class Fireball spell
 * @augments RPG.Spells.Projectile
 */
RPG.Spells.Fireball = OZ.Class().extend(RPG.Spells.Projectile);
RPG.Spells.Fireball.name = "fireball";
RPG.Spells.Fireball.cost = 12;
RPG.Spells.Fireball.damage = new RPG.Misc.RandomValue(5, 3);
RPG.Spells.Fireball.prototype.init = function(caster) {
	this.parent(caster);
	this._type = RPG.SPELL_TARGET;
	this._range = 6;
	this._radius = 2;
	
	this._explosionImage = "fireball-explosion";
	this._baseImage = "fireball";
	this.setVisual({color:"red"});
}

RPG.Spells.Fireball.prototype._fly = function(coords) {
	this.parent(coords);

	if (this._flight.index+1 == this._flight.coords.length) {
		this.explode(coords, this._radius, false);
	}
}

RPG.Spells.Fireball.prototype.getRadius = function() {
	return this._radius;
}

RPG.Spells.Fireball.prototype._done = function() {
	RPG.Game.getEngine().unlock();
}
