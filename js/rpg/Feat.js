/**
 * @class Feat
 */
RPG.Feat = OZ.Class();

RPG.Feat.prototype.init = function(name, description, options) {
	this._options = {
		average: 11,
		upgrade: 1
	}
	for (var p in options) { this._options[p] = options[p]; }
	this._name = name;
	this._description = description;
	this.parentModifiers = {};
}

RPG.Feat.prototype._drd = function(value) {
	return (-11*10/21 + (value * 10/21));
}

RPG.Feat.prototype.getName = function() {
	return this._name;
}

RPG.Feat.prototype.getDescription = function() {
	return this._description;
}

RPG.Feat.prototype.getAverage = function() {
	return this._options.average;
}

RPG.Feat.prototype.getUpgrade = function() {
	return this._options.upgrade;
}

/**
 * normalize to average=11, upgrade=1 
 */
RPG.Feat.prototype.normalize = function(value) {
	return Math.round(11 + (value-this._options.average) / this._options.upgrade);
}
