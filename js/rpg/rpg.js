/**
 * Base RPG components.
 */
var RPG = {
	Misc:{},
	Engine:{},
	Visual:{},
	
	Actions:{},
	Feats:{},
	Items:{},
	Beings:{},
	Effects:{},
	Cells:{},
	Attributes:{},
	Classes:{},
	Races:{}
};
/**
 * Visual interface: everyting that can be visualized have this
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
 * Description interface: everyting that can be described have this
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

RPG.Visual.Char = OZ.Class();
RPG.Visual.Char.prototype.init = function() {
	this._char = "?";
	this._color = "darkgray";
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

RPG.Misc.Dice = OZ.Class();
RPG.Misc.Dice.prototype.init = function(times, faces, bonus) {
	this.times = times;
	this.faces = faces;
	this.bonus = bonus;
}
RPG.Misc.Dice.prototype.toString = function() {
	var str = "";
	str += this.times + "d" + this.faces;
	if (this.bonus) {
		if (this.bonus > 0) { str += "+"; }
		str += this.bonus;
	}
	return str;
}
RPG.Misc.Dice.prototype.roll = function() {
	var result = this.bonus;
	for (var i=0;i<this.times;i++) {
		result += 1 + Math.floor(Math.random()*this.faces);
	}
	return result;
}

/**
 * Coordinates
 */
RPG.Misc.Coords = OZ.Class().implement(RPG.Visual.DescriptionInterface);
RPG.Misc.Coords.prototype.init = function(x, y) {
	this.x = x;
	this.y = y;
}
RPG.Misc.Coords.prototype.describe = function() {
	return "["+this.x+", "+this.y+"]";
}
RPG.Misc.Coords.prototype.distance = function(coords) {
	var dx = Math.abs(this.x - coords.x);
	var dy = Math.abs(this.y - coords.y);
	return Math.max(dx, dy);
}
RPG.Misc.Coords.prototype.clone = function() {
	return new this.constructor(this.x, this.y);
}

/**
 * Modifier interface: everything that holds feat modifiers have this
 */
RPG.Misc.ModifierInterface = OZ.Class();
RPG.Misc.ModifierInterface.prototype.addModifier = function(feat, type, value) {
	var item = [feat, type, value];
	this._modifiers.push(item);
}
RPG.Misc.ModifierInterface.prototype.getModifier = function(feat, type) {
	for (var i=0;i<this._modifiers.length;i++) {
		var item = this._modifiers[i];
		if (item[0] == feat && item[1] == type) { return item[2]; }
	}
	return null;
}
RPG.Misc.ModifierInterface.prototype.getModifiers = function() {
	return this._modifiers;
}

