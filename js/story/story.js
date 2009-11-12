/**
 * @class Story class
 */
RPG.Story = OZ.Class();

RPG.Story.prototype.init = function() {
	this._maxDepth = 6;
	this._maps = [];
	this._name = OZ.DOM.elm("input", {type:"text", size:"15", font:"inherit", value: "Hero"});
//	this._chat = this._buildChat();
	this._mapgen = new RPG.Dungeon.Generator.Digger(new RPG.Misc.Coords(60, 20));
	this._mapdec = new RPG.Dungeon.Decorator();

	OZ.Event.add(RPG.World, "action", this.bind(this._action));
	this._openCharGen();
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

RPG.Story.prototype._openCharGen = function() {
	var cg = new RPG.Story.CharGen();

	var w = OZ.DOM.win()[0];
	var d = OZ.DOM.elm("div", {width:Math.round(w/2) + "px"});
	var p1 = OZ.DOM.elm("p");
	p1.innerHTML = "You are about to dive into the depths of a dungeon. "
					+ "Your task is to venture into the lowest level, retrieve as much "
					+ "valuables as possible and safely return to the surface.";
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

	var map = this._dungeon();
	var up = map.getFeatures(RPG.Features.Staircase.Up)[0];
	up.getCell().setBeing(this._pc);
	
	RPG.World.setMap(map);
	RPG.World.run();
}

RPG.Story.prototype._createPC = function(race, profession, name) {
	var pc = new RPG.Beings.PC(new race(), profession);
	RPG.World.pc = pc;
	RPG.World.setStory(this);
	pc.setName(name);

	var tmp = new RPG.Items.HealingPotion();
	pc.addItem(tmp);	

	var tmp = new RPG.Items.IronRation();
	pc.addItem(tmp);	
	
	if (profession == "wizard") {
		var s = new RPG.Spells.Heal();
		pc.spellMemory().addSpell(s);
	}

	return pc;
}

RPG.Story.prototype._score = function() {
	var total = 0;
	
	total += 150 * this._maps.length;
	
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
	p2.innerHTML = "His total score is: <strong>" + score + "</strong>";
	
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

/**
 * @class Character generator
 */
RPG.Story.CharGen = OZ.Class();

RPG.Story.CharGen.races = {
	"Human": RPG.Races.Human, 
	"Orc": RPG.Races.Orc, 
	"Elf": RPG.Races.Elf, 
	"Dwarf": RPG.Races.Dwarf
};
	
RPG.Story.CharGen.professions = {
	"Warrior": "warrior",
	"Ranger": "ranger",
	"Wizard": "wizard"
};

RPG.Story.CharGen.prototype.init = function() {
	this._list = [];
}

RPG.Story.CharGen.prototype.build = function() {
	var t = OZ.DOM.elm("table", {className:"chargen"});
	var tb = OZ.DOM.elm("tbody");
	t.appendChild(tb);
	
	var numRaces = 0;
	var numProfessions = 0;
	for (var p in RPG.Story.CharGen.races) { numRaces++; }
	for (var p in RPG.Story.CharGen.professions) { numProfessions++; }
	
	/* right part with race/profession selection */
	this._buildMatrix(tb);	
	
	OZ.Event.add(t, "click", this.bind(this._click));
	
	return t;
}

RPG.Story.CharGen.prototype._buildMatrix = function(tb) {
	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);
	var empty = OZ.DOM.elm("td");
	tr.appendChild(empty);
	
	/* race labels */
	for (var p in RPG.Story.CharGen.races) {
		var td = OZ.DOM.elm("td");
		td.innerHTML = p;
		tr.appendChild(td);
	}
	
	for (var p in RPG.Story.CharGen.professions) {
		var prof = RPG.Story.CharGen.professions[p];
		tr = OZ.DOM.elm("tr");
		tb.appendChild(tr);
		
		/* profession label */
		var td = OZ.DOM.elm("td");
		td.innerHTML = p;
		tr.appendChild(td);
		
		for (var q in RPG.Story.CharGen.races) {
			/* cell */
			var td = OZ.DOM.elm("td");
			tr.appendChild(td);

			var ctor = RPG.Story.CharGen.races[q];
			var tmp = new ctor();
			var img = OZ.DOM.elm("img");
			img.src = "img/pc/" + tmp.getImage() + "-" + prof + ".png";
			td.appendChild(img);
			
			this._list.push([img, ctor, prof]);
		}
	}
}

RPG.Story.CharGen.prototype._click = function(e) {
	var t = OZ.Event.target(e);
	if (t.nodeName.toLowerCase() != "img") { return; }
	for (var i=0;i<this._list.length;i++) {
		var item = this._list[i];
		if (item[0] == t) {
			this.dispatch("chargen", {race: item[1], profession: item[2]});
		}
	}
}