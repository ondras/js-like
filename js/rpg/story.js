/**
 * @class Story class
 * @augments RPG.Misc.ISerializable
 */
RPG.Story = OZ.Class().implement(RPG.Misc.ISerializable);

RPG.Story.prototype.init = function() {
	this._name = OZ.DOM.elm("input", {type:"text", size:"15", font:"inherit", value: "Hero"});
	
	this._staircases = {};
	this._staircaseCallbacks = {};
	this._quests = {};
	this._questCallbacks = {};
}

RPG.Story.prototype.serialize = function(serializer) {
	var result = {
		staircases: {},
		quests: {}
	};
	
	for (var p in this._staircases) {
		result.staircases[p] = serializer.serialize(this._staircases[p]);
	}

	for (var p in this._quests) {
		result.quests[p] = serializer.serialize(this._quests[p]);
	}

	return result;
}

RPG.Story.prototype.parse = function(data, parser) {
	for (var p in data.staircases) {
		parser.parse(data.staircases[p], this._staircases, p);
	}
	for (var p in data.quests) {
		parser.parse(data.quests[p], this._quests, p);
	}
}

/**
 * Generate a PC; when this is done, call RPG.Game.setPC
 */
RPG.Story.prototype.generatePC = function() {
	var cg = new RPG.CharGen();

	var w = OZ.DOM.win()[0];
	var d = OZ.DOM.elm("div", {width:Math.round(w/2) + "px"});
	var p1 = OZ.DOM.elm("p");
	p1.innerHTML = "Who do you want to play in this game?";
	var p2 = OZ.DOM.elm("p", {className: "name"});
	p2.innerHTML = "Your name: ";
	p2.appendChild(this._name);

	OZ.DOM.append([d, p1, p2, cg.build()]);
	RPG.UI.showDialog(d, "Welcome, adventurer!");
	
	OZ.Event.add(cg, "chargen", this.bind(this._charPicked));
}

/**
 * End this story
 */
RPG.Story.prototype.end = function() {
	var pc = RPG.Game.pc;
	var div = OZ.DOM.elm("div");
	var p1 = OZ.DOM.elm("p");
	
	var str = pc.getName();
	if (pc.isAlive()) {
		str += " managed to finish the game alive!";
	} else {
		str += " was unable to surive in the dangerous dungeon.";
	}
	p1.innerHTML = str;
	
	var score = this._computeScore();
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
	if (!this._name.value) {
		this._name.focus();
		return;
	}
	
	RPG.UI.hideDialog();
	var race = e.data.race;
	var profession = e.data.profession;
	RPG.UI.build();
	
	var pc = this._createPC(race, profession, this._name.value);
	this._name = null;
	OZ.Event.add(pc, "death", this.bind(this._death));

	var map = this._firstMap();
	var cell = map.getFeatures(RPG.Features.Staircase.Up)[0].getCell();
	RPG.Game.setPC(pc, map, cell);
}

RPG.Story.prototype._createPC = function(race, profession, name) {
	var pc = new RPG.Beings.PC(new race(), new profession());
	pc.setName(name);
	return pc;
}

/**
 * PC's death
 */
RPG.Story.prototype._death = function() {
	RPG.Game.end();
}

/**
 * Generate a map
 */
RPG.Story.prototype._firstMap = function() {
	return null;
}

/**
 * Compute player's score
 */
RPG.Story.prototype._computeScore = function() {
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
