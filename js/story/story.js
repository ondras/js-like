/**
 * @class Story class
 */
RPG.Story = OZ.Class();

RPG.Story.prototype.init = function() {
	this._name = OZ.DOM.elm("input", {type:"text", size:"15", font:"inherit", value: "Hero"});
}

/**
 * Launch this story
 */
RPG.Story.prototype.go = function() {
	RPG.World.setStory(this);
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
	
	this._createPC(race, profession, this._name.value);
	var map = this._getMap();
	map.use();

	var cell = map.getFeatures(RPG.Features.Staircase.Up)[0].getCell();
	RPG.World.addActor(RPG.World.pc);	
	RPG.World.pc.move(cell);
	RPG.World.run();
}

/**
 * Build the PC
 */
RPG.Story.prototype._createPC = function(race, profession, name) {
	RPG.World.pc = new RPG.Beings.PC(new race(), new profession());
	RPG.World.pc.setName(name);
	OZ.Event.add(RPG.World.pc, "death", this.bind(this._death));
}

/**
 * PC's death
 */
RPG.Story.prototype._death = function() {
	this._endGame();
}

/**
 * Generate a map
 */
RPG.Story.prototype._getMap = function() {
	return null;
}

/**
 * Compute player's score
 */
RPG.Story.prototype._computeScore = function() {
	var pc = RPG.World.pc;
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

/**
 * End a game
 */
RPG.Story.prototype._endGame = function() {
	var pc = RPG.World.pc;
	RPG.World.lock();
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
