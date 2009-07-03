/**
 * @class Interval - generalized throwing dice
 */
RPG.Misc.Interval = OZ.Class();
RPG.Misc.Interval.prototype.init = function(min, max) {
	this.min = min;
	this.max = max;
}
RPG.Misc.Interval.prototype.toString = function() {
	return this.min + " - "+this.max;
}

/**
 * Roll the dice.
 * @param {int} [rollCount=3] How many rolls to perform in order to get final number.
 * Higher number means "more normal" distribution.
 */
RPG.Misc.Interval.prototype.roll = function(rollCount) {
	var result = 0;
	var count = rollCount || 3;
	
	var diff = (this.max - this.min)/count;
	for (var i=0;i<count;i++) {
		result += Math.random()*diff;
	}
	
	return this.min + Math.round(result);
}

RPG.Misc.Interval.prototype.clone = function() {
	return new RPG.Misc.Interval(this.min, this.max);
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

/**
 * @class Weapon interface. Separated from items, because "hands" and "foot" are also weapons.
 */
RPG.Misc.WeaponInterface = OZ.Class();
RPG.Misc.WeaponInterface.prototype.setHit = function(hit) {
	this._hit = new RPG.Feats.Hit(hit);
	
}
RPG.Misc.WeaponInterface.prototype.setDamage = function(damage) {
	this._damage = new RPG.Feats.Hit(damage);
}
RPG.Misc.WeaponInterface.prototype.getHit = function(modifierHolder) {
	return this._hit.modifiedValue(modifierHolder);
}
RPG.Misc.WeaponInterface.prototype.getDamage = function(modifierHolder) {
	return this._damage.modifiedValue(modifierHolder);
}

/**
 * @class Hands, basic weapon
 */
RPG.Misc.Hands = OZ.Class().implement(RPG.Misc.WeaponInterface);
RPG.Misc.Hands.prototype.init = function(hit, damage) {
	this.setHit(hit);
	this.setDamage(damage);
}

/**
 * @class Foot, useful for kicking
 */
RPG.Misc.Foot = OZ.Class().implement(RPG.Misc.WeaponInterface);
RPG.Misc.Foot.prototype.init = function(hit, damage) {
	this.setHit(hit);
	this.setDamage(damage);
}
