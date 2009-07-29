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
	/* gender */
	if (Math.randomPercentage() < 34) {
		this._gender = RPG.GENDER_FEMALE;
		this._description = "female " + this._description;
		this._defaults[RPG.FEAT_STRENGTH] -= 2;
		this._defaults[RPG.FEAT_DEXTERITY] += 2;
	} else {
		this._gender = RPG.GENDER_MALE;
	}

	this.parent();

	return this;
}
