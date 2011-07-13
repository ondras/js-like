/**
 * @class Testbed story
 * @augments RPG.Story
 */
RPG.Story.Testbed = OZ.Class().extend(RPG.Story);

RPG.Story.Testbed.prototype._firstMap = function() {
	return [new RPG.Map.Church, new RPG.Misc.Coords(2, 10)];
}

RPG.Story.Testbed.prototype._createPC = function(race, profession, name) {
	var pc = new RPG.Beings.PC(race, profession);
	pc.setName(name);

	var beer = new RPG.Items.Beer();
	pc.addItem(beer);

/*	
	pc.adjustFeat(RPG.FEAT_MAX_MANA, 50);
	
	
	var scroll = new RPG.Items.Scroll(RPG.Spells.MagicBolt);
	scroll.setPrice(123);
	pc.addItem(scroll);

	pc.addSpell(RPG.Spells.Heal);
	pc.addSpell(RPG.Spells.MagicBolt);
	pc.addSpell(RPG.Spells.MagicExplosion);
	pc.addSpell(RPG.Spells.Fireball);
	pc.fullStats();
*/	
	return pc;
}
