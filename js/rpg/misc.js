/**
 * @class Random value - generalized throwing dice
 */
RPG.Misc.RandomValue = OZ.Class();
RPG.Misc.RandomValue.prototype.init = function(mean, variance) {
	this.mean = mean;
	this.variance = variance;
}
RPG.Misc.RandomValue.prototype.toString = function() {
	return this.mean + "±" + this.variance;
}

/**
 * Roll the dice.
 */
RPG.Misc.RandomValue.prototype.roll = function() {
	var value = Math.round(this.mean + Math.randomNormal(this.variance/2));
	return Math.max(0, value);
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
/**
 * @param {function} feat Feat constructor
 * @param {int} type Type constant
 * @param {int || function} value Modification value
 */
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
RPG.Misc.WeaponInterface.prototype.setHit = function(rv) {
	this._hit = new RPG.Feats.Hit(rv);
	
}
RPG.Misc.WeaponInterface.prototype.setDamage = function(rv) {
	this._damage = new RPG.Feats.Damage(rv);
}
RPG.Misc.WeaponInterface.prototype.getHit = function(modifierHolder) {
	return this._hit.modifiedValue(modifierHolder);
}
RPG.Misc.WeaponInterface.prototype.getDamage = function(modifierHolder) {
	return this._damage.modifiedValue(modifierHolder);
}

/**
 * @class Hands, basic weapon
 * @augments RPG.Misc.WeaponInterface
 */
RPG.Misc.Hands = OZ.Class().implement(RPG.Misc.WeaponInterface);
RPG.Misc.Hands.prototype.init = function(hit, damage) {
	this.setHit(hit);
	this.setDamage(damage);
}

/**
 * @class Foot, useful for kicking
 * @augments RPG.Misc.WeaponInterface
 */
RPG.Misc.Foot = OZ.Class().implement(RPG.Misc.WeaponInterface);
RPG.Misc.Foot.prototype.init = function(hit, damage) {
	this.setHit(hit);
	this.setDamage(damage);
}

/**
 * @class Chat - hierarchical dialog structure
 */
RPG.Misc.Chat = OZ.Class();

RPG.Misc.Chat.prototype.init = function(text, end) {
	this._text = text;
	this._options = [];
	this._end = end;
}

RPG.Misc.Chat.prototype.addOption = function(text, something) {
	this._options.push([text, something]);
	return this;
}

RPG.Misc.Chat.prototype.getText = function() {
	return this._text;
}

RPG.Misc.Chat.prototype.getOptions = function() {
	return this._options;
}

RPG.Misc.Chat.prototype.getEnd = function() {
	return this._end;
}

/**
 * @class Interface for objects which can be cloned and (de)serialized
 */
RPG.Misc.SerializableInterface = OZ.Class();
RPG.Misc.SerializableInterface.prototype.setup = function() {
	return this;
}
RPG.Misc.SerializableInterface.prototype.fromXML = function(node) {
	return this;
}
RPG.Misc.SerializableInterface.prototype.toXML = function(node) {
	return "";
}
RPG.Misc.SerializableInterface.prototype.clone = function() {
	var clone = new this.constructor();
	for (var p in this) { clone[p] = this[p]; }
	return clone;
}

/**
 * @class Object factory
 */ 
RPG.Misc.Factory = OZ.Class();

/**
 * @param {object} searchBase Object with classes
 * @param {function} commonAncestor Class to search for
 */
RPG.Misc.Factory.prototype.init = function() {
	this._classList = [];	
	this._total = 0;
}

RPG.Misc.Factory.prototype.add = function(ancestor) {
	for (var i=0;i<OZ.Class.all.length;i++) {
		var ctor = OZ.Class.all[i];
		if (ctor.flags.abstr4ct) { continue; }
		if (this._hasAncestor(ctor, ancestor)) { 
			this._classList.push(ctor); 
			this._total += ctor.flags.frequency;
		}
	}
	return this;
}

/**
 * Return a random instance
 */ 
RPG.Misc.Factory.prototype.getInstance = function() {
	var len = this._classList.length;
	if (len == 0) { throw new Error("No available classes"); }
	
	var random = Math.floor(Math.random()*this._total);
	
	var sub = 0;
	var ctor = null;
	for (var i=0;i<this._classList.length;i++) {
		ctor = this._classList[i];
		sub += ctor.flags.frequency;
		if (random < sub) { return new ctor(); }
	}
}

RPG.Misc.Factory.prototype._hasAncestor = function(ctor, ancestor) {
	var current = ctor;
	while (current) {
		if (current == ancestor) { return true; }
		current = current._extend;
	}
	return false;
}
