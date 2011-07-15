/**
 * @class Undead 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Undead = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Undead.factory.frequency = 0;
RPG.Beings.Undead.prototype.init = function(race) {
	this.parent(race);
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
}

/**
 * @class Skeleton 
 * @augments RPG.Beings.Undead
 */
RPG.Beings.Skeleton = OZ.Class().extend(RPG.Beings.Undead);
RPG.Beings.Skeleton.factory.frequency = 25;
RPG.Beings.Skeleton.visual = { desc:"skeleton", ch:"z", color:"#ccc", image:"skeleton" };
RPG.Beings.Skeleton.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);
	
	if (Math.randomPercentage() < 21) {
		var sword = new RPG.Items.ShortSword();
		this.equip(RPG.SLOT_WEAPON, sword);
	}

	this.fullStats();
}

RPG.Beings.Skeleton.prototype._generateCorpse = function() {
	return new RPG.Items.Bone();
}

/**
 * @class Zombie 
 * @augments RPG.Beings.Undead
 */
RPG.Beings.Zombie = OZ.Class().extend(RPG.Beings.Undead);
RPG.Beings.Zombie.factory.frequency = 25;
RPG.Beings.Zombie.visual = { desc:"zombie", ch:"z", color:"#c93", image:"zombie" };
RPG.Beings.Zombie.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);
	this.randomGender();

	this.adjustFeat(RPG.FEAT_STRENGTH, 3);
	this.adjustFeat(RPG.FEAT_DEXTERITY, -2);
	this.adjustFeat(RPG.FEAT_MAGIC, -5);
	
	this.fullStats();
}
