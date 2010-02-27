/**
 * @class Visual interface: everything that can be visualized have this
 */
RPG.Misc.IVisual = OZ.Class();

RPG.Misc.IVisual.prototype._initVisuals = function() {
	this._char = null;
	this._color = null;
	this._image = null;
	this._description = null;
}

/**
 * Returns an ascii character
 * @returns {string}
 */
RPG.Misc.IVisual.prototype.getChar = function() {
	return this._char;
}

/**
 * Returns html color string
 * @returns {string}
 */
RPG.Misc.IVisual.prototype.getColor = function() {
	return this._color;
}

/**
 * Returns an image file name 
 * @returns {string}
 */
RPG.Misc.IVisual.prototype.getImage = function() {
	return this._image;
}

/**
 * Describe self
 * @returns {string}
 */
RPG.Misc.IVisual.prototype.describe = function() {
	return this._description;
}

/**
 * Describe + prefix with indefinite article
 */
RPG.Misc.IVisual.prototype.describeA = function() {
	var base = this.describe();
	var result = "a";
	if (base.charAt(0).match(/[aeiouy]/i)) { result += "n"; }
	result += " " + base;
	return result;
}

/**
 * Describe + prefix with definite article
 */
RPG.Misc.IVisual.prototype.describeThe = function() {
	return "the " + this.describe();
}

/**
 * @class Visual representation fly-weight
 * @augments RPG.Misc.IVisual
 */
RPG.Misc.Visual = OZ.Class().implement(RPG.Misc.IVisual);

RPG.Misc.Visual._storage = {};
RPG.Misc.Visual.get = function(data) {
	var obj = {
		char: "",
		color: "",
		desc: "",
		image: ""
	}
	for (var p in data) {
		if (p in obj) { obj[p] = data[p]; }
	}
	
	/* compute hash */
	var id = obj.char+"-"+obj.color+"-"+obj.desc+"-"+obj.image;
	
	if (!(id in this._storage)) { 
		this._storage[id] = new this(obj);
	}
	
	return this._storage[id];
}

RPG.Misc.Visual.prototype.init = function(data) {
	this._data = data;
}

RPG.Misc.Visual.prototype.getChar = function() {
	return this._data.char;
}

RPG.Misc.Visual.prototype.getColor = function() {
	return this._data.color;
}

RPG.Misc.Visual.prototype.getImage = function() {
	return this._data.image;
}

RPG.Misc.Visual.prototype.getDescription = function() {
	return this._data.desc;
}

/**
 * @class A lightweight visual representation, used for cell memory
 * @augments RPG.Misc.IVisual
 */
RPG.Misc.VisualTrace = OZ.Class().implement(RPG.Misc.IVisual);
RPG.Misc.VisualTrace.fromJSON = function(obj) {
	var tmp = function(){};
	tmp.prototype = this.prototype;
	var inst = new tmp();
	inst._char = obj.ch;
	inst._image = obj.image;
	inst._color = obj.color;
	inst._description = obj.description;
	return inst;
}
RPG.Misc.VisualTrace.prototype.init = function(what) {
	this._char = what.getChar();
	this._image = what.getImage();
	this._color = what.getColor();
	this._description = what.describe();
}
