/**
 * @class Story class
 */
RPG.Story = OZ.Class();

RPG.Story.prototype.init = function() {
	RPG.UI.sound.preload("tristram");
	this._maxDepth = 3;
	this._maps = [];
	this._name = OZ.DOM.elm("input", {type:"text", size:"15", font:"inherit", value: "Hero"});
//	this._chat = this._buildChat();
	this._mapgen = new RPG.Generators.Digger(new RPG.Misc.Coords(60, 20));

}

RPG.Story.prototype.go = function() {
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
	
	OZ.Event.add(cg, "chargen", this.bind(this._charGen));
}

RPG.Story.prototype._charGen = function(e) {
	if (!this._name.value) {
		this._name.focus();
		return;
	}
	
	RPG.UI.hideDialog();
	
	var race = e.data.race;
	var profession = e.data.profession;
	
	RPG.UI.build();
	this._pc = this._createPC(race, profession, this._name.value);
	
	var map = this._firstMap();
	map.use();

	RPG.World.addActor(this._pc);
	
	var cell = map.getFeatures(RPG.Features.Staircase.Up)[0].getCell();
	this._pc.move(cell);
	
	RPG.World.run();
}

RPG.Story.prototype._createPC = function(race, profession, name) {
	var pc = new RPG.Beings.PC(new race(), new profession());
	RPG.World.pc = pc;
	pc.setName(name);
	OZ.Event.add(pc, "death", this.bind(this._endGame));

	return pc;
}

RPG.Story.prototype._score = function() {
	var total = 0;
	
	total += 150 * this._maps.length;
	total += 20 * this._pc.getKills();
	
	var items = this._pc.getItems();
	for (var i=0;i<items.length;i++) {
		var item = items[i];
		if (item instanceof RPG.Items.Gold) { total += item.getAmount(); }
		if (item instanceof RPG.Items.Gem) { total += 100; }
	}
	
	if (this._pc.isAlive()) {
		total = total * 2;
	}
	
	return total;
}

RPG.Story.prototype._endGame = function() {
	RPG.World.lock();
	var div = OZ.DOM.elm("div");
	var p1 = OZ.DOM.elm("p");
	
	var str = this._pc.getName();
	if (this._pc.isAlive()) {
		str += " managed to finish the game alive!";
	} else {
		str += " was unable to surive in the dangerous dungeon.";
	}
	p1.innerHTML = str;
	
	var score = this._score();
	var p2 = OZ.DOM.elm("p");
	p2.innerHTML = "He managed to kill <strong>" + this._pc.getKills() + "</strong> monsters and his total score was: <strong>" + score + "</strong>";
	
	var p3 = OZ.DOM.elm("p");
	p3.innerHTML = "<a href='javascript:location.reload()'>Again?</a>";

	OZ.DOM.append([div, p1, p2, p3]);
	RPG.UI.showDialog(div, "Game over");
}

RPG.Story.prototype._randomDungeon = function() {
	var index = this._maps.length;
	
	var rooms = [];
	var map = null;
	do {
		map = this._mapgen.generate("Dungeon #" + index, index + 1);
		rooms = map.getRooms();
	} while (rooms.length < 3);
	
	if (index == 1) { map.setSound("doom"); }

	RPG.Decorators.Hidden.getInstance().decorate(map, 0.01)	
	var arr = [];

	for (var i=0;i<rooms.length;i++) { 
		RPG.Decorators.Doors.getInstance().decorate(map, rooms[i]);
		arr.push(rooms[i]);
	}
	
	/* enemies */
	var max = 4 + Math.floor(Math.random()*6);
	RPG.Decorators.Beings.getInstance().decorate(map, max);
	
	/* items */
	var max = 2 + Math.floor(Math.random()*4);
	RPG.Decorators.Items.getInstance().decorate(map, max);

	/* traps */
	var max = 1 + Math.floor(Math.random()*2);
	RPG.Decorators.Traps.getInstance().decorate(map, max);

	/* stairs up */
	var roomUp = arr.random();
	var index = arr.indexOf(roomUp);
	arr.splice(index, 1);
	var up = new RPG.Features.Staircase.Up();
	map.at(roomUp.getCenter()).setFeature(up);
	
	/* bind to previous dungeon */
	if (this._maps.length) {
		var prev = this._maps[this._maps.length-1];
		this._attachPrevious(map, prev);
	}
	
	/* stairs down */
	if (this._maps.length + 1 < this._maxDepth) {
		var roomDown = arr.random();
		var index = arr.indexOf(roomDown);
		arr.splice(index, 1);
		var down = new RPG.Features.Staircase.Down();
		map.at(roomDown.getCenter()).setFeature(down);
		this._attachNext(map);
	} else {
		/* last level */

		/* treasure */
		var roomTreasure = arr.random();
		var index = arr.indexOf(roomTreasure);
		arr.splice(index, 1);
		RPG.Decorators.Doors.getInstance().decorate(map, roomTreasure, {locked: 1});
		RPG.Decorators.Treasure.getInstance().decorate(map, roomTreasure, {treasure: 1});

		map.at(roomTreasure.getCenter()).setBeing(this._boss);
	}
	
	/* artifact */
	if (this._maps.length + 2 == this._maxDepth) {
		var cell = map.getFreeCell(true);
		var tmp = new RPG.Items.KlingonSword();
		var trap = new RPG.Features.Trap.Teleport();
		cell.setFeature(trap);
		cell.addItem(tmp);
	}

	this._maps.push(map);
	return map;
}
	
/**
 * Staircase needs its target dungeon generated
 */
RPG.Story.prototype._down = function(staircase) {
	var map = this._randomDungeon();
	var up = map.getFeatures(RPG.Features.Staircase.Up)[0];
	return up.getCell();
}

RPG.Story.prototype._firstMap = function() {
//	var map = this._randomDungeon();

    var map = new RPG.Map.Village();
	this._attachNext(map);

	var elder = map.getElder();
	
	var troll = new RPG.Beings.Troll();
	troll.setName("Chleba");
	this._boss = troll;
	elder.setEnemy(this._boss);
	
	this._attachGameover(map);
	this._maps.push(map);
	return map;
}

RPG.Story.prototype._attachGameover = function(map) {
	var up = map.getFeatures(RPG.Features.Staircase.Up)[0];
	up.setTarget(this.bind(this._endGame));
}

RPG.Story.prototype._attachNext = function(map) {
	var down = map.getFeatures(RPG.Features.Staircase.Down)[0];
	down.setTarget(this.bind(this._down));
}
	
RPG.Story.prototype._attachPrevious = function(map, previousMap) {
	var down = previousMap.getFeatures(RPG.Features.Staircase.Down)[0];
	var up = map.getFeatures(RPG.Features.Staircase.Up)[0];

	up.setTarget(down.getCell());
}
