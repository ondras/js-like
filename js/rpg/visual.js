/**
 * @class Visual interface: everyting that can be visualized have this
 */
RPG.Visual.VisualInterface = OZ.Class();

RPG.Visual.VisualInterface.prototype._initVisuals = function() {
	this._char = null;
	this._color = null;
	this._image = null;
	this._description = null;
}

/**
 * Returns an ascii character
 * @returns {string}
 */
RPG.Visual.VisualInterface.prototype.getChar = function() {
	return this._char;
}

/**
 * Returns html color string
 * @returns {string}
 */
RPG.Visual.VisualInterface.prototype.getColor = function() {
	return this._color;
}

/**
 * Returns an image file name 
 * @returns {string}
 */
RPG.Visual.VisualInterface.prototype.getImage = function() {
	return this._image;
}

/**
 * Describe self
 * @returns {string}
 */
RPG.Visual.VisualInterface.prototype.describe = function() {
	return this._description;
}

/**
 * Describe + prefix with indefinite article
 */
RPG.Visual.VisualInterface.prototype.describeA = function() {
	var base = this.describe();
	var result = "a";
	if (base.charAt(0).match(/[aeiouy]/i)) { result += "n"; }
	result += " " + base;
	return result;
}

/**
 * Describe + prefix with definite article
 */
RPG.Visual.VisualInterface.prototype.describeThe = function() {
	return "the " + this.describe();
}
