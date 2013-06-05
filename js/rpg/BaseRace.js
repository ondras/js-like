/**
 * @class Basic race
 * @augments RPG.Visual.IVisual
 */
RPG.Races.BaseRace = OZ.Class().implement(RPG.Visual.IVisual);
RPG.Races.BaseRace.prototype.init = function() {
	this._slots = {};
	this._defaults = [];
	for (var i=0;i<RPG.Feats.length;i++) { this._defaults.push(RPG.Feats[i].getAverage()); }
}

RPG.Races.BaseRace.prototype.getDefaults = function() {
	return this._defaults;
}

RPG.Races.BaseRace.prototype.getSlots = function() {
	return this._slots;
}
