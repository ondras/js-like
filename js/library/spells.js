/**
 * @class Healing spell
 * @augments RPG.Spells.BaseSpell
 */
RPG.Spells.Heal = OZ.Class().extend(RPG.Spells.BaseSpell);

RPG.Spells.Heal.prototype.init = function() {
	this.parent("Heal", 4);
}

RPG.Spells.Heal.prototype.cast = function(caster, target) {
	var a = new RPG.Actions.Heal(target, 5); /* FIXME amount */
	RPG.World.action(a);
}
