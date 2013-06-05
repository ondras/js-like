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
	console.debug("***Combat***");
	console.debug("Def PV:" + this._defender.getPV() );
	console.debug("Def DV:" + this._defender.getDV() );

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
 * @returns {RPG.RandomValue}
 */
RPG.Misc.IDamageDealer.prototype.getHit = function() {
	return this._hit;
}
/**
 * @returns {RPG.RandomValue}
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
