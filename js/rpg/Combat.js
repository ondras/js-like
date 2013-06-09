/**
 * @class Combat context
 */
RPG.Combat = OZ.Class();

/**
 * @param {RPG.Misc.IDamageDealer} attacker
 * @param {RPG.Misc.IDamageReceiver} defender
 */
RPG.Combat.prototype.init = function(attacker, defender) {
	this._attacker = attacker;
	this._defender = defender;
	this._hit = false;
	this._kill = false;
	this._damage = 0;
}

RPG.Combat.prototype.getAttacker = function() {
	return this._attacker;
}

RPG.Combat.prototype.getDefender = function() {
	return this._defender;
}

RPG.Combat.prototype.wasHit = function() {
	return this._hit;
}

RPG.Combat.prototype.wasKill = function() {
	return this._kill;
}

RPG.Combat.prototype.getDamage = function() {
	return this._damage;
}

RPG.Combat.prototype._luckCheck = function(who) {
	return (Math.random()*200 < who.getLuck());
}

RPG.Combat.prototype.execute = function() {
	//console.debug("***Combat***");
	//console.debug("   Attacker: " + this._attacker );
	//console.debug("   Defender: " + this._defender 
	//	+ "\tDV:" + this._defender.getDV()
	//	+ "\tPV:" + this._defender.getPV() );


	/* check hit */
	var hit = this._attacker.getHit().roll();  
	var dv = this._defender.getDV();
	
	if (hit >= dv) { /* hit */
		//console.debug("   To-hit roll:" + hit + " - Hit");   
		//console.debug("   Hit");
		if (this._luckCheck(this._defender)) {
			//console.debug("   lucky defender evades");
			return this; } /* lucky, evaded */
	} else { /* missed */
		//console.debug("   To-hit roll:" + hit + " - Miss");   
		if (!this._luckCheck(this._attacker)) { return this; }/* no luck, miss */
		//console.debug("   lucky attacker hits after all");
	}
	this._hit = true;

	/* compute damage */
	var damage = this._attacker.getDamage().roll();
	//console.debug("   Damage roll:" + damage);
	if (this._luckCheck(this._attacker)) { damage *= 2; /*console.debug("   lucky attacker gets it doubled");*/}
	
	/* spells ignore pv */
	var pv = (this._attacker instanceof RPG.Spells.Attack ? 0 : this._defender.getPV());
	this._damage = Math.max(0, damage - pv);
	//console.debug("   damage modified to " + this._damage);
	if (!this._damage) { return this; }

	/* deal damage */
	this._defender.damage(this._damage);
	this._kill = !this._defender.isAlive();
	//if(this._kill) console.debug("   Killed!");
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

