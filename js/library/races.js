/**
 * @class Orc race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Orc = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Orc.prototype.init = function() {
	this.parent();
	this.addModifier(RPG.Feats.Strength, RPG.MODIFIER_PLUS, 9);
	this.addModifier(RPG.Feats.Toughness, RPG.MODIFIER_PLUS, 10);
	this.addModifier(RPG.Feats.Intelligence, RPG.MODIFIER_PLUS, 5);
	this.addModifier(RPG.Feats.Dexterity, RPG.MODIFIER_PLUS, 7);
}
RPG.Races.Orc.prototype.describe = function(who) {
	return "orc";
}
RPG.Races.Orc.prototype.getImage = function(who) {
	return "orc";
}
RPG.Races.Orc.prototype.getChar = function(who) {
	var ch = this.parent(who);
	ch.setColor("lightgreen");
	ch.setChar("o");
	return ch;
}
