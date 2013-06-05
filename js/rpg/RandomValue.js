/**
 * @class Random value - generalized throwing dice
 */
RPG.RandomValue = OZ.Class();
RPG.RandomValue.prototype.init = function(mean, twosigma) {
	this.mean = mean;
	this.twosigma = twosigma;
}

RPG.RandomValue.prototype.toString = function() {
	return this.mean + "±" + this.twosigma;
}

/**
 * Roll the dice.
 */
RPG.RandomValue.prototype.roll = function() {
	var value = Math.round(this.mean + Math.randomNormal(this.twosigma/2));
	return Math.max(0, value);
}

/**
 * Add another random value or a number
 * @param {RPG.RandomValue || number}
 */
RPG.RandomValue.prototype.add = function(rv) {
	if (typeof(rv) == "number") { return new this.constructor(this.mean+rv, this.twosigma); }

	var m = this.mean + rv.mean;
	var ts = Math.sqrt(this.twosigma*this.twosigma + rv.twosigma*rv.twosigma);
	return new this.constructor(m, ts);
}

