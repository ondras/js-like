/**
 * @class Knocking (unlocking) spell
 * @augments RPG.Spells.BaseSpell
 */
RPG.Spells.Knock = OZ.Class().extend(RPG.Spells.BaseSpell);
RPG.Spells.Knock.visual = { desc:"knock" };
RPG.Spells.Knock.cost = 3;
RPG.Spells.Knock.prototype._type = RPG.SPELL_TOUCH;

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
