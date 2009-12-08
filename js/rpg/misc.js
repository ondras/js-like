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

RPG.DIR[RPG.N] =  new RPG.Misc.Coords( 0, -1);
RPG.DIR[RPG.NE] = new RPG.Misc.Coords( 1, -1);
RPG.DIR[RPG.E] =  new RPG.Misc.Coords( 1,  0);
RPG.DIR[RPG.SE] = new RPG.Misc.Coords( 1,  1);
RPG.DIR[RPG.S] =  new RPG.Misc.Coords( 0,  1);
RPG.DIR[RPG.SW] = new RPG.Misc.Coords(-1,  1);
RPG.DIR[RPG.W] =  new RPG.Misc.Coords(-1,  0);
RPG.DIR[RPG.NW] = new RPG.Misc.Coords(-1, -1);
RPG.DIR[RPG.CENTER] =  new RPG.Misc.Coords( 0,  0);

/**
 * @class Modifier interface: everything that holds feat modifiers have this
 */
RPG.Misc.IModifier = OZ.Class();

/**
 * Return modifier for a given feat
 * @param {int} feat The feat we wish to modify, specified by its constant
 */
RPG.Misc.IModifier.prototype.getModifier = function(feat) {
	return this._modifiers[feat] || 0;
}

/**
 * Return all modified feats
 */
RPG.Misc.IModifier.prototype.getModified = function() {
	var arr = [];
	for (var p in this._modifiers) { arr.push(1*p); } /* 1*p converts to int to comply with RPG.FEAT_* constants */
	return arr;
}


/**
 * @class Weapon interface. Weapon items implement this, as well as some slots and spells.
 */
RPG.Misc.IWeapon = OZ.Class();
RPG.Misc.IWeapon.prototype.setHit = function(rv) {
	this._hit = rv;
}
RPG.Misc.IWeapon.prototype.setDamage = function(rv) {
	this._damage = rv;
}
RPG.Misc.IWeapon.prototype.getHit = function() {
	return this._hit;
}
RPG.Misc.IWeapon.prototype.getDamage = function() {
	return this._damage;
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
 * @class Interface for flying objects
 * @augments RPG.Visual.IVisual
 * @augments RPG.Misc.IWeapon
 */
RPG.Misc.IProjectile = OZ.Class()
						.implement(RPG.Misc.IWeapon)
						.implement(RPG.Visual.IVisual);
RPG.Misc.IProjectile.prototype.launch = function(from, direction) {
	this._coords = from;
	this._dir = direction;
	var a = new RPG.Actions.Projectile(this);
	RPG.World.action(a);
}

/**
 * Iterate to new position
 * @returns {bool} still in flight?
 */
RPG.Misc.IProjectile.prototype.iterate = function() {
	RPG.UI.map.setProjectile(this._coords, this);
	return true;
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
 * @class Generic object factory
 */ 
RPG.Misc.Factory = OZ.Class();
RPG.Misc.Factory.prototype.init = function() {
	this._classList = [];	
}
RPG.Misc.Factory.prototype.add = function(ancestor) {
	for (var i=0;i<OZ.Class.all.length;i++) {
		var ctor = OZ.Class.all[i];
		if (ctor.factory.ignore) { continue; }
		if (this._hasAncestor(ctor, ancestor)) { 
			this._classList.push(ctor); 
		}
	}
	return this;
}
/**
 * Return a random instance
 */ 
RPG.Misc.Factory.prototype.getInstance = function(danger) {
	var len = this._classList.length;
	if (len == 0) { throw new Error("No available classes"); }

	var avail = [];
	var total = 0;
	
	for (var i=0;i<this._classList.length;i++) {
		ctor = this._classList[i];
		if (ctor.factory.danger > danger) { continue; } 
		total += ctor.factory.frequency;
		avail.push(ctor);
	}
	var random = Math.floor(Math.random()*total);
	
	var sub = 0;
	var ctor = null;
	for (var i=0;i<avail.length;i++) {
		ctor = avail[i];
		sub += ctor.factory.frequency;
		if (random < sub) { 
			if (ctor.factory.method) {
				return ctor.factory.method.call(ctor, danger);
			} else {
				return new ctor(); 
			}
		}
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
