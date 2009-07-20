/**
 * @class Orc race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Orc = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Orc.prototype.init = function() {
	this.parent();
	this._color = "lime";
	this._image = "orc";
	this.addModifier(RPG.Feats.Strength, RPG.MODIFIER_PLUS, 3);
	this.addModifier(RPG.Feats.Toughness, RPG.MODIFIER_PLUS, 4);
	this.addModifier(RPG.Feats.Intelligence, RPG.MODIFIER_PLUS, -1);
	this.addModifier(RPG.Feats.Dexterity, RPG.MODIFIER_PLUS, 1);
}

/**
 * @class Human race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Human = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Human.prototype.init = function() {
	this.parent();
	this._color = "royalblue";
	this._image = "human";
	this.addModifier(RPG.Feats.Strength, RPG.MODIFIER_PLUS, 0);
	this.addModifier(RPG.Feats.Toughness, RPG.MODIFIER_PLUS, 2);
	this.addModifier(RPG.Feats.Intelligence, RPG.MODIFIER_PLUS, 3);
	this.addModifier(RPG.Feats.Dexterity, RPG.MODIFIER_PLUS, 2);
}

/**
 * @class Elven race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Elf = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Elf.prototype.init = function() {
	this.parent();
	this._color = "limegreen";
	this._image = "elf";
	this.addModifier(RPG.Feats.Strength, RPG.MODIFIER_PLUS, -1);
	this.addModifier(RPG.Feats.Toughness, RPG.MODIFIER_PLUS, -1);
	this.addModifier(RPG.Feats.Intelligence, RPG.MODIFIER_PLUS, 5);
	this.addModifier(RPG.Feats.Dexterity, RPG.MODIFIER_PLUS, 3);
}

/**
 * @class Dwarven race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Dwarf = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Dwarf.prototype.init = function() {
	this.parent();
	this._color = "khaki";
	this._image = "dwarf";
	this.addModifier(RPG.Feats.Strength, RPG.MODIFIER_PLUS, 0);
	this.addModifier(RPG.Feats.Toughness, RPG.MODIFIER_PLUS, 5);
	this.addModifier(RPG.Feats.Intelligence, RPG.MODIFIER_PLUS, 1);
	this.addModifier(RPG.Feats.Dexterity, RPG.MODIFIER_PLUS, 0);
}
