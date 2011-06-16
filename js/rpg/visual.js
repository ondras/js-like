/**
 * @class Lightweight visual representation, used for map memory
 */
RPG.Visual = OZ.Class();

RPG.Visual._cache = {};

RPG.Visual.getVisual = function(ivisual) {
	var visual = new this(ivisual);
	var hash = JSON.stringify(visual);
	if (!(hash in this._cache)) { this._cache[hash] = visual; }
	return this._cache[hash];
}

/**
 * @param {RPG.Visual.IVisual} ivisual
 */
RPG.Visual.prototype.init = function(ivisual) {
	this.ch = ivisual.getChar();
	this.color = ivisual.getColor();
	this.desc = ivisual.describe();
	this.image = ivisual.getImage();
}

/**
 * @class Visual interface: everything that can be visualized have this
 */
RPG.Visual.IVisual = OZ.Class();

RPG.Visual.IVisual.prototype.getVisualProperty = function(name) {
	var current = this.constructor;
	while (current) {
		if (current.visual && name in current.visual) { return current.visual[name]; }
		current = current._extend;
	}
	return null;
}

RPG.Visual.IVisual.prototype.getChar = function() {
	return this.getVisualProperty("ch");
}

RPG.Visual.IVisual.prototype.getColor = function() {
	return this.getVisualProperty("color");
}

RPG.Visual.IVisual.prototype.getImage = function() {
	var path = this.getVisualProperty("path");
	return (path ? path + "/" : "") + this.getVisualProperty("image");
}

/**
 * Describe self
 * @returns {string}
 */
RPG.Visual.IVisual.prototype.describe = function() {
	return this.getVisualProperty("desc");
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
