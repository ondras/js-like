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
RPG.Misc.IModifier = OZ.Class();
/**
 * @param {int} feat Feat constant
 * @param {int || function} value Modification value
 */
RPG.Misc.IModifier.prototype.addModifier = function(feat, value) {
	var item = [feat, value];
	this._modifiers[feat] = value;
}
/**
 * Ask for a modifier to a given feat. Second argument is necessary for 
 * recursive scenarios, for example: to retrieve modifier for MaxHP, 
 * we have to compute the modified value of Strength.
 * 
 * @param {int} feat The feat we wish to modify, specified by its constant
 * @param {RPG.Misc.IModifier} modifierHolder
 */
RPG.Misc.IModifier.prototype.getModifier = function(feat, modifierHolder) {
	if (feat in this._modifiers) {
		var value = this._modifiers[feat];
		if (typeof(value) == "function") {
			return value(modifierHolder);
		} else {
			return value;
		}
	} else { 
		return null;
	}
}

/**
 * @class Weapon interface. Separated from items, because "hands" and "foot" are also weapons.
 */
RPG.Misc.IWeapon = OZ.Class();
RPG.Misc.IWeapon.prototype.setHit = function(rv) {
	this._hit = new RPG.Feats[RPG.FEAT_HIT](rv);
	
}
RPG.Misc.IWeapon.prototype.setDamage = function(rv) {
	this._damage = new RPG.Feats[RPG.FEAT_DAMAGE](rv);
}
RPG.Misc.IWeapon.prototype.getHit = function(modifierHolder) {
	return this._hit.modifiedValue(modifierHolder);
}
RPG.Misc.IWeapon.prototype.getDamage = function(modifierHolder) {
	return this._damage.modifiedValue(modifierHolder);
}


/**
 * @class Interface for objects which can be cloned and (de)serialized
 */
RPG.Misc.ISerializable = OZ.Class();
RPG.Misc.ISerializable.prototype.fromXML = function(node) {
	return this;
}
RPG.Misc.ISerializable.prototype.toXML = function(node) {
	return "";
}
RPG.Misc.ISerializable.prototype.clone = function() {
	var clone = new this.constructor();
	for (var p in this) { clone[p] = this[p]; }
	return clone;
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
 * @class Object factory
 */ 
RPG.Misc.Factory = OZ.Class();
/**
 * @param {object} searchBase Object with classes
 * @param {function} commonAncestor Class to search for
 */
RPG.Misc.Factory.prototype.init = function() {
	this._classList = [];	
}
RPG.Misc.Factory.prototype.add = function(ancestor) {
	for (var i=0;i<OZ.Class.all.length;i++) {
		var ctor = OZ.Class.all[i];
		if (ctor.flags.abstr4ct) { continue; }
		if (this._hasAncestor(ctor, ancestor)) { 
			this._classList.push(ctor); 
		}
	}
	return this;
}
/**
 * Return a random instance
 */ 
RPG.Misc.Factory.prototype.getInstance = function(maxDanger) {
	var len = this._classList.length;
	if (len == 0) { throw new Error("No available classes"); }

	var avail = [];
	var total = 0;
	
	for (var i=0;i<this._classList.length;i++) {
		ctor = this._classList[i];
		var danger = ctor.flags.danger;
		if (danger < 0 || (maxDanger && danger > maxDanger)) { continue; } 
		total += ctor.flags.frequency;
		avail.push(ctor);
	}
	var random = Math.floor(Math.random()*total);
	
	var sub = 0;
	var ctor = null;
	for (var i=0;i<avail.length;i++) {
		ctor = avail[i];
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
