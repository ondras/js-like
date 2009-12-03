RPG.Professions.Warrior = OZ.Class().extend(RPG.Professions.BaseProfession);
RPG.Professions.Warrior.prototype.init = function() {
	this._image = "warrior";
	this._name = "Warrior";
}

RPG.Professions.Warrior.prototype.setup = function(being) {
	this.parent(being);

	being.adjustFeat(RPG.FEAT_MAXHP, 5);
	being.adjustFeat(RPG.FEAT_MAXMANA, -3);

	var sword = new RPG.Items.ShortSword();
	being.addItem(sword);	
}

RPG.Professions.Ranger = OZ.Class().extend(RPG.Professions.BaseProfession);
RPG.Professions.Ranger.prototype.init = function() {
	this._image = "ranger";
	this._name = "Ranger";
}

RPG.Professions.Ranger.prototype.setup = function(being) {
	this.parent(being);

	var s = new RPG.Spells.Heal();
	being.spellMemory().addSpell(s);
}

RPG.Professions.Wizard = OZ.Class().extend(RPG.Professions.BaseProfession);
RPG.Professions.Wizard.prototype.init = function() {
	this._image = "wizard";
	this._name = "Wizard";
}

RPG.Professions.Wizard.prototype.setup = function(being) {
	this.parent(being);

	being.adjustFeat(RPG.FEAT_MAXMANA, 5);
	being.adjustFeat(RPG.FEAT_MAXHP, -3);

	var s = new RPG.Spells.MagicBolt();
	being.spellMemory().addSpell(s);
	var s = new RPG.Spells.Heal();
	being.spellMemory().addSpell(s);
}
