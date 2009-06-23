/**
 * @class Orc race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Orc = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Orc.prototype.init = function() {
	this.parent();
	this._char = "o";
	this._color = "lightgreen";
	this._image = "orc";
	this.addModifier(RPG.Feats.Strength, RPG.MODIFIER_PLUS, 9);
	this.addModifier(RPG.Feats.Toughness, RPG.MODIFIER_PLUS, 10);
	this.addModifier(RPG.Feats.Intelligence, RPG.MODIFIER_PLUS, 5);
	this.addModifier(RPG.Feats.Dexterity, RPG.MODIFIER_PLUS, 7);
}
RPG.Races.Orc.prototype.describe = function() {
	return "orc";
}

/**
 * @class Human race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Human = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Human.prototype.init = function() {
	this.parent();
	this._char = "@";
	this._color = "brown";
	this._image = "human";
	this.addModifier(RPG.Feats.Strength, RPG.MODIFIER_PLUS, 7);
	this.addModifier(RPG.Feats.Toughness, RPG.MODIFIER_PLUS, 7);
	this.addModifier(RPG.Feats.Intelligence, RPG.MODIFIER_PLUS, 7);
	this.addModifier(RPG.Feats.Dexterity, RPG.MODIFIER_PLUS, 7);
}
RPG.Races.Human.prototype.describe = function() {
	return "human";
}
