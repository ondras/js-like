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
	var map = this._caster.getCell().getMap();
	var target = this._caster.getCell().getCoords().clone().plus(RPG.DIR[dir]);
	var cell = map.at(target);
	var being = cell.getBeing();

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
	this._type = RPG.SPELL_TARGET;
}

RPG.Spells.Teleport.prototype.cast = function(coords) {
	var map = this._caster.getCell().getMap();
	var target = map.at(coords);
	
	if (!target || !target.isFree()) {
		RPG.UI.buffer.message("You cannot teleport to that place.");
		return;
	}

	this._caster.teleport(target);
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
	var map = this._caster.getCell().getMap();
	var target = this._caster.getCell().getCoords().clone().plus(RPG.DIR[dir]);
	var cell = map.at(target);
	var feature = cell.getFeature();

	if (feature && feature instanceof RPG.Features.Door && feature.isLocked()) {
		feature.unlock();
		RPG.UI.buffer.message("The door magically unlocks!");
	} else {
		RPG.UI.buffer.message("Nothing happens.");
		return;
	}
}

/**
 * @class Abstract projectile spell
 * @augments RPG.Spells.BaseSpell
 * @augments RPG.Misc.IProjectile
 */
RPG.Spells.Projectile = OZ.Class()
						.extend(RPG.Spells.BaseSpell)
						.implement(RPG.Misc.IProjectile);
RPG.Spells.Projectile.factory.ignore = true;

RPG.Spells.Projectile.prototype.init = function(caster) {
	this.parent(caster);

	this._coords = null;
	this._dir = null;
	this._distance = 5;
	this._traveledDistance = 0;
	this._baseImage = "";
	
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

RPG.Spells.Projectile.prototype.cast = function(dir) {
	this._char = this._chars[dir];
	this._image = this._baseImage + "-" + this._suffixes[dir];

	var coords = this._caster.getCell().getCoords();
	this._startCoords = coords;
	this._traveledDistance = 0;
	
	this.launch(coords.clone(), dir);
}

RPG.Spells.Projectile.prototype.iterate = function() {
	this._traveledDistance++;
	
	this._coords.plus(RPG.DIR[this._dir]);
	var cell = this._caster.getCell().getMap().at(this._coords);

	var end = false;
	if (this._traveledDistance > this._distance || !cell) {
		end = true;
	} else if (!cell.isFree()) {
		var b = cell.getBeing();
		if (b) {
			this._caster.attackMagic(b, this);
		} else {
			end = true;
			var s = RPG.Misc.format("%The hits %a and disappears.", this, cell.getFeature() || cell);
			RPG.UI.buffer.message(s);
		}
	}

	if (end) {
		return false;
	} else {
		return RPG.Misc.IProjectile.prototype.iterate.call(this);
	}
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

	this._baseImage = "magic-bolt";
	this._color = "blueviolet";
}
