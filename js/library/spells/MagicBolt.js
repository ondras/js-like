/**
 * @class Magic bolt spell
 * @augments RPG.Spells.Projectile
 */
RPG.Spells.MagicBolt = OZ.Class().extend(RPG.Spells.Projectile);
RPG.Spells.MagicBolt.visual = { color:"#93c", desc:"magic bolt", image:"magic-bolt" };
RPG.Spells.MagicBolt.cost = 8;
RPG.Spells.MagicBolt.prototype._type = RPG.SPELL_DIRECTION;
RPG.Spells.MagicBolt.prototype._damage = new RPG.RandomValue(4, 1);
RPG.Spells.MagicBolt.prototype._range = 5;

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
