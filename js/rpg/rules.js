/**
 * Is this door stuck?
 */
RPG.Rules.isDoorStuck = function(being, door) {
	return new RPG.Misc.Interval(1, 8).roll(1) < 2;
}

/**
 * Does this attacked hit its target?
 */
RPG.Rules.isMeleeHit = function(attacker, defender, weapon) {
	var hit = attacker.getHit(weapon);
	hit += new RPG.Misc.Interval(-3, 3).roll(1);

	var dv = defender.getDV();
//	console.log("hit("+hit+") vs. dv("+dv+")");
	return hit >= dv;
}

/**
 * TEH WIN
 */
RPG.Rules.isCritical = function(being) {
	return new RPG.Misc.Interval(3, 18).roll() < 5;
}

RPG.Rules.isFakeDetected = function(being, cell) {
	return new RPG.Misc.Interval(1, 2).roll() < 2;
}

RPG.Rules.isTrapDetected = function(being, trap) {
	return true;
}

RPG.Rules.isTrapActivated = function(being, trap) {
	return false;
}

/**
 * How much damage does this attacker with a given weapon to a defender
 */
RPG.Rules.getMeleeDamage = function(attacker, defender, weapon, isCritical) {
	var damage = attacker.getDamage(weapon);
	if (damage instanceof RPG.Misc.Interval) { damage = damage.roll(); }
	
	damage += new RPG.Misc.Interval(-3, 3).roll(1);
	
	var pv = defender.getPV();
	if (isCritical) {
		damage *= 2;
	}
//	console.log("damage("+damage+") vs. pv("+pv+")");
	return Math.max(0, damage - pv);
}

RPG.Rules.getTrapDamage = function(being, trap) {
	return 3;
}