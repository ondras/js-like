/**
 * @class NPC - Non-Player Character
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.NPC = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.NPC.flags.abstr4ct = true;

RPG.Beings.NPC.prototype.init = function(race) {
	this.parent(race);
	this._ai = new RPG.Engine.AI();
	this._ai.setBeing(this);
	
	this._alignment = RPG.ALIGNMENT_NEUTRAL;
}

RPG.Beings.NPC.prototype.getAI = function() {
	return this._ai;
}

RPG.Beings.NPC.prototype.randomGender = function() {
	if (Math.randomPercentage() < 34) {
		this._gender = RPG.GENDER_FEMALE;
		this._description = "female " + this._description;
		var f = this._feats[RPG.FEAT_STRENGTH];
		f.setValue(f.baseValue() - 2);
		var f = this._feats[RPG.FEAT_DEXTERITY];
		f.setValue(f.baseValue() + 2);
	} else {
		this._gender = RPG.GENDER_MALE;
	}
}

RPG.Beings.NPC.prototype.isHostile = function(being) {
	return this._ai.isHostile(being);
}

RPG.Beings.NPC.prototype.setAlignment = function(a) {
	this._alignment = a;
	this._ai.syncWithAlignment();
	return this;
}

RPG.Beings.NPC.prototype.getAlignment = function() {
	return this._alignment;
}

/**
 * Takes gender and name into account
 * @see RPG.Visual.VisualInterface#describe
 */
RPG.Beings.NPC.prototype.describe = function() {
	var s = this._description;
	if (this._gender == RPG.GENDER_FEMALE) { s = "female "+s; }
	if (this._name) { s = this._name + ", the " + s; }
	return s;
}

/**
 * Takes name into account
 * @see RPG.Visual.VisualInterface#describeA
 */
RPG.Beings.NPC.prototype.describeA = function() {
	if (this._name) { 
		return this.describe();
	} else {
		return this.parent();
	}
}

/**
 * Takes name into account
 * @see RPG.Visual.VisualInterface#describeThe
 */
RPG.Beings.NPC.prototype.describeThe = function() {
	if (this._name) { 
		return this.describe();
	} else {
		return this.parent();
	}
}
