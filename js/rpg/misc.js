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
 * Direction to another coords
 * @param {RPG.Misc.Coords} c
 * @returns {int}
 */
RPG.Misc.Coords.prototype.dirTo = function(c) {
	var diff = c.clone().minus(this);
	for (var i=0;i<8;i++) {
		var dir = RPG.DIR[i];
		if (dir.x == diff.x && dir.y == diff.y) { return i; }
	}
	throw new Error("Cannot compute direction");
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
 * @augments RPG.Misc.IVisual
 * @augments RPG.Misc.IWeapon
 */
RPG.Misc.IProjectile = OZ.Class()
						.implement(RPG.Misc.IWeapon)
						.implement(RPG.Misc.IVisual);

RPG.Misc.IProjectile.prototype._initProjectile = function() {
	this._range = 5;
	this._baseImage = "";
	this._lastCell = null;
	this._cells = [];
	this._cellIndex = -1;
	
	this._chars = {};
	this._chars[RPG.N]  = "|";
	this._chars[RPG.NE] = "/";
	this._chars[RPG.E]  = "–";
	this._chars[RPG.SE] = "\\";
	this._chars[RPG.S]  = "|";
	this._chars[RPG.SW] = "/";
	this._chars[RPG.W]  = "–";
	this._chars[RPG.NW] = "\\";
	
	this._suffixes = {};
	this._suffixes[RPG.N]  = "n";
	this._suffixes[RPG.NE] = "ne";
	this._suffixes[RPG.E]  = "e";
	this._suffixes[RPG.SE] = "se";
	this._suffixes[RPG.S]  = "s";
	this._suffixes[RPG.SW] = "sw";
	this._suffixes[RPG.W]  = "w";
	this._suffixes[RPG.NW] = "nw";
}
						
/**
 * Launch this projectile
 * @param {RPG.Cells.BaseCell} source
 * @param {?} target
 */
RPG.Misc.IProjectile.prototype.launch = function(source, target) {
	this._lastCell = source;
	this._cells = this._getTrajectory(source, target);
	this._cellIndex = 0;

	RPG.World.lock();
	var interval = 75;
	this._interval = setInterval(this.bind(this._step), interval);
}

/**
 * Flying above a given cell
 * @returns {bool} still in flight?
 */
RPG.Misc.IProjectile.prototype.fly = function(cell) {
	RPG.UI.map.addProjectile(cell.getCoords(), this);
	return true;
}

/**
 * Preview projectile's planned trajectory
 * @param {RPG.Cells.BaseCell} source
 * @param {?} target
 */
RPG.Misc.IProjectile.prototype.showTrajectory = function(source, target) {
	var cells = this._getTrajectory(source, target);
	var pc = RPG.World.pc;
	
	RPG.UI.map.removeProjectiles();
	for (var i=0;i<cells.length;i++) {
		var cell = cells[i];
		
		if (!pc.canSee(cell.getCoords())) { continue; }
		
		var mark = (i+1 == cells.length ? RPG.Misc.IProjectile.endMark : RPG.Misc.IProjectile.mark);
		RPG.UI.map.addProjectile(cells[i].getCoords(), mark);
	}
}

RPG.Misc.IProjectile.prototype._step = function() {
	if (this._cellIndex == this._cells.length) { 
		clearInterval(this._interval); 
		this._done();
		return;
	}

	var current = this._cells[this._cellIndex];
	var dir = this._lastCell.getCoords().dirTo(current.getCoords());
	this._lastCell = current;
	
	this._char = this._chars[dir];
	this._image = this._baseImage + "-" + this._suffixes[dir];

	this.fly(current);
	this._cellIndex++;
}

RPG.Misc.IProjectile.prototype._done = function() {
	RPG.UI.map.removeProjectiles();
	RPG.World.unlock();
}

/**
 * Get all cells in trajectory
 * @param {RPG.Cells.BaseCell} source
 * @param {RPG.Misc.Coords} target
 */
RPG.Misc.IProjectile.prototype._getTrajectory = function(source, target) {
	var map = RPG.World.getMap();
	var cells = map.cellsInLine(source.getCoords(), target);
	cells.shift();
	
	var result = [];
	var max = Math.min(this._range, cells.length);
	
	for (var i=0;i<max;i++) {
		var cell = cells[i];
		result.push(cell);
		
		if (!cell.isFree()) { break; }
	}
	
	return result;
}

/**
 * @class Projectile mark
 * @augments RPG.IVisual
 */
RPG.Misc.IProjectile.Mark = OZ.Class().implement(RPG.Misc.IVisual);
RPG.Misc.IProjectile.Mark.prototype.init = function() {
	this._char = "*";
	this._color = "white";
	this._image = ""; /* FIXME */
}

/**
 * @class Projectile end mark
 * @augments RPG.IVisual
 */
RPG.Misc.IProjectile.EndMark = OZ.Class().implement(RPG.Misc.IVisual);
RPG.Misc.IProjectile.EndMark.prototype.init = function() {
	this._char = "X";
	this._color = "white";
	this._image = ""; /* FIXME */
}

RPG.Misc.IProjectile.mark = new RPG.Misc.IProjectile.Mark();
RPG.Misc.IProjectile.endMark = new RPG.Misc.IProjectile.EndMark();

/**
 * @class Actor interface
 */
RPG.Misc.IActor = OZ.Class();
RPG.Misc.IActor.prototype.getSpeed = function() {};
/**
 * World asks actor to perform an action
 */ 
RPG.Misc.IActor.prototype.yourTurn = function() {
	return RPG.ACTION_TIME;
}

/**
 * @class Chat - hierarchical dialog structure
 */
RPG.Misc.Chat = OZ.Class();
RPG.Misc.Chat.prototype.init = function(text) {
	this._text = text;
	this._options = [];
	this._sound = null;
	this._end = null;
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
RPG.Misc.Chat.prototype.getSound = function() {
	return this._sound;
}
RPG.Misc.Chat.prototype.setSound = function(sound) {
	this._sound = sound;
	return this;
}
RPG.Misc.Chat.prototype.getEnd = function() {
	return this._end;
}
RPG.Misc.Chat.prototype.setEnd = function(end) {
	this._end = end;
	return this;
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
 * Return a random class
 */ 
RPG.Misc.Factory.prototype.getClass = function(danger) {
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
		if (random < sub) { return ctor; }
	}
}

/**
 * Return a random instance
 */ 
RPG.Misc.Factory.prototype.getInstance = function(danger) {
	var ctor = this.getClass(danger);
	if (ctor.factory.method) {
		return ctor.factory.method.call(ctor, danger);
	} else {
		return new ctor(); 
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

/**
 * @class Speed-based scheduler
 */
RPG.Misc.Scheduler = OZ.Class();
RPG.Misc.Scheduler.prototype.init = function() {
	this._actors = [];
	this._current = [];
	this._maxSpeed = 0;
}

RPG.Misc.Scheduler.prototype.addActor = function(actor) {
	var o = {
		actor: actor,
		bucket: 0,
		speed: 0
	}
	this._actors.push(o);
	return this;
}

RPG.Misc.Scheduler.prototype.clearActors = function() {
	this._actors = [];
	this._current = [];
	return this;
}

RPG.Misc.Scheduler.prototype.removeActor = function(actor) {
	for (var i=0;i<this._actors.length;i++) {
		if (this._actors[i].actor == actor) { 
			this._actors.splice(i, 1); 
			break;
		}
	}
	
	for (var i=0;i<this._current.length;i++) {
		if (this._current[i].actor == actor) { 
			this._current.splice(i, 1); 
			break;
		}
	}

	return this;
}

RPG.Misc.Scheduler.prototype.scheduleActor = function() {
	if (!this._actors.length) { return null; }

	/* if there is a set of pre-scheduled actors */
	if (this._current.length) {
		var o = this._current.shift();
		o.bucket -= this._maxSpeed;
		return o.actor;
	}
	
	/* update speeds */
	this._maxSpeed = 0;
	for (var i=0;i<this._actors.length;i++) {
		var obj = this._actors[i];
		obj.speed = obj.actor.getSpeed();
		if (obj.speed > this._maxSpeed) { this._maxSpeed = obj.speed; }
	}
	
	/* increase buckets and determine those eligible for a turn */
	do {
		
		for (var i=0;i<this._actors.length;i++) {
			var obj = this._actors[i];
			obj.bucket += obj.speed;
			if (obj.bucket >= this._maxSpeed) { this._current.push(obj); }
		}
	
	}  while (!this._current.length);
	
	/* sort eligible actors by their buckets */
	this._current.sort(function(a,b) {
		return b.bucket - a.bucket;
	});
	
	/* recurse */
	return arguments.callee.apply(this, arguments);
	
}

/**
 * Format a string in a printf-like fashion
 * @param {string} formatStr Formatting string to be substituted
 */
RPG.Misc.format = function(formatStr) {
	var args = arguments;
	var index = 0;
	return formatStr.replace(/%([a-zA-Z]+)/g, function(match, what) {
		if (index+1 < args.length) { index++; }
		var obj = args[index];
		var str = what;
		switch (what.toLowerCase()) {
			case "a": str = obj.describeA(); break;
			case "the": str = obj.describeThe(); break;
			case "d": str = obj.describe(); break;
			case "he": str = obj.describeHe(); break;
			case "him": str = obj.describeHim(); break;
			case "his": str = obj.describeHis(); break;
			case "is": str = obj.describeIs(); break;
			case "s": str = obj; break;
		}
		
		if (what.charAt(0) != what.charAt(0).toLowerCase()) { str = str.capitalize(); }
		return str;
	});
}

RPG.Misc.verb = function(verb, who) {
	return (who == RPG.World.pc ? verb : verb+"s");
}

