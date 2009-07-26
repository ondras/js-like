/**
 * Is this door stuck?
 */
RPG.Rules.isDoorStuck = function(being, door) {
	return Math.randomPercentage() < 13;
}

/**
 * Does this attacker hit its target?
 */
RPG.Rules.isMeleeHit = function(attacker, defender, slot) {
	var hit = slot.getHit().roll();

	var dv = defender.getDV();
//	console.log("hit("+hit+") vs. dv("+dv+")");
	return hit >= dv;
}

/**
 * TEH WIN
 */
RPG.Rules.isCritical = function(being) {
	return Math.randomPercentage() <= 5;
}

RPG.Rules.isFakeDetected = function(being, cell) {
	return Math.randomPercentage() <= 50;
}

RPG.Rules.isTrapDetected = function(being, trap) {
	return true;
}

RPG.Rules.isTrapActivated = function(being, trap) {
	return false;
}

/**
 * How much damage does this attacker with a given slot to a defender
 */
RPG.Rules.getMeleeDamage = function(attacker, defender, slot, isCritical) {
	var damage = slot.getDamage().roll();
	if (isCritical) { damage *= 2; }

	var pv = defender.getPV();
//	console.log("damage("+damage+") vs. pv("+pv+")");
	return Math.max(0, damage - pv);
}

RPG.Rules.getTrapDamage = function(being, trap) {
	/* FIXME */
	return 3;
}
