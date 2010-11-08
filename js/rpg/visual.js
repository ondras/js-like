/**
 * @class Lightweight visual representation
 */
RPG.Visual = OZ.Class();
RPG.Visual.prototype.init = function(props, who, oldVisual) {
	var data = {
		color: "",
		ch: "",
		desc: "",
		image: "",
	}
	
	if (oldVisual) { for (var p in data) { data[p] = oldVisual[p]; } }
	for (var p in props) { data[p] = props[p]; }
	for (var p in data) { this[p] = data[p]; }
	
	if (who instanceof RPG.Beings.PC) {
		this.imagePrefix = "pc";
	} else if (who instanceof RPG.Beings.NPC) {
		this.imagePrefix = "beings";
	} else if (who instanceof RPG.Items.BaseItem) {
		this.imagePrefix = "items";
	} else if (who instanceof RPG.Cells.BaseCell) {
		this.imagePrefix = "cells";
	} else if (who instanceof RPG.Spells.BaseSpell) {
		this.imagePrefix = "spells";
	} else if (who instanceof RPG.Features.BaseFeature) {
		this.imagePrefix = "features";
	} else {
		this.imagePrefix = "misc";
	}

}
RPG.Visual.prototype.getHash = function() {
	return [this.imagePrefix, this.image, this.desc, this.color, this.ch].join("-");
}
RPG.Visual.prototype.isComplete = function() {
	return (this.color && this.ch && this.desc && this.image);
}

RPG.Visual._instances = {};
/**
 * Static builder method 
 */
RPG.Visual.getVisual = function(props, who, oldVisual) {
	/* create a testing instance */
	var test = new RPG.Visual(props, who, oldVisual);

	/* insert into hashtable */
	var h = test.getHash();
	if (h in this._instances) {
		test = this._instances[h];
	} else if (test.isComplete()) {
		this._instances[h] = test;
	}
	
	return test;
	
}
RPG.Visual.toJSON = function(handler) {
	var arr = [];
	for (var hash in this._instances) { arr.push(this._instances[hash]); }
	return handler.toJSON(arr);
}
RPG.Visual.fromJSON = function(arr) {
	this._instances = {};
	while (arr.length) {
		var item = arr.shift();
		this._instances[item.getHash()] = item;
	}
}

/**
 * @class Visual interface: everything that can be visualized have this
 */
RPG.Visual.IVisual = OZ.Class();
RPG.Visual.IVisual.prototype.getVisual = function() {
	return this._visual;
}
RPG.Visual.IVisual.prototype.setVisual = function(props) {
	this._visual = RPG.Visual.getVisual(props, this, this._visual);
}
/**
 * Describe self
 * @returns {string}
 */
RPG.Visual.IVisual.prototype.describe = function() {
	return this._visual.desc;
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

