/**
 * @class Fireball spell
 * @augments RPG.Spells.Projectile
 */
RPG.Spells.Fireball = OZ.Class().extend(RPG.Spells.Projectile);
RPG.Spells.Fireball.visual = { desc:"fireball", color:"#f00", image:"fireball" };
RPG.Spells.Fireball.cost = 12;
RPG.Spells.Fireball.prototype._type = RPG.SPELL_TARGET;
RPG.Spells.Fireball.prototype._damage = new RPG.RandomValue(5, 3);
RPG.Spells.Fireball.prototype._range = 6;
RPG.Spells.Fireball.prototype.init = function(caster) {
	this.parent(caster);
	this._radius = 2;
	this._suffixes = {};
}

RPG.Spells.Fireball.prototype.getImage = function() {
	if (!this._exploded) { return this.parent(); }
	return this.getVisualProperty("path") + "/fireball-explosion";
}

RPG.Spells.Fireball.prototype.getRadius = function() {
	return this._radius;
}

RPG.Spells.Fireball.prototype._flightDone = function() {
	var engine = RPG.Game.getEngine();

	engine.lock(); /* calling parent method will unlock, so to be safe...*/
	this.parent(); 
	this.explode(this._flight.coords[this._flight.coords.length-1], this._radius, false); /* will start explosion timeout */
	engine.unlock(); /* remove the safety lock created above */
}
