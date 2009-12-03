/**
 * @class Healing spell
 * @augments RPG.Spells.BaseSpell
 */
RPG.Spells.Heal = OZ.Class().extend(RPG.Spells.BaseSpell);

RPG.Spells.Heal.prototype.init = function() {
	this.parent("Heal", 4);
	this._type = RPG.SPELL_TOUCH;
}

RPG.Spells.Heal.prototype.cast = function(caster, dir) {
	var map = caster.getCell().getMap();
	var target = caster.getCell().getCoords().clone().plus(dir);
	var cell = map.at(target);
	var being = cell.getBeing();

	if (!being) {
		RPG.UI.buffer.message("Nothing happens.");
		return;
	}

	var a = new RPG.Actions.Heal(being, 5); /* FIXME amount */
	RPG.World.action(a);
}

/**
 * @class Abstract projectile spell
 * @augments RPG.Spells.BaseSpell
 * @augments RPG.Misc.IProjectile
 */
RPG.Spells.Projectile = OZ.Class()
						.extend(RPG.Spells.BaseSpell)
						.implement(RPG.Misc.IProjectile);
RPG.Spells.Projectile.flags.abstr4ct = true;

RPG.Spells.Projectile.prototype.init = function(name, cost) {
	this.parent(name, cost);

	this._char = "*";
	this._color = "lightblue";
	this._image = ""; /* FIXME */
}

/**
 * @class Magic bolt spell
 * @augments RPG.Spells.Projectile
 */
RPG.Spells.MagicBolt = OZ.Class().extend(RPG.Spells.Projectile);

RPG.Spells.MagicBolt.prototype.init = function() {
	this.parent("Magic bolt", 6);
	this._type = RPG.SPELL_DIRECTION;
}

RPG.Spells.MagicBolt.prototype.cast = function(caster, dir) {
	this._caster = caster;
	this._casterCoords = caster.getCell().getCoords();
	this.launch(dir, this._casterCoords);
}

RPG.Spells.MagicBolt.prototype.inFlight = function(coords) {
	var map = this._caster.getCell().getMap();
	var cell = map.at(coords);
	var end = false;
	
	if (this._casterCoords.distance(coords) >= 5) { /* FIXME */
		end = true;
	} else if (!cell.isFree()) {
		end = true;
		var b = cell.getBeing();
		if (b) {
			RPG.UI.buffer.message("being hit FIXME");
		} else {
			RPG.UI.buffer.message("obstacle hit FIXME");
		}
	}

	if (end) {
		return false;
	} else {
		return this.parent(coords);
	}
}
