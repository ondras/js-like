/**
 * @class Teleporting spell
 * @augments RPG.Spells.BaseSpell
 */
RPG.Spells.Teleport = OZ.Class().extend(RPG.Spells.BaseSpell);
RPG.Spells.Teleport.visual = { desc:"teleport" };
RPG.Spells.Teleport.cost = 7;
RPG.Spells.Teleport.prototype._type = RPG.SPELL_REMOTE;

RPG.Spells.Teleport.prototype.cast = function(coords) {
	var map = this._caster.getMap();
	
	if (map.blocks(RPG.BLOCKS_MOVEMENT, coords)) {
		RPG.UI.buffer.message("You cannot teleport to that place.");
		return;
	}

	this._caster.teleport(coords);
}
