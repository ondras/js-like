/**
 * @class Villager
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Villager = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Villager.factory.ignore = true;
RPG.Beings.Villager.visual = { desc:"villager", color:"#c93", image:"villager" };
RPG.Beings.Villager.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	
	this.fullStats();
}
