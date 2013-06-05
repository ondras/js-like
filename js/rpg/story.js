/**
 * @class Story class
 */
RPG.Story = OZ.Class();

RPG.Story.prototype.init = function() {
	this._staircases = {};
	this._staircaseCallbacks = {};
	this._quests = {};
	this._questCallbacks = {};
	this._pc = null;
}

RPG.Story.prototype.revive = function() {
	this._addDeathEvent();
}

/**
 * Generate a PC; when this is done, call RPG.Game.startMap
 */
RPG.Story.prototype.generatePC = function() {
	var cg = new RPG.CharGen();
	RPG.UI.showDialog(cg.build(), "Welcome, adventurer!");
	OZ.Event.add(cg, "chargen", this.bind(this._charPicked));
}

/**
 * End this story
 */
RPG.Story.prototype.end = function() {
	var pc = this._pc;
	var div = OZ.DOM.elm("div");
	var p1 = OZ.DOM.elm("p");
	
	var str = pc.getName();
	if (pc.isAlive()) {
		str += " managed to finish the game alive!";
		RPG.Stats.send(RPG.Stats.END);
	} else {
		str += " was unable to surive this dangerous adventure.";
		RPG.Stats.send(RPG.Stats.DEATH);
	}
	p1.innerHTML = str;
	
	var score = this.computeScore();
	var p2 = OZ.DOM.elm("p");
	p2.innerHTML = "He managed to kill <strong>" + pc.getKills() + "</strong> monsters with a total score: <strong>" + score + "</strong>";
	
	var p3 = OZ.DOM.elm("p");
	p3.innerHTML = "<a href='javascript:location.reload()'>Again?</a>";

	OZ.DOM.append([div, p1, p2, p3]);
	RPG.UI.showDialog(div, "Game over");
}

/**
 * Create endpoint for this staircase
 */
RPG.Story.prototype.staircaseCallback = function(staircase) {
	for (var p in this._staircases) {
		if (this._staircases[p] == staircase) { return this._staircaseCallbacks[p].call(this, staircase); }
	}
	return null;
}

/**
 * Quest requires attention
 */
RPG.Story.prototype.questCallback = function(quest) {
	for (var p in this._quests) {
		if (this._quests[p] == quest) { return this._questCallbacks[p].call(this, quest); }
	}
	return null;
}


/**
 * User picked his character, create it and launch
 */
RPG.Story.prototype._charPicked = function(e) {
	RPG.UI.hideDialog();
	var race = e.data.race;
	var profession = e.data.profession;
	var name = e.data.name;
	RPG.UI.build();
	
	this._pc = this._createPC(race, profession, name);
	this._addDeathEvent();
	RPG.Game.pc = this._pc;
	
	RPG.Stats.send(RPG.Stats.NEW);
	var first = this._firstMap();
	RPG.Game.startMap(first[0], first[1]);
}

RPG.Story.prototype._createPC = function(race, profession, name) {
	var pc = new RPG.Beings.PC(race, profession);
	pc.setName(name);
	return pc;
}

RPG.Story.prototype._addDeathEvent = function() {
	RPG.Game.addEvent(this._pc, "being-death", this.bind(this._death));
}
	
/**
 * PC's death
 */
RPG.Story.prototype._death = function() {
	RPG.Game.end();
}

/**
 * Generate a map + starting coords
 * @returns {[RPG.Map, RPG.Coords]}
 */
RPG.Story.prototype._firstMap = function() {
	return [null, null];
}

/**
 * Compute player's score
 */
RPG.Story.prototype.computeScore = function() {
	var pc = RPG.Game.pc;
	var total = 0;
	
	total += 20 * pc.getKills();
	
	var items = pc.getItems();
	for (var i=0;i<items.length;i++) {
		var item = items[i];
		if (item instanceof RPG.Items.Gold) { total += item.getAmount(); }
		if (item instanceof RPG.Items.Gem) { total += 100; }
	}
	
	if (pc.isAlive()) {
		total = total * 2;
	}
	
	return total;
}
