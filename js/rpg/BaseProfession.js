/**
 * @class Base profession
 * @augments RPG.Visual.IVisual
 */
RPG.Professions.BaseProfession = OZ.Class().implement(RPG.Visual.IVisual);
RPG.Professions.BaseProfession.prototype.setup = function(being) {
	var tmp = new RPG.Items.HealingPotion();
	being.addItem(tmp);

	var tmp = new RPG.Items.IronRation();
	being.addItem(tmp);
}
