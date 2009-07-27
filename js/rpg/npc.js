/**
 * @class NPC - Non-Player Character
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.NPC = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.NPC.flags.abstr4ct = true;
RPG.Beings.NPC.prototype.init = function(race) {
	this.parent();
	this._setRace(race);
}

RPG.Beings.NPC.prototype.setup = function() {
	this.parent();
	/* gender */
	if (Math.randomPercentage() < 34) {
		this._gender = RPG.GENDER_FEMALE;
		this._description = "female " + this._description;
	} else {
		this._gender = RPG.GENDER_MALE;
	}
	return this;
}
