/**
 * @class Explosion spell
 * @augments RPG.Spells.Attack
 */
RPG.Spells.MagicExplosion = OZ.Class().extend(RPG.Spells.Attack);
RPG.Spells.MagicExplosion.visual = { color:"#ff0", desc:"magic explosion", image:"magic-explosion" };
RPG.Spells.MagicExplosion.cost = 11;
RPG.Spells.MagicExplosion.prototype._damage = new RPG.RandomValue(5, 3);
RPG.Spells.MagicExplosion.prototype.init = function(caster) {
	this.parent(caster);
	this._radius = 2;
}

RPG.Spells.MagicExplosion.prototype.getRadius = function() {
	return this._radius;
}

RPG.Spells.MagicExplosion.prototype.cast = function() {
	this.explode(this._caster.getCoords(), this._radius, true);
}