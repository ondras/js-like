/**
 * @class Visual interface: everyting that can be visualized have this
 */
RPG.Visual.VisualInterface = OZ.Class();
/**
 * Returns an ascii character
 * @returns {string}
 */
RPG.Visual.VisualInterface.prototype.getChar = function() {
	return null;
}
/**
 * Returns html color string
 * @returns {string}
 */
RPG.Visual.VisualInterface.prototype.getColor = function() {
	return "#a9a9a9";
}
/**
 * Returns an image file name 
 * @returns {string}
 */
RPG.Visual.VisualInterface.prototype.getImage = function() {
	return null;
}

/**
 * @class Description interface: everyting that can be described have this
 */
RPG.Visual.DescriptionInterface = OZ.Class();
/**
 * Describe self
 * @returns {string}
 */
RPG.Visual.DescriptionInterface.prototype.describe = function() {
	return null;
}
/**
 * Describe + prefix with indefinite article
 */
RPG.Visual.DescriptionInterface.prototype.describeA = function() {
	var base = this.describe();
	var result = "a";
	if (base.charAt(0).match(/[aeiouy]/i)) { result += "n"; }
	result += " " + base;
	return result;
}
/**
 * Describe + prefix with definite article
 */
RPG.Visual.DescriptionInterface.prototype.describeThe = function() {
	return "the " + this.describe();
}
