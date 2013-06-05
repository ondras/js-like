/**
 * @class Abstract attack spell
 * @augments RPG.Spells.BaseSpell
 * @augments RPG.Misc.IDamageDealer
 */
RPG.Spells.Attack = OZ.Class()
					.extend(RPG.Spells.BaseSpell)
					.implement(RPG.Misc.IDamageDealer);
RPG.Spells.Attack.factory.frequency = 0;
RPG.Spells.Attack.visual = { ch:"*" };
RPG.Spells.Attack.prototype._damage = null;
RPG.Spells.Attack.prototype.init = function(caster) {
	this.parent(caster);
	this._exploded = false;
}
/**
 * @see RPG.Misc.IDamageDealer#getLuck
 */
RPG.Spells.Attack.prototype.getLuck = function() {
	return this._caster.getFeat(RPG.FEAT_LUCK);
}
/**
 * @see RPG.Misc.IDamageDealer#getHit
 * Spells always hit (evasion possible due to luck)
 */
RPG.Spells.Attack.prototype.getHit = function() {
	return new RPG.RandomValue(1/0, 0);
}

/**
 * Explosion
 * @param {RPG.Coords} center
 * @param {int} radius
 * @param {bool} ignoreCenter
 */
RPG.Spells.Attack.prototype.explode = function(center, radius, ignoreCenter) {
	this._exploded = true;
	RPG.UI.map.removeProjectiles();
	RPG.Game.getEngine().lock();
	var map = this._caster.getMap();
	var coords = map.getCoordsInArea(center, radius);
	if (ignoreCenter) { coords.shift(); }
	
	for (var i=0;i<coords.length;i++) {
		var c = coords[i];
		RPG.UI.map.addProjectile(c, this);
	}
	setTimeout(this.bind(function(){
		this._afterExplosion(coords);
	}), 100);
}

RPG.Spells.Attack.prototype._afterExplosion = function(coords) {
	for (var i=0;i<coords.length;i++) {
		var b = this._caster.getMap().getBeing(coords[i]);
		if (!b) { continue; }
		this._caster.attackMagic(b, this);
	}
	
	RPG.UI.map.removeProjectiles();
	RPG.Game.getEngine().unlock();
}

