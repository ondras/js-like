/**
 * @class Warrior profession
 * @augments RPG.Professions.BaseProfession
 */
RPG.Professions.Warrior = OZ.Class().extend(RPG.Professions.BaseProfession);
RPG.Professions.Warrior.name = "warrior";
RPG.Professions.Warrior.image = "warrior";
RPG.Professions.Warrior.prototype.setup = function(being) {
	this.parent(being);

	being.adjustFeat(RPG.FEAT_MAX_HP, 5);
	being.adjustFeat(RPG.FEAT_MAX_MANA, -3);

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

	being.addSpell(RPG.Spells.Heal);
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

	being.adjustFeat(RPG.FEAT_MAX_MANA, 5);
	being.adjustFeat(RPG.FEAT_MAX_HP, -3);
	being.adjustFeat(RPG.FEAT_HIT_MAGIC, 3);

	being.addSpell(RPG.Spells.Heal);
	
	var scroll = new RPG.Items.Scroll(RPG.Spells.MagicBolt);
	being.addItem(scroll);
}
