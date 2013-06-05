/**
 * @class Healing spell
 * @augments RPG.Spells.BaseSpell
 */
RPG.Spells.Heal = OZ.Class().extend(RPG.Spells.BaseSpell);
RPG.Spells.Heal.visual = { desc:"heal" };
RPG.Spells.Heal.cost = 4;
RPG.Spells.Heal.prototype._type = RPG.SPELL_TOUCH;

RPG.Spells.Heal.prototype.cast = function(dir) {
	var map = this._caster.getMap();
	var target = this._caster.getCoords().clone().plus(RPG.DIR[dir]);
	var being = map.getBeing(target);

	if (!being) {
		RPG.UI.buffer.message("Nothing happens.");
		return;
	}
	
	var amount = RPG.Rules.getHealingAmount(this._caster, being);
	being.heal(amount);
}
