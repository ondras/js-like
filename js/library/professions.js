/**
 * @class Warrior profession
 * @augments RPG.Professions.BaseProfession
 */
RPG.Professions.Warrior = OZ.Class().extend(RPG.Professions.BaseProfession);
RPG.Professions.Warrior.name = "warrior";
RPG.Professions.Warrior.image = "warrior";
RPG.Professions.Warrior.prototype.setup = function(being) {
	this.parent(being);

	being.adjustFeat(RPG.FEAT_MAXHP, 5);
	being.adjustFeat(RPG.FEAT_MAXMANA, -3);

	var sword = new RPG.Items.ShortSword();
	being.addItem(sword);	
}

/**
 * @class Ranger profession
 * @augments RPG.Professions.BaseProfession
 */
RPG.Professions.Ranger = OZ.Class().extend(RPG.Professions.BaseProfession);
RPG.Professions.Ranger.name = "ranger";
RPG.Professions.Ranger.image = "ranger";
RPG.Professions.Ranger.prototype.setup = function(being) {
	this.parent(being);

	var s = new RPG.Spells.Heal();
	being.addSpell(s);
}

/**
 * @class Wizard profession
 * @augments RPG.Professions.BaseProfession
 */
RPG.Professions.Wizard = OZ.Class().extend(RPG.Professions.BaseProfession);
RPG.Professions.Wizard.name = "wizard";
RPG.Professions.Wizard.image = "wizard";
RPG.Professions.Wizard.prototype.setup = function(being) {
	this.parent(being);

	being.adjustFeat(RPG.FEAT_MAXMANA, 5);
	being.adjustFeat(RPG.FEAT_MAXHP, -3);

	being.addSpell(RPG.Spells.MagicBolt);
	being.addSpell(RPG.Spells.Heal);
}
