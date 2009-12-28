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
 * TEH WIN FIXME
 */
RPG.Rules.isCritical = function(being) {
	return Math.randomPercentage() <= 5;
}

RPG.Rules.isWoundedToRetreat = function(being) {
	return (being.getStat(RPG.STAT_HP)/being.getFeat(RPG.FEAT_MAX_HP) < 0.4);
}

RPG.Rules.isProjectileRecovered = function(projectile) {
	return Math.randomPercentage() < 34;
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
 * How much damage does this trap to a being
 */
RPG.Rules.getTrapDamage = function(being, trap) {
	return trap.getDamage().roll();
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
 * Does this attacker hit its target with a spell?
 */
RPG.Rules.isSpellHit = function(attacker, defender, spell) {
	var hit = spell.getHit().roll();
	var dv = defender.getFeat(RPG.FEAT_DV);
	/* console.log("hit("+hit+") vs. dv("+dv+")"); */
	return hit >= dv;
}

/**
 * Does this attacker hit its target with a projectile?
 */
RPG.Rules.isRangedHit = function(attacker, defender, weapon) {
	var hit = weapon.getHit().roll();
	var dv = defender.getFeat(RPG.FEAT_DV);
	/* console.log("hit("+hit+") vs. dv("+dv+")"); */
	return hit >= dv;
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
 * How much damage does this spell to a being
 */
RPG.Rules.getSpellDamage = function(being, spell) {
	return spell.getDamage().roll();
}

/**
 * How much damage does this attacker with a given projectile to a defender
 */
RPG.Rules.getRangedDamage = function(attacker, defender, projectile) {
	var damage = projectile.getDamage().roll();
	var pv = defender.getFeat(RPG.FEAT_PV);
	/* console.log("damage("+damage+") vs. pv("+pv+")"); */
	return Math.max(0, damage - pv);
}
