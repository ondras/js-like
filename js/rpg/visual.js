RPG.Visual = {}; /* FIXME */

/**
 * @class Visual interface: everything that can be visualized have this
 */
RPG.Visual.IVisual = OZ.Class();

RPG.Visual.IVisual.prototype._initVisuals = function() {
	this._char = null;
	this._color = null;
	this._image = null;
	this._description = null;
}

/**
 * Returns an ascii character
 * @returns {string}
 */
RPG.Visual.IVisual.prototype.getChar = function() {
	return this._char;
}

/**
 * Returns html color string
 * @returns {string}
 */
RPG.Visual.IVisual.prototype.getColor = function() {
	return this._color;
}

/**
 * Returns an image file name 
 * @returns {string}
 */
RPG.Visual.IVisual.prototype.getImage = function() {
	return this._image;
}

/**
 * Describe self
 * @returns {string}
 */
RPG.Visual.IVisual.prototype.describe = function() {
	return this._description;
}

/**
 * Describe + prefix with indefinite article
 */
RPG.Visual.IVisual.prototype.describeA = function() {
	var base = this.describe();
	var result = "a";
	if (base.charAt(0).match(/[aeiouy]/i)) { result += "n"; }
	result += " " + base;
	return result;
}

/**
 * Describe + prefix with definite article
 */
RPG.Visual.IVisual.prototype.describeThe = function() {
	return "the " + this.describe();
}

/**
 * @class A lightweight visual representation, used for cell memory
 * @augments RPG.Visual.IVisual
 */
RPG.Visual.Trace = OZ.Class().implement(RPG.Visual.IVisual);
RPG.Visual.Trace.prototype.init = function(what) {
	this._char = what.getChar();
	this._image = what.getImage();
	this._color = what.getColor();
	this._description = what.describe();
	this._class = what.constructor;
}

RPG.Visual.Trace.prototype.getClass = function() {
	return this._class;
}
