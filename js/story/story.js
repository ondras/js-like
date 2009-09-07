/**
 * @class Story class
 */
RPG.Story = OZ.Class();

RPG.Story.prototype.init = function() {
	this._maxDepth = 5;
	this._maps = [];
//	this._chat = this._buildChat();
	this._mapgen = new RPG.Dungeon.Generator.Digger(new RPG.Misc.Coords(60, 20));
	this._mapdec = new RPG.Dungeon.Decorator();

	OZ.Event.add(RPG.World, "action", this.bind(this._action));
	this._pickRace();
}

RPG.Story.prototype._action = function(e) {
	var a = e.data;
	if (!(a instanceof RPG.Actions.Death)) { return; }
	if (a.getSource() == this._pc) { this._endGame(); }
}

/**
 * Staircase needs its target dungeon generated
 */
RPG.Story.prototype.generateDungeon = function(staircase) {
	var map = staircase.getCell().getMap();
	if (map == this._maps[0] && staircase instanceof RPG.Features.Staircase.Up) {
		this._endGame();
		return;
	}

	map = this._dungeon();
	
	staircase.setTargetMap(map);
	var up = map.getFeatures(RPG.Features.Staircase.Up)[0];
	staircase.setTargetCoords(up.getCell().getCoords());
}

RPG.Story.prototype._pickRace = function() {
	var t = OZ.DOM.elm("table", {className:"race"});
	var tb = OZ.DOM.elm("tbody");
	var tr = OZ.DOM.elm("tr");
	OZ.DOM.append([t, tb], [tb, tr]);
	
	this._labels = [];
	this._races = [];
	
	var def = {
		"Human": RPG.Races.Human, 
		"Orc": RPG.Races.Orc, 
		"Elf": RPG.Races.Elf, 
		"Dwarf": RPG.Races.Dwarf
	};
	
	for (var name in def) {
		var ctor = def[name];
		var tmp = new ctor();
		var td = OZ.DOM.elm("td");
		tr.appendChild(td);
		
		var label = OZ.DOM.elm("label");
		
		var img = OZ.DOM.elm("img");
		img.src = "img/pc/" + tmp.getImage() + ".png";
		
		OZ.DOM.append([td, label], [label, img, OZ.DOM.elm("br"), OZ.DOM.text(name)]);
		
		this._labels.push(label);
		this._races.push(ctor);
		OZ.Event.add(label, "click", this.bind(this._raceClick));
	}
	
	var w = OZ.DOM.win()[0];
	var d = OZ.DOM.elm("div", {width:Math.round(w/2) + "px"});
	var p1 = OZ.DOM.elm("p");
	p1.innerHTML = "You are about to dive into the depths of a dungeon. "
					+ "Your task is to venture into the lowest level, retrieve as much "
					+ "valuables as possible and safely return to the surface.";
	var p2 = OZ.DOM.elm("p");
	p2.innerHTML = "Pick your race:";
	OZ.DOM.append([d, p1, p2, t]);
	
	RPG.UI.showDialog(d, "Welcome, adventurer!");
}

RPG.Story.prototype._raceClick = function(e) {
	RPG.UI.hideDialog();
	var elm = OZ.Event.target(e);
	while (elm.tagName.toLowerCase() != "label") { elm = elm.parentNode; }
	
	var index = this._labels.indexOf(elm);
	var race = this._races[index];
	
	RPG.UI.build();
	this._pc = this._createPC(race);

	var map = this._dungeon();
	var up = map.getFeatures(RPG.Features.Staircase.Up)[0];
	up.getCell().setBeing(this._pc);
	
	RPG.UI.status.updateFeats();
	RPG.UI.status.updateHP();
	RPG.World.setMap(map);
	RPG.World.run();
}

RPG.Story.prototype._createPC = function(race) {
	var pc = new RPG.Beings.PC(new race());
	RPG.World.setPC(pc);
	RPG.World.setStory(this);

	var tmp = new RPG.Items.HealingPotion();
	pc.addItem(tmp);	

	var tmp = new RPG.Items.IronRation();
	pc.addItem(tmp);	

	return pc;
}

RPG.Story.prototype._score = function() {
	var total = 0;
	
	total += 100 * this._maps.length;
	
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
	
	if (this._pc.isAlive()) {
		p1.innerHTML = "You managed to finish the game alive!";
	} else {
		p1.innerHTML = "You were unable to surive in the dangerous dungeon.";
	}
	
	var score = this._score();
	var p2 = OZ.DOM.elm("p");
	p2.innerHTML = "Your total score is: <strong>" + score + "</strong>";
	
	var p3 = OZ.DOM.elm("p");
	p3.innerHTML = "<a href='javascript:location.reload()'>Again?</a>";

	OZ.DOM.append([div, p1, p2, p3]);
	RPG.UI.showDialog(div, "Game over");
}

RPG.Story.prototype._dungeon = function() {
	var index = this._maps.length + 1;
	
	var rooms = [];
	var map = null;
	do {
		map = this._mapgen.generate("Dungeon #" + index);
		rooms = map.getRooms();
	} while (rooms.length < 3);
	
	this._mapdec.setMap(map).addHiddenCorridors(0.01);
	var arr = [];

	for (var i=0;i<rooms.length;i++) { 
		this._mapdec.addRoomDoors(rooms[i]); 
		arr.push(rooms[i]);
	}
	
	/* enemies */
	var max = 4 + Math.floor(Math.random()*6);
	this._mapdec.addBeings(max);	
	
	/* items */
	var max = 2 + Math.floor(Math.random()*4);
	this._mapdec.addItems(max);	

	/* traps */
	var max = 1 + Math.floor(Math.random()*2);
	this._mapdec.addTraps(max);	

	/* stairs up */
	var roomUp = arr.random();
	var index = arr.indexOf(roomUp);
	arr.splice(index, 1);
	var up = new RPG.Features.Staircase.Up();
	map.at(roomUp.getCenter()).setFeature(up);
	
	/* bind to previous dungeon */
	if (this._maps.length) {
		var prev = this._maps[this._maps.length-1];
		var down = prev.getFeatures(RPG.Features.Staircase.Down)[0];
		up.setTargetMap(prev);
		up.setTargetCoords(down.getCell().getCoords());
	}

	/* stairs down */
	if (this._maps.length + 1 < this._maxDepth) {
		var roomDown = arr.random();
		var index = arr.indexOf(roomDown);
		arr.splice(index, 1);
		var down = new RPG.Features.Staircase.Down();
		map.at(roomDown.getCenter()).setFeature(down);
	} else {
		/* last level */

		/* treasure */
		var roomTreasure = arr.random();
		var index = arr.indexOf(roomTreasure);
		arr.splice(index, 1);
		this._mapdec.addRoomDoors(roomTreasure, {locked: 1});
		this._mapdec.decorateRoomInterior(roomTreasure, {treasure: 1});

		var troll = new RPG.Beings.Troll();
		troll.setName("Chleba");
		map.at(roomTreasure.getCenter()).setBeing(troll);
	}
	
	/* artifact */
	if (this._maps.length + 2 == this._maxDepth) {
		var coords = map.getFreeCoords(true);
		var tmp = new RPG.Items.KlingonSword();
		var trap = new RPG.Features.Trap.Teleport();
		var cell = map.at(coords);
		cell.setFeature(trap);
		cell.addItem(tmp);
	}

	this._maps.push(map);
	return map;
}
	
/*
RPG.Story.prototype._buildChat = function() {
	var c = new RPG.Misc.Chat("Hi, what am I supposed to do?")
		.addOption("Nothing special")
		.addOption("Some activity please", new RPG.Misc.Chat("What activity?")
			.addOption("Kill me!", function(action) {
				action.getTarget().clearTasks();
				action.getTarget().addTask(new RPG.Engine.AI.Kill(action.getSource()));
			})
			.addOption("Attack me!", function(action) {
				action.getTarget().clearTasks();
				action.getTarget().addTask(new RPG.Engine.AI.Attack(action.getSource()));
			})
			.addOption("Run away!", function(action) {
				action.getTarget().clearTasks();
				action.getTarget().addTask(new RPG.Engine.AI.Retreat(action.getSource()));
			})
		);
	return c;
}
*/
