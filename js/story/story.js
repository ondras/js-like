/**
 * @class Dungeon which disappears when left
 * @augments RPG.Map.Dungeon
 */
RPG.Map.RandomDungeon = OZ.Class().extend(RPG.Map.Dungeon);

RPG.Map.RandomDungeon.prototype.leaving = function(being) {
	this.parent(being);
	if (being != RPG.Game.pc) { return; }
	
	being.clearMemory();
	
	var coords = being.getCoords();
	var feature = this.getFeature(coords);
	if (!feature) { return; } /* panic; we are not on a connector? */
	
	/* mark the target connector as empty */
	var target = feature.getTarget();
	target.setTarget(null);
}

/**
 * @class Main story
 * @augments RPG.Story
 */
RPG.Story.Village = OZ.Class().extend(RPG.Story);

RPG.Story.Village.prototype.init = function() {
	this.parent();
	RPG.UI.sound.preload("tristram");
	
	this._maxElderDepth = 5;
	this._elderDepth = 0;
	this._maxMazeDepth = 3;
	this._mazeDepth = 0;
	
	this._addCallbacks();
	this._boss = null;
	this._village = null;
	this._tutorial = null;
	this._necklace = new RPG.Items.WeddingNecklace();
}

RPG.Story.Village.prototype.revive = function() {
	this.parent();
	this._addCallbacks();
}

RPG.Story.Village.prototype._buildMaps = function() {
	this._tutorial = new RPG.Map.Tutorial();
	this._buildVillage();
	
	var cross = new RPG.Map.Crossroads();
	
	/* connect crossroads with tutorial */
	var down = new RPG.Features.StaircaseDown();
	var up = new RPG.Features.StaircaseUp();
	down.setTarget(up);
	up.setTarget(down);
	cross.setFeature(down, new RPG.Coords(1, 6));
	this._tutorial.setFeature(up, new RPG.Coords(49, 15));
	cross.setFeature(new RPG.Features.Signpost("To beginner's cave"), down.getCoords().neighbor(RPG.S));

	/* connect crossroads with village */
	var down = new RPG.Features.RoadEntry();
	var up = new RPG.Features.RoadExit();
	down.setTarget(up);
	up.setTarget(down);
	cross.setFeature(down, new RPG.Coords(7, 12));
	this._village.setFeature(up, new RPG.Coords(19, 1));
	cross.setFeature(new RPG.Features.Signpost("To village"), down.getCoords().neighbor(RPG.NW)); 

	/* connect crossroads with church */
	var church = new RPG.Map.Church();
	var down = new RPG.Features.RoadEntry();
	var up = new RPG.Features.RoadExit();
	down.setTarget(up);
	up.setTarget(down);
	cross.setFeature(down, new RPG.Coords(28, 1));
	church.setFeature(up, new RPG.Coords(3, 9));
	cross.setFeature(new RPG.Features.Signpost("To the church"), down.getCoords().neighbor(RPG.N)); 

	/* infinite dungeon */
	var down = new RPG.Features.StaircaseDown();
	cross.setFeature(down, new RPG.Coords(18, 1));
    this._staircases["dungeon"] = down;
	cross.setFeature(new RPG.Features.Signpost("To underground caves"), down.getCoords().neighbor(RPG.E)); 
	
	/* end game */
	var away = new RPG.Features.RoadExit();
	cross.setFeature(away, new RPG.Coords(28, 12));
    this._staircases["end"] = away;
	cross.setFeature(new RPG.Features.Signpost("Leave the game"), away.getCoords().neighbor(RPG.N)); 
}

RPG.Story.Village.prototype._addCallbacks = function() {
	this._staircaseCallbacks["end"] = this._end;
    this._staircaseCallbacks["elder"] = this._nextElderDungeon;
    this._staircaseCallbacks["maze"] = this._nextMazeDungeon;
    this._staircaseCallbacks["dungeon"] = this._nextGenericDungeon;
    this._staircaseCallbacks["dungeon-up"] = this._nextGenericDungeon;
    this._staircaseCallbacks["dungeon-down"] = this._nextGenericDungeon;
    this._questCallbacks["elder"] = this._showElderStaircase;
    this._questCallbacks["maze"] = this._showMazeStaircase;
}

RPG.Story.Village.prototype._end = function(staircase) {
	RPG.UI.confirm("Do you want to end the game?", "End game", function() { RPG.Game.end(); });
}

RPG.Story.Village.prototype._createPC = function(race, profession, name) {
	var pc = this.parent(race, profession, name);

	var rocks = new RPG.Items.Rock();
	rocks.setAmount(5);
	pc.addItem(rocks);

	return pc;
}

RPG.Story.Village.prototype._firstMap = function() {
	this._buildMaps();
	return [this._tutorial, new RPG.Coords(7, 17)];
}

RPG.Story.Village.prototype._buildVillage = function() {
	this._village = new RPG.Map.SmallVillage();

	/* village elder */
	var elder = new RPG.Beings.VillageElder();
	this._village.setBeing(elder, new RPG.Coords(30, 5));
	elder.getAI().setDefaultTask(new RPG.AI.Wait());
	
	/* elder's enemy */
	this._boss = new RPG.Beings.Troll().setName("Chleba");
	this._quests["elder"] = new RPG.Quests.ElderEnemy(elder, this._boss);

	/* witch */
    var witch = new RPG.Beings.VillageWitch();
    this._village.setBeing(witch, new RPG.Coords(2,7));
	witch.getAI().setDefaultTask(new RPG.AI.Wait());

	/* healer */
    var healer = new RPG.Beings.VillageHealer();
    this._village.setBeing(healer, new RPG.Coords(11,3));
    var task = new RPG.AI.WanderInArea(new RPG.Coords(10, 2), new RPG.Coords(11, 4));
	healer.getAI().setDefaultTask(task);

	/* healer's quest */
	this._quests["maze"] = new RPG.Quests.LostNecklace(healer, this._necklace);
	
	/* smith */
    var smith = new RPG.Beings.VillageSmith();
    this._village.setBeing(smith, new RPG.Coords(20,6));
    var task = new RPG.AI.WanderInArea(new RPG.Coords(19, 5), new RPG.Coords(21, 6));
	smith.getAI().setDefaultTask(task);

	/* smith's trophy */
	new RPG.Quests.SmithTrophy(smith);
	
	/* shop + shopkeeper */
	var shop1 = new RPG.Coords(18, 11);
	var shop2 = new RPG.Coords(20, 13);
	var shop = new RPG.Areas.Shop(shop1, shop2);
	this._village.addArea(shop);
    var shopkeeper = new RPG.Beings.VillageShopkeeper();
	shop.setShopkeeper(shopkeeper);

	/* guards */
    var guard = new RPG.Beings.VillageGuard();
    this._village.setBeing(guard, new RPG.Coords(27,6));
	guard.getAI().setDefaultTask(new RPG.AI.Wait());

    var guard = new RPG.Beings.VillageGuard();
    this._village.setBeing(guard, new RPG.Coords(27,8));
	guard.getAI().setDefaultTask(new RPG.AI.Wait());

	/* villagers */
	var residents = 5;
	var chats = [
		["Work, work.", "villager-work"],
		["Ask our elder.", null]
	];
    for (var i=0; i<residents; i++) {
        var villager = new RPG.Beings.Villager();
	    var chat = chats.random();
		villager.getAI().setDialogText(chat[0]);
		villager.getAI().setDialogSound(chat[1]);
        this._village.setBeing(villager, this._village.getFreeCoords());
    }
}

RPG.Story.Village.prototype._showElderStaircase = function() {
    var staircase = new RPG.Features.StaircaseDown();
    this._village.setFeature(staircase, new RPG.Coords(32, 14));
    this._staircases["elder"] = staircase;
}

RPG.Story.Village.prototype._showMazeStaircase = function() {
    var staircase = new RPG.Features.StaircaseDown();
    this._village.setFeature(staircase, new RPG.Coords(1, 1));
    this._staircases["maze"] = staircase;
}

RPG.Story.Village.prototype._nextElderDungeon = function(staircase) {
	this._elderDepth++;
	var size = new RPG.Coords(60, 20);
	var generator = (this._elderDepth % 2 ? RPG.Generators.Uniform : RPG.Generators.Digger);

	var rooms = [];
	var map = null;
	do {
		map = generator.getInstance().generate("Dungeon #" + this._elderDepth, size, this._elderDepth);
		rooms = map.getRooms();
	} while (rooms.length < 3);
	
	if (this._elderDepth == 1) { map.setSound("doom"); }

	RPG.Decorators.Hidden.getInstance().decorate(map, 0.01);
	var arr = [];

	for (var i=0;i<rooms.length;i++) { 
		RPG.Decorators.Doors.getInstance().decorate(map, rooms[i]);
		arr.push(rooms[i]);
	}
	
	/* enemies */
	var max = 4 + Math.floor(Math.random()*6);
	RPG.Decorators.Beings.getInstance().decorate(map, max);
	
	/* items */
	var max = 1 + Math.floor(Math.random()*3);
	RPG.Decorators.Items.getInstance().decorate(map, max);

	/* traps */
	var max = 1 + Math.floor(Math.random()*2);
	RPG.Decorators.Traps.getInstance().decorate(map, max);

	/* stairs up */
	var roomUp = arr.random();
	var index = arr.indexOf(roomUp);
	arr.splice(index, 1);
	var up = new RPG.Features.StaircaseUp();
	map.setFeature(up, roomUp.getCenter());
	
	/* bind to previous dungeon */
	up.setTarget(staircase);
	staircase.setTarget(up);
	
	/* stairs down */
	if (this._elderDepth < this._maxElderDepth) {
		map.setSound("doom");
		var roomDown = arr.random();
		var index = arr.indexOf(roomDown);
		arr.splice(index, 1);
		var down = new RPG.Features.StaircaseDown();
		map.setFeature(down, roomDown.getCenter());
		this._staircases["elder"] = down;
	} else {
		/* last level */
		map.setSound("doom2");

		/* treasure */
		var roomTreasure = arr.random();
		var index = arr.indexOf(roomTreasure);
		arr.splice(index, 1);
		RPG.Decorators.Doors.getInstance().decorate(map, roomTreasure, {locked: 1});
		RPG.Decorators.Treasure.getInstance().decorate(map, roomTreasure, {treasure: 1});

		map.setBeing(this._boss, roomTreasure.getCenter());
	}
	
	/* artifact */
	if (this._elderDepth+1 == this._maxElderDepth) {
		var coords = map.getFreeCoords(true);
		var tmp = new RPG.Items.KlingonSword();
		var trap = new RPG.Features.Trap.Teleport();
		map.setFeature(trap, coords);
		map.addItem(tmp, coords);
	}
}

RPG.Story.Village.prototype._nextMazeDungeon = function(staircase) {
	this._mazeDepth++;

	var generator = null;
	var size = new RPG.Coords(59, 19);
	switch (this._mazeDepth) {
		case 1: generator = RPG.Generators.DividedMaze; break;
		case 2: generator = RPG.Generators.IceyMaze; break;
		default: generator = RPG.Generators.Maze; break; 
	}
	map = generator.getInstance().generate("Maze #" + this._mazeDepth, size, this._mazeDepth);
	if (this._mazeDepth == 1) { map.setSound("neverhood"); }

	RPG.Decorators.Hidden.getInstance().decorate(map, 0.01);
	
	var corners = map.getCoordsInTwoCorners();

	/* stairs up */
	var up = new RPG.Features.StaircaseUp();
	map.setFeature(up, corners[0]);
	
	/* bind to previous dungeon */
	up.setTarget(staircase);
	staircase.setTarget(up);
	
	/* stairs down */
	if (this._mazeDepth < this._maxMazeDepth) {
		var down = new RPG.Features.StaircaseDown();
		map.setFeature(down, corners[1]);
		this._staircases["maze"] = down;
	} else {
		map.addItem(this._necklace, corners[1]);
	}
	
	/* enemies */
	var max = 2 + Math.floor(Math.random()*3);
	RPG.Decorators.Beings.getInstance().decorate(map, max);
	
	/* items */
	var max = 1 + Math.floor(Math.random()*3);
	RPG.Decorators.Items.getInstance().decorate(map, max);

	/* traps */
	var max = 1 + Math.floor(Math.random()*2);
	RPG.Decorators.Traps.getInstance().decorate(map, max);
}

RPG.Story.Village.prototype._nextGenericDungeon = function(staircase) {
	var map = staircase.getMap();
	var level = map.getDanger();

	if (map instanceof RPG.Map.RandomDungeon && level == 1 && staircase instanceof RPG.Features.Connector.Exit) { /* leave */
		staircase.setTarget(this._staircases["dungeon"]);
	} else { /* create a dungeon */
		if (map instanceof RPG.Map.RandomDungeon) {
			level += (staircase instanceof RPG.Features.Connector.Exit ? -1 : 1);
		} else {
			level = 1;
		}
		var gen = RPG.Generators.Uniform.getInstance();
		var map = gen.generate("Generic dungeon #" + level, new RPG.Coords(60, 20), level, {ctor:RPG.Map.RandomDungeon});
		RPG.Decorators.Hidden.getInstance().decorate(map, 0.01);
		
		/* enemies */
		var max = 3 + Math.floor(Math.random()*6) + level;
		RPG.Decorators.Beings.getInstance().decorate(map, max);
		
		/* items */
		var max = 1 + Math.floor(Math.random()*3);
		RPG.Decorators.Items.getInstance().decorate(map, max);

		/* traps */
		var max = 1 + Math.floor(Math.random()*2);
		RPG.Decorators.Traps.getInstance().decorate(map, max);
		
		/* stairs up */
		var rooms = map.getRooms().clone();
		var index = Math.floor(Math.random()*rooms.length);
		var roomUp = rooms.splice(index, 1)[0];
		var up = new RPG.Features.StaircaseUp();
		map.setFeature(up, roomUp.getCenter());
		this._staircases["dungeon-up"] = up;
		
		/* stairs down */
		var roomDown = rooms.random();
		var down = new RPG.Features.StaircaseDown();
		map.setFeature(down, roomDown.getCenter());
		this._staircases["dungeon-down"] = down;
		
		/* bind to staircase */
		if (staircase instanceof RPG.Features.Connector.Exit) { /* bind to down staircase */
			staircase.setTarget(down);
		} else { /* bind to up staircase */
			staircase.setTarget(up);
		}

	}
	
}

RPG.Story.Village.prototype.computeScore = function() {
	var total = this.parent();
	total += 150 * this._elderDepth;
	return total;
}

