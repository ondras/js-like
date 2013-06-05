/**
 * @class Debug story
 * @augments RPG.Story
 */
RPG.Story.Debug = OZ.Class().extend(RPG.Story);

RPG.Story.Debug.prototype._firstMap = function() {
	var r = document.location.search.match(/debug\/(.*)/) || [];
	
	if (r[1] == "church") {
		var church = new RPG.Map.Church();
		return [church, new RPG.Coords(3, 9)];
	}

	if (r[1] == "crossroads") {
		var crossroads = new RPG.Map.Crossroads();
		return [crossroads, new RPG.Coords(3, 9)];
	}

	if (r[1] == "items") {
		var arena = RPG.Generators.Arena.getInstance().generate("debug", new RPG.Coords(60, 20), 1);
		var items = RPG.Factories.items.getAllInstances();
		for (var i=0;i<items.length;i++) {
			var coords = this._indexToCoords(i);
			coords.x++;
			coords.y++;
			arena.addItem(items[i], coords);
		}
		return [arena, new RPG.Coords(1, 18)];
	}
	
	if (r[1] == "beings") {
		var arena = RPG.Generators.Arena.getInstance().generate("debug", new RPG.Coords(60, 20), 1);
		var npcs = RPG.Factories.npcs.getAllInstances();
		for (var i=0;i<npcs.length;i++) {
			var coords = this._indexToCoords(i);
			coords.x++;
			coords.y++;
			arena.setBeing(npcs[i], coords);
		}
		return [arena, new RPG.Coords(1, 18)];
	}

	var map = RPG.Generators.Uniform.getInstance().generate("debug", new RPG.Coords(60, 20), 1);
	return [map, map.getFreeCoords()];
}

RPG.Story.Debug.prototype._createPC = function(race, profession, name) {
	var pc = new RPG.Beings.God(race, profession);
	pc.setName(name);

	var beer = new RPG.Items.Beer();
	pc.addItem(beer);

	pc.adjustFeat(RPG.FEAT_MAX_MANA, 50);
	
	/*
	var scroll = new RPG.Items.Scroll(RPG.Spells.MagicBolt);
	scroll.setPrice(123);
	*/

	pc.addItem(new RPG.Items.Rock().setAmount(5));

	pc.addSpell(RPG.Spells.Heal);
	pc.addSpell(RPG.Spells.MagicBolt);
	pc.addSpell(RPG.Spells.MagicExplosion);
	pc.addSpell(RPG.Spells.Fireball);
	pc.fullStats();
	
	return pc;
}

RPG.Story.Debug.prototype._indexToCoords = function(index) {
	var result = new RPG.Coords(0, 0);
	var num = Math.floor((-1 + Math.sqrt(1 + 8*(index)))/2); /* which diagonal (starting from 0) */
	var maxPrev = num*(num+1)/2; /* first number on this diagonal */
	result.x = index-maxPrev;
	result.y = num-result.x;
	return result;
}
