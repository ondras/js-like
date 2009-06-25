/**
 * @class Orc race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Orc = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Orc.prototype.init = function() {
	this.parent();
	this._char = "o";
	this._color = "lime";
	this._image = "orc";
	this._description = "orc";
	this.addModifier(RPG.Feats.Strength, RPG.MODIFIER_PLUS, 9);
	this.addModifier(RPG.Feats.Toughness, RPG.MODIFIER_PLUS, 10);
	this.addModifier(RPG.Feats.Intelligence, RPG.MODIFIER_PLUS, 5);
	this.addModifier(RPG.Feats.Dexterity, RPG.MODIFIER_PLUS, 7);
}

/**
 * @class Human race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Human = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Human.prototype.init = function() {
	this.parent();
	this._char = "@";
	this._color = "royalblue";
	this._image = "human";
	this._description = "human";
	this.addModifier(RPG.Feats.Strength, RPG.MODIFIER_PLUS, 6);
	this.addModifier(RPG.Feats.Toughness, RPG.MODIFIER_PLUS, 8);
	this.addModifier(RPG.Feats.Intelligence, RPG.MODIFIER_PLUS, 9);
	this.addModifier(RPG.Feats.Dexterity, RPG.MODIFIER_PLUS, 8);
}

/**
 * @class Elven race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Elf = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Elf.prototype.init = function() {
	this.parent();
	this._char = "u";
	this._color = "royalblue";
	this._image = "elf"; /* FIXME */
	this._description = "elf";
	this.addModifier(RPG.Feats.Strength, RPG.MODIFIER_PLUS, 5);
	this.addModifier(RPG.Feats.Toughness, RPG.MODIFIER_PLUS, 5);
	this.addModifier(RPG.Feats.Intelligence, RPG.MODIFIER_PLUS, 11);
	this.addModifier(RPG.Feats.Dexterity, RPG.MODIFIER_PLUS, 9);
}

/**
 * @class Dwarven race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Dwarf = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Dwarf.prototype.init = function() {
	this.parent();
	this._char = "h";
	this._color = "khaki";
	this._image = "dwarf"; /* FIXME */
	this._description = "dwarf";
	this.addModifier(RPG.Feats.Strength, RPG.MODIFIER_PLUS, 6);
	this.addModifier(RPG.Feats.Toughness, RPG.MODIFIER_PLUS, 11);
	this.addModifier(RPG.Feats.Intelligence, RPG.MODIFIER_PLUS, 7);
	this.addModifier(RPG.Feats.Dexterity, RPG.MODIFIER_PLUS, 6);
}
