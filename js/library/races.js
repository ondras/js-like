RPG.Races.Orc = OZ.Class().extend(RPG.Races.BaseRace);
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
