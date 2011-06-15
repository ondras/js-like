/**
 * @class Adventurer profession
 * @augments RPG.Professions.BaseProfession
 */
RPG.Professions.Adventurer = OZ.Class().extend(RPG.Professions.BaseProfession);
RPG.Professions.Adventurer.visual = { desc:"adventurer", image:"adventurer" };
RPG.Professions.Adventurer.prototype.setup = function(being) {
	this.parent(being);

	being.addSpell(RPG.Spells.Heal);
}

/**
 * @class Warrior profession
 * @augments RPG.Professions.BaseProfession
 */
RPG.Professions.Warrior = OZ.Class().extend(RPG.Professions.BaseProfession);
RPG.Professions.Warrior.visual = { desc:"warrior", image:"warrior" };
RPG.Professions.Warrior.prototype.setup = function(being) {
	this.parent(being);

	being.adjustFeat(RPG.FEAT_MAX_HP, 5);
	being.adjustFeat(RPG.FEAT_MAX_MANA, -3);

	var sword = new RPG.Items.ShortSword();
	being.addItem(sword);	
}

/**
 * @class Archer profession
 * @augments RPG.Professions.BaseProfession
 */
RPG.Professions.Archer = OZ.Class().extend(RPG.Professions.BaseProfession);
RPG.Professions.Archer.visual = { desc:"archer", image:"archer" };
RPG.Professions.Archer.prototype.setup = function(being) {
	this.parent(being);

	being.addItem(new RPG.Items.ShortBow());
	being.addItem(new RPG.Items.Arrow(30));
}

/**
 * @class Wizard profession
 * @augments RPG.Professions.BaseProfession
 */
RPG.Professions.Wizard = OZ.Class().extend(RPG.Professions.BaseProfession);
RPG.Professions.Wizard.visual = { desc:"wizard", image:"wizard" };
RPG.Professions.Wizard.prototype.setup = function(being) {
	this.parent(being);

	being.adjustFeat(RPG.FEAT_MAX_MANA, 5);
	being.adjustFeat(RPG.FEAT_MAX_HP, -3);

	being.addSpell(RPG.Spells.Heal);
//	being.addSpell(RPG.Spells.MagicBolt);
//	being.addSpell(RPG.Spells.MagicExplosion);
//	being.addSpell(RPG.Spells.Fireball);

	var scroll = new RPG.Items.Scroll(RPG.Spells.MagicBolt);
	being.addItem(scroll);
}
