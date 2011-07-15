/**
 * Game mechanics defined here
 */

/**
 * Is this door stuck?
 */
RPG.Rules.isDoorStuck = function(being, door) {
	return Math.randomPercentage() < 13;
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

RPG.Rules.isCorpseGenerated = function(being) {
	return Math.randomPercentage() < 34;
}

/**
 * Luck check
 */
RPG.Rules.isLucky = function(being) {
	var luck = being.getFeat(RPG.FEAT_LUCK);
	return Math.random()*200 <= luck;
}

RPG.Rules.isWoundedToRetreat = function(being) {
	return (being.getStat(RPG.STAT_HP)/being.getFeat(RPG.FEAT_MAX_HP) < 0.4);
}

RPG.Rules.isProjectileRecovered = function(projectile) {
	return Math.randomPercentage() < 34;
}

/**
 * How much damage does this trap to a being
 */
RPG.Rules.getTrapDamage = function(being, trap) {
	return trap.getDamage().roll();
}

RPG.Rules.isItemDropped = function(being, item) {
	return (Math.randomPercentage() < 81);
}

/**
 * How much hitpoints is regenerated using a spell
 * @param {RPG.Beings.BaseBeing} caster
 * @param {RPG.Beings.BaseBeing} target
 */
RPG.Rules.getHealingAmount = function(caster, target) {
	return 5;
}
