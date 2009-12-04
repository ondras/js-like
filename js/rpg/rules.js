/**
 * Game mechanics defined here
 */

/**
 * Is this door stuck?
 */
RPG.Rules.isDoorStuck = function(being, door) {
	return Math.randomPercentage() < 13;
}

/**
 * Does this attacker hit its target?
 */
RPG.Rules.isMeleeHit = function(attacker, defender, weapon) {
	var hit = weapon.getHit().roll();
	var dv = defender.getFeat(RPG.FEAT_DV);
	/* console.log("hit("+hit+") vs. dv("+dv+")"); */
	return hit >= dv;
}

/**
 * TEH WIN FIXME
 */
RPG.Rules.isCritical = function(being) {
	return Math.randomPercentage() <= 5;
}

RPG.Rules.isWoundedToRetreat = function(being) {
	return (being.getStat(RPG.STAT_HP)/being.getFeat(RPG.FEAT_MAXHP) < 0.4);
}

RPG.Rules.isFakeDetected = function(being, cell) {
	return Math.randomPercentage() <= 67;
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
	var damage = weapon.getDamage().roll();
	if (isCritical) { damage *= 2; }

	var pv = defender.getFeat(RPG.FEAT_PV);
	/* console.log("damage("+damage+") vs. pv("+pv+")"); */
	return Math.max(0, damage - pv);
}

/**
 * How much damage does this trap to a being
 */
RPG.Rules.getTrapDamage = function(being, trap) {
	return trap.getDamage().roll();
}

/**
 * How much damage does this trap to a being
 */
RPG.Rules.getSpellDamage = function(being, spell) {
	return spell.getDamage().roll();
}
