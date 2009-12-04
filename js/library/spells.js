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
	var target = caster.getCell().getCoords().clone().plus(RPG.DIR[dir]);
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

	this._coords = null;
	this._dir = null;
	this._distance = 5;
	this._damage = null;
	
	this._chars = {};
	this._chars[RPG.N]  = "|";
	this._chars[RPG.NE] = "/";
	this._chars[RPG.E]  = "–";
	this._chars[RPG.SE] = "\\";
	this._chars[RPG.S]  = "|";
	this._chars[RPG.SW] = "/";
	this._chars[RPG.W]  = "–";
	this._chars[RPG.NW] = "\\";
}

RPG.Spells.Projectile.prototype.cast = function(caster, dir) {
	this._char = this._chars[dir];
	this._caster = caster;
	var coords = caster.getCell().getCoords();
	this._startCoords = coords;
	this.launch(coords.clone(), dir);
}

RPG.Spells.Projectile.prototype.iterate = function() {
	this._coords.plus(RPG.DIR[this._dir]);
	var cell = this._caster.getCell().getMap().at(this._coords);

	var end = false;
	if (this._startCoords.distance(this._coords) > this._distance) {
		end = true;
	} else if (!cell.isFree()) {
		var b = cell.getBeing();
		if (b) {
			var a = new RPG.Actions.MagicAttack(this, b);
			RPG.World.action(a);
		} else {
			end = true;
			var str = "";
			str += this.describeThe().capitalize() + " hits ";
			str += (cell.getFeature() || cell).describeA();
			str += " and disappears.";
			RPG.UI.buffer.message(str);
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

RPG.Spells.MagicBolt.prototype.init = function() {
	this.parent("magic bolt", 6);
	this._type = RPG.SPELL_DIRECTION;

	this._image = ""; /* FIXME */
	this._color = "blueviolet";
	this._damage = new RPG.Misc.RandomValue(4, 1);
}
