/**
 * @class Throwing dice
 */
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
 * @class Coordinates
 */
RPG.Misc.Coords = OZ.Class();
RPG.Misc.Coords.prototype.init = function(x, y) {
	this.x = x;
	this.y = y;
}
RPG.Misc.Coords.prototype.toString = function() {
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
RPG.Misc.Coords.prototype.plus = function(c) {
	this.x += c.x;
	this.y += c.y;
	return this;
}
RPG.Misc.Coords.prototype.minus = function(c) {
	this.x -= c.x;
	this.y -= c.y;
	return this;
}

/**
 * @class Modifier interface: everything that holds feat modifiers have this
 */
RPG.Misc.ModifierInterface = OZ.Class();
RPG.Misc.ModifierInterface.prototype.addModifier = function(feat, type, value) {
	var item = [feat, type, value];
	this._modifiers.push(item);
}
/**
 * Ask for a modifier to a given feat. Third argument is necessary for 
 * recursive scenarios, for example: to retrieve modifier for MaxHP, 
 * we have to compute the modified value of Strength.
 * 
 * @param {RPG.Feats.BaseFeat} feat The feat we wish to modify
 * @param {int} type Type constant
 * @param {RPG.Misc.ModifierInterface} modifierHolder
 */
RPG.Misc.ModifierInterface.prototype.getModifier = function(feat, type, modifierHolder) {
	for (var i=0;i<this._modifiers.length;i++) {
		var item = this._modifiers[i];
		if (item[0] == feat && item[1] == type) { 
			var val = item[2];
			if (typeof(val) == "function") {
				return val(modifierHolder);
			} else {
				return val; 
			}
		}
	}
	return null;
}
