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
	
	this.setVisual({
		desc: "villager",
		ch: "@",
		color: "#c93",
		image: "villager"
	});
	
	this.fullStats();
}
