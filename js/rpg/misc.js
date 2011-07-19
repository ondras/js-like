/**
 * @class Random value - generalized throwing dice
 */
RPG.Misc.RandomValue = OZ.Class();
RPG.Misc.RandomValue.prototype.init = function(mean, twosigma) {
	this.mean = mean;
	this.twosigma = twosigma;
}

RPG.Misc.RandomValue.prototype.toString = function() {
	return this.mean + "±" + this.twosigma;
}

/**
 * Roll the dice.
 */
RPG.Misc.RandomValue.prototype.roll = function() {
	var value = Math.round(this.mean + Math.randomNormal(this.twosigma/2));
	return Math.max(0, value);
}

/**
 * Add another random value or a number
 * @param {RPG.Misc.RandomValue || number}
 */
RPG.Misc.RandomValue.prototype.add = function(rv) {
	if (typeof(rv) == "number") { return new this.constructor(this.mean+rv, this.twosigma); }

	var m = this.mean + rv.mean;
	var ts = Math.sqrt(this.twosigma*this.twosigma + rv.twosigma*rv.twosigma);
	return new this.constructor(m, ts);
}

/**
 * @class Coordinates
 */
RPG.Misc.Coords = OZ.Class();
RPG.Misc.Coords.fromString = function(str) {
	var parts = str.split(",");
	return new this(parseInt(parts[0]), parseInt(parts[1]));
}

RPG.Misc.Coords.prototype.init = function(x, y) {
	this.x = x;
	this.y = y;
}

RPG.Misc.Coords.prototype.toString = function() {
	return this.x+","+this.y;
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

RPG.Misc.Coords.prototype.equals = function(c) {
	return (this.x == c.x && this.y == c.y);
}

RPG.Misc.Coords.prototype.neighbor = function(dir) {
	return this.clone().plus(RPG.DIR[dir]);
}

/**
 * Direction to another coords
 * @param {RPG.Misc.Coords} c
 * @returns {int}
 */
RPG.Misc.Coords.prototype.dirTo = function(c) {
	if (c.x == this.x && c.y == this.y) { return RPG.CENTER; }
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
 * Return modifiers for all feats
 */
RPG.Misc.IModifier.prototype.getModifiers = function() {
	return this._modifiers;
}

/**
 * @class Interface for flying objects
 */
RPG.Misc.IProjectile = OZ.Class();
RPG.Misc.IProjectile.prototype._range = 5;
RPG.Misc.IProjectile.prototype._initProjectile = function() {
	this._flying = false;
	
	this._flight = {
		index: -1,
		coords: [],
		dirs: []
	}
	
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

RPG.Misc.IProjectile.prototype._getFlightVisualProperty = function(name) {
	if (!this._flying) { return null; }
	
	/* we are in flight, use special visual representation */
	var index = this._flight.index;
	var dir = this._flight.dirs[index];
	
	if (name == "ch") { return this._chars[dir]; }
	if (name == "image") { 
		var suffix = this._suffixes[dir];
		if (!suffix) { return null; }
		return this.getVisualProperty("image") + "-" + suffix; 
	}
}

RPG.Misc.IProjectile.prototype.getRange = function() {
	return this._range;
}

/**
 * Launch this projectile
 * @param {RPG.Misc.Coords} source
 * @param {RPG.Misc.Coords} target
 * @param {RPG.Map} map
 */
RPG.Misc.IProjectile.prototype.launch = function(source, target, map) {
	this.computeTrajectory(source, target, map);
	this._flying = true;
	this._flight.index = 0; /* starting from first coords in line */
	RPG.Game.getEngine().lock();
	var interval = 75;
	this._interval = setInterval(this.bind(this._step), interval);
}

/**
 * Flying...
 */
RPG.Misc.IProjectile.prototype._fly = function() {
	var coords = this._flight.coords[this._flight.index];
	RPG.UI.map.addProjectile(coords, this);
}

/**
 * Preview projectile's planned trajectory
 * @param {RPG.Misc.Coords} source
 * @param {RPG.Misc.Coords} target
 * @param {RPG.Map} map
 */
RPG.Misc.IProjectile.prototype.showTrajectory = function(source, target, map) {
	this.computeTrajectory(source, target, map);
	var pc = RPG.Game.pc;
	
	RPG.UI.map.removeProjectiles();
	for (var i=1;i<this._flight.coords.length;i++) {
		var coords = this._flight.coords[i];
		if (!pc.canSee(coords)) { continue; }
		
		var mark = (i+1 == this._flight.coords.length ? RPG.Misc.IProjectile.endMark : RPG.Misc.IProjectile.mark);
		RPG.UI.map.addProjectile(coords, mark);
	}
}

RPG.Misc.IProjectile.prototype._step = function() {
	this._flight.index++;
	var index = this._flight.index;
	
	if (index == this._flight.coords.length) { 
		clearInterval(this._interval); 
		this._flightDone();
		return;
	}
	
	this._fly(this._flight.coords[index]);
}

RPG.Misc.IProjectile.prototype._flightDone = function() {
	this._flying = false;
	RPG.UI.map.removeProjectiles();
	RPG.Game.getEngine().unlock();
}

/**
 * Precompute trajectory + its visuals. Stop at first non-free coords.
 * @param {RPG.Misc.Coords} source
 * @param {RPG.Misc.Coords} target
 * @param {RPG.Map} map
 */
RPG.Misc.IProjectile.prototype.computeTrajectory = function(source, target, map) {
	this._flight.index = 0;
	this._flight.coords = [];
	this._flight.dirs = [];

	var coords = map.getCoordsInLine(source, target);
	var max = Math.min(this.getRange()+1, coords.length);

	for (var i=0;i<max;i++) {
		var c = coords[i];
		this._flight.coords.push(c);
		this._flight.dirs.push(i ? this._flight.coords[i-1].dirTo(c) : null);
		if (i && map.blocks(RPG.BLOCKS_MOVEMENT, c)) { break; } /* stop at non-starting blocking cell */
	}
	
	return this._flight;
}

/**
 * @class Projectile mark
 * @augments RPG.Visual.IVisual
 */
RPG.Misc.IProjectile.Mark = OZ.Class().implement(RPG.Visual.IVisual);
RPG.Misc.IProjectile.Mark.visual = { ch:"*", color:"#fff", image:"crosshair", path:"misc" };
RPG.Misc.IProjectile.mark = new RPG.Misc.IProjectile.Mark();

/**
 * @class Projectile end mark
 * @augments RPG.Visual.IVisual
 */
RPG.Misc.IProjectile.EndMark = OZ.Class().implement(RPG.Visual.IVisual);
RPG.Misc.IProjectile.EndMark.visual = { ch:"X", color:"#fff", image:"crosshair-end", path:"misc" };
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
RPG.Misc.IActor.prototype.getEffects = function() {
	return [];
}

/**
 * @class Dialog interface
 */
RPG.Misc.IDialog = OZ.Class();

RPG.Misc.IDialog.prototype.getDialogText = function(being) {
	return null;
}

RPG.Misc.IDialog.prototype.getDialogSound = function(being) {
	return null;
}

RPG.Misc.IDialog.prototype.getDialogOptions = function(being) {
	return [];
}

/**
 * @returns {bool} Should the conversation continue?
 */
RPG.Misc.IDialog.prototype.advanceDialog = function(optionIndex, being) {
	return false;
}

/**
 * @class Interface for enterable objects (cells, areas, maps)
 * @augments RPG.Misc.IModifier
 */
RPG.Misc.IEnterable = OZ.Class()
						.extend(RPG.Misc.IModifier);

/**
 * Called only when from != this
 * @param {RPG.Beings.BaseBeing} being Someone who just came here
 */
RPG.Misc.IEnterable.prototype.entering = function(being) {
	being.addModifiers(this);
};

/**
 * Called only when to != this
 * @param {RPG.Beings.BaseBeing} being Someone who is just leaving
 */
RPG.Misc.IEnterable.prototype.leaving = function(being) {
	being.removeModifiers(this);
};

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
		if (!ctor.factory.frequency) { continue; }
		if (this._hasAncestor(ctor, ancestor)) { this._classList.push(ctor); }
	}
	return this;
}

/**
 * Return a random class
 * @param {int} danger Highest danger available
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
 * @param {int} danger Highest danger available
 */ 
RPG.Misc.Factory.prototype.getInstance = function(danger) {
	var ctor = this.getClass(danger);
	if (ctor.factory.method) {
		return ctor.factory.method.call(ctor, danger);
	} else {
		return new ctor(); 
	}
}

/**
 * Create all available instances
 */
RPG.Misc.Factory.prototype.getAllInstances = function(danger) {
	var result = [];
	
	for (var i=0;i<this._classList.length;i++) {
		ctor = this._classList[i];
		if (ctor.factory.danger > danger) { continue; } 
		if (ctor.factory.method) {
			var inst = ctor.factory.method.call(ctor, danger);
		} else {
			var inst = new ctor(); 
		}
		result.push(inst);
	}
	
	return result;
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
}

RPG.Misc.Scheduler.prototype.addActor = function(actor) {
	var o = {
		actor: actor,
		bucket: 1/actor.getSpeed()
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
	var a = null;
	for (var i=0;i<this._actors.length;i++) {
		a = this._actors[i];
		if (a.actor == actor) { 
			this._actors.splice(i, 1); 
			break;
		}
	}
	
	return this;
}

RPG.Misc.Scheduler.prototype.scheduleActor = function() {
	if (!this._actors.length) { return null; }

	var minBucket = Infinity;
	var minActor = null;

	for (var i=0;i<this._actors.length;i++) {
		var actor = this._actors[i];
		if (actor.bucket < minBucket) {
			minBucket = actor.bucket;
			minActor = actor;
		} else if (actor.bucket == minBucket && actor.actor.getSpeed() > minActor.actor.getSpeed()) {
			minActor = actor;
		}
	}
	
	if (minBucket) { /* non-zero value; subtract from all buckets */
		for (var i=0;i<this._actors.length;i++) {
			var actor = this._actors[i];
			actor.bucket = Math.max(0, actor.bucket - minBucket);
		}
	}
	
	minActor.bucket += 1/minActor.actor.getSpeed();
	return minActor.actor;
}

/**
 * @class Feat
 */
RPG.Misc.Feat = OZ.Class();

RPG.Misc.Feat.prototype.init = function(name, description, options) {
	this._options = {
		average: 11,
		upgrade: 1
	}
	for (var p in options) { this._options[p] = options[p]; }
	this._name = name;
	this._description = description;
	this.parentModifiers = {};
}

RPG.Misc.Feat.prototype._drd = function(value) {
	return (-11*10/21 + (value * 10/21));
}

RPG.Misc.Feat.prototype.getName = function() {
	return this._name;
}

RPG.Misc.Feat.prototype.getDescription = function() {
	return this._description;
}

RPG.Misc.Feat.prototype.getAverage = function() {
	return this._options.average;
}

RPG.Misc.Feat.prototype.getUpgrade = function() {
	return this._options.upgrade;
}

/**
 * normalize to average=11, upgrade=1 
 */
RPG.Misc.Feat.prototype.normalize = function(value) {
	return Math.round(11 + (value-this._options.average) / this._options.upgrade);
}

/**
 * @class Combat context
 */
RPG.Misc.Combat = OZ.Class();

/**
 * @param {RPG.Misc.IDamageDealer} attacker
 * @param {RPG.Misc.IDamageReceiver} defender
 */
RPG.Misc.Combat.prototype.init = function(attacker, defender) {
	this._attacker = attacker;
	this._defender = defender;
	
	this._hit = false;
	this._kill = false;
	this._damage = 0;
}

RPG.Misc.Combat.prototype.getAttacker = function() {
	return this._attacker;
}

RPG.Misc.Combat.prototype.getDefender = function() {
	return this._defender;
}

RPG.Misc.Combat.prototype.wasHit = function() {
	return this._hit;
}

RPG.Misc.Combat.prototype.wasKill = function() {
	return this._kill;
}

RPG.Misc.Combat.prototype.getDamage = function() {
	return this._damage;
}

RPG.Misc.Combat.prototype._luckCheck = function(who) {
	return (Math.random()*200 < who.getLuck());
}

RPG.Misc.Combat.prototype.execute = function() {
	/* check hit */
	var hit = this._attacker.getHit().roll();
	var dv = this._defender.getDV();
	
	if (hit >= dv) { /* hit */
		if (this._luckCheck(this._defender)) { return this; } /* lucky, evaded */
	} else { /* missed */
		if (!this._luckCheck(this._attacker)) { return this; }/* no luck, miss */
	}
	this._hit = true;

	/* compute damage */
	var damage = this._attacker.getDamage().roll();
	if (this._luckCheck(this._attacker)) { damage *= 2; }
	
	/* spells ignore pv */
	var pv = (this._attacker instanceof RPG.Spells.Attack ? 0 : this._defender.getPV());
	this._damage = Math.max(0, damage - pv);
	if (!this._damage) { return this; }
	
	/* deal damage */
	this._defender.damage(this._damage);
	this._kill = !this._defender.isAlive();
	return this;
}

/**
 * @class Damage dealer interface - everything which deals damage (damaging slots, projectiles, attack spells)
 */
RPG.Misc.IDamageDealer = OZ.Class();

/**
 * @returns {RPG.Misc.RandomValue}
 */
RPG.Misc.IDamageDealer.prototype.getHit = function() {
	return this._hit;
}
/**
 * @returns {RPG.Misc.RandomValue}
 */
RPG.Misc.IDamageDealer.prototype.getDamage = function() {
	return this._damage;
}
RPG.Misc.IDamageDealer.prototype.getLuck = function() {
	return 0;
}

/**
 * @class Damage receiver interface - everything which receives damage
 */
RPG.Misc.IDamageReceiver = OZ.Class();
RPG.Misc.IDamageReceiver.prototype.getDV = function() {
	return 0;
}
RPG.Misc.IDamageReceiver.prototype.getPV = function() {
	return 0;
}
RPG.Misc.IDamageReceiver.prototype.getLuck = function() {
	return 0;
}
RPG.Misc.IDamageReceiver.prototype.damage = function(amount) {
}
RPG.Misc.IDamageReceiver.prototype.isAlive = function() {
	return false;
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
	return (who == RPG.Game.pc ? verb : verb+"s");
}
