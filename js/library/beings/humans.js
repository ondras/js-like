/**
 * @class Villager
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Villager = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Villager.factory.ignore = true;
RPG.Beings.Villager.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	
	this._description = "villager";
	this._char = "@";
	this._color = "peru";
	this._image = "villager";
	
	this.fullStats();
}
