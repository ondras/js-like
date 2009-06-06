/**
 * @class Visual interface: everyting that can be visualized have this
 */
RPG.Visual.VisualInterface = OZ.Class();
/**
 * Returns an ascii character specification 
 * @param {RPG.Beings.BaseBeing} who
 * @returns {RPG.Visual.Char}
 */
RPG.Visual.VisualInterface.prototype.getChar = function(who) {
	return new RPG.Visual.Char();
}
/**
 * Returns an image file name 
 * @param {RPG.Beings.BaseBeing} who
 * @returns {string}
 */
RPG.Visual.VisualInterface.prototype.getImage = function(who) {
	return null;
}

/**
 * @class Description interface: everyting that can be described have this
 */
RPG.Visual.DescriptionInterface = OZ.Class();
/**
 * Describe self to "who"
 * @param {RPG.Beings.BaseBeing} who
 * @returns {string}
 */
RPG.Visual.DescriptionInterface.prototype.describe = function(who) {
	return null;
}
/**
 * Describe + prefix with indefinite article
 * @see RPG.Visual.DescriptionInterface#describe
 */
RPG.Visual.DescriptionInterface.prototype.describeA = function(who) {
	var base = this.describe(who);
	var result = "a";
	if (base.charAt(0).match(/[aeiouy]/i)) { result += "n"; }
	result += " " + base;
	return result;
}
/**
 * Describe + prefix with definite article
 * @see RPG.Visual.DescriptionInterface#describe
 */
RPG.Visual.DescriptionInterface.prototype.describeThe = function(who) {
	return "the " + this.describe(who);
}

/**
 * @class ASCII character specification
 */
RPG.Visual.Char = OZ.Class();
RPG.Visual.Char.prototype.init = function() {
	this._char = "?";
	this._color = "gray";
	this._background = "black";
}
RPG.Visual.Char.prototype.getChar = function() {
	return this._char;
}
RPG.Visual.Char.prototype.getColor = function() {
	return this._color;
}
RPG.Visual.Char.prototype.getBackground = function() {
	return this._background;
}
RPG.Visual.Char.prototype.setChar = function(ch) {
	this._char = ch;
}
RPG.Visual.Char.prototype.setColor = function(color) {
	this._color = color;
}
RPG.Visual.Char.prototype.setBackground = function(background) {
	this._background = background;
}
RPG.Visual.Char.prototype.clone = function() {
	var result = new this.constructor();
	result.setChar(this.getChar());
	result.setColor(this.getColor());
	result.setBackground(this.getBackground());
	return result;
}
