/**
 * @class Village map
 * @augments RPG.Map
 */
RPG.Map.Village = OZ.Class().extend(RPG.Map);

RPG.Map.Village.prototype.init = function() {
    var cellmap = [
        [0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,3,3,3,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,3,3,3,0,0,1,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,3,3,3,0,1,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,3,3,3,1,2,2,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,0,0],
        [0,0,0,0,0,0,3,3,3,1,1,1,1,0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,1,2,2,2,1,0,0],
        [0,1,1,1,0,0,0,3,3,0,0,0,0,0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,1,2,2,2,1,0,0],
        [0,1,0,1,0,0,0,0,3,0,1,1,1,0,0,0,0,0,1,1,1,2,1,0,0,0,0,0,2,2,2,2,1,0,0],
        [0,1,0,1,0,0,0,3,3,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,1,0,0],
        [0,1,0,0,0,0,0,3,3,3,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,1,0,0],
        [0,1,1,1,0,0,0,0,3,3,0,0,0,0,0,0,0,1,1,1,2,1,0,0,0,0,0,0,1,1,1,1,1,0,0],
        [0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,0,0,3,3,0,0,0],
        [0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,0,0,0,3,3,0,0],
        [0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,3,3,0,3,3,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,3,3,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ];

	var height = cellmap.length;
	var width = cellmap[0].length;
	var size = new RPG.Misc.Coords(width, height);
	this.parent("A small village", size, 1);

	this._modifiers[RPG.FEAT_SIGHT_RANGE] = 2;
	this._sound = "tristram";
	this._staircases = [];
	
    var celltypes = [
        RPG.Cells.Grass,
        RPG.Cells.Wall,
        RPG.Cells.Corridor,
        RPG.Cells.Water,
    ];

    this.fromIntMap(cellmap.transpose(), celltypes);
	this.setWelcome("You come to a small peaceful village.");

    var doors_healer = new RPG.Features.Door();
    var doors_smith = new RPG.Features.Door();
    var doors_shop = new RPG.Features.Door();
    var doors_townhall = new RPG.Features.Door();
    var stairs_down = new RPG.Features.Staircase.Down();
    var stairs_up = new RPG.Features.Staircase.Up();
    doors_healer.close();
    doors_smith.open();
    doors_shop.open();
    doors_townhall.close();

    var c = null;

    c = this.at(new RPG.Misc.Coords(12,3));
    c.setFeature(doors_healer);

    c = this.at(new RPG.Misc.Coords(21,7));
    c.setFeature(doors_smith);

    c = this.at(new RPG.Misc.Coords(28,7));
    c.setFeature(doors_townhall);

    c = this.at(new RPG.Misc.Coords(20,10));
    c.setFeature(doors_shop);

    c = this.at(new RPG.Misc.Coords(32,14));
    c.setFeature(stairs_down);

    c = this.at(new RPG.Misc.Coords(20,2));
    c.setFeature(stairs_up);

    var task = null;

	this._elder = new RPG.Beings.VillageElder();
	this.at(new RPG.Misc.Coords(30, 5)).setBeing(this._elder);
    task = new RPG.AI.Wait();
	this._elder.ai().setDefaultTask(task);

    this._witch = new RPG.Beings.VillageWitch();
    this.at(new RPG.Misc.Coords(2,7)).setBeing(this._witch);
    task = new RPG.AI.Wait();
	this._witch.ai().setDefaultTask(task);

    this._healer = new RPG.Beings.VillageHealer();
    this.at(new RPG.Misc.Coords(11,3)).setBeing(this._healer);
    task = new RPG.AI.WanderInArea(new RPG.Misc.Coords(10, 2), new RPG.Misc.Coords(11, 4));
	this._healer.ai().setDefaultTask(task);

    this._smith = new RPG.Beings.VillageSmith();
    this.at(new RPG.Misc.Coords(20,6)).setBeing(this._smith);
    task = new RPG.AI.WanderInArea(new RPG.Misc.Coords(19, 5), new RPG.Misc.Coords(21, 6));
	this._smith.ai().setDefaultTask(task);

    this._shopkeeper = new RPG.Beings.VillageShopkeeper();
    this.at(new RPG.Misc.Coords(19,11)).setBeing(this._shopkeeper);
    task = new RPG.AI.WanderInArea(new RPG.Misc.Coords(19, 11), new RPG.Misc.Coords(21, 13));
	this._shopkeeper.ai().setDefaultTask(task);

    this._guard_one = new RPG.Beings.VillageGuard();
    this.at(new RPG.Misc.Coords(27,6)).setBeing(this._guard_one);
    task = new RPG.AI.Wait();
	this._guard_one.ai().setDefaultTask(task);

    this._guard_two = new RPG.Beings.VillageGuard();
    this.at(new RPG.Misc.Coords(27,8)).setBeing(this._guard_two);
    task = new RPG.AI.Wait();
	this._guard_two.ai().setDefaultTask(task);

	var residents = 5;
	var chats = [
		new RPG.Misc.Chat('"Work, work."').setSound("villager-work"),
		new RPG.Misc.Chat('"Ask our elder."')
	];
	
    for (var i = 0; i < residents; i++) {
        var villager = new RPG.Beings.Villager();
		villager.setChat(chats.random());
        c = this.getFreeCell();
        c.setBeing(villager);
    }

    var trees = 5;
    for (var i=0;i<trees;i++) {
        var tree = new RPG.Features.Tree();
        c = this.getFreeCell();
        c.setFeature(tree);
    }
	
}

RPG.Map.Village.prototype.use = function() {
	this.parent();
	RPG.UI.sound.preload("doom");
}

RPG.Map.Village.prototype.getElder = function() {
	return this._elder;
}

RPG.Map.Village.prototype.getSmith = function() {
	return this._smith;
}

RPG.Map.Village.prototype.getHealer = function() {
	return this._healer;
}

RPG.Map.Village.prototype.getWitch = function() {
	return this._witch;
}

RPG.Map.Village.prototype.getShopkeeper = function() {
	return this._shopkeeper;
}

RPG.Map.Village.prototype.showStaircase = function(who) {
}

/**
 * @class Village healer
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageHealer = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageHealer.factory.ignore = true;
RPG.Beings.VillageHealer.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());

	this._gender = RPG.GENDER_MALE;
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	this.setFeat(RPG.FEAT_DEXTERITY, 15);
	this.setFeat(RPG.FEAT_MAGIC, 20);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 20);
	
	this._description = "village healer";
	this._char = "@";
	this._color = "red";
	this._image = "village-healer";

    this.setChat(new RPG.Misc.Chat('"Time will heal every scar."'));
	
	this.fullStats();
}

/**
 * @class Village shopkeeper
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageShopkeeper = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageShopkeeper.factory.ignore = true;
RPG.Beings.VillageShopkeeper.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());

	this._gender = RPG.GENDER_FEMALE;
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	
	this._description = "shopkeeper";
	this._char = "@";
	this._color = "red";
	this._image = "village-shopkeeper";

	this.setChat(new RPG.Misc.Chat('"Be careful and don\'t break anything!"'));
	
	this.fullStats();
}

/**
 * @class Village witch
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageWitch = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageWitch.factory.ignore = true;
RPG.Beings.VillageWitch.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());

	this.setGender(RPG.GENDER_FEMALE);
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	this.setFeat(RPG.FEAT_MAGIC, 25);
	this.setFeat(RPG.FEAT_MAX_HP, 20);

	var broom = new RPG.Items.Broom();
	this.addItem(broom);
	this.equip(RPG.SLOT_WEAPON,broom);
	
	this._description = "witch";
	this._char = "@";
	this._color = "blue";
	this._image = "village-witch";
	
	this.setChat(new RPG.Misc.Chat('"Quidquid latine dictum sit, altum sonatur."'));

	this.fullStats();
}

/**
 * @class Village guard
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageGuard = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageGuard.factory.ignore = true;
RPG.Beings.VillageGuard.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());

	this._gender = RPG.GENDER_MALE;
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	this.setFeat(RPG.FEAT_STRENGTH, 20);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);
	this.setFeat(RPG.FEAT_DEXTERITY, 20);
	this.setFeat(RPG.FEAT_MAGIC, 20);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 20);

	var sword = new RPG.Items.LongSword();
	this.addItem(sword);
	this.equip(RPG.SLOT_WEAPON,sword);

	var shield = new RPG.Items.LargeShield();
	this.addItem(shield);
	this.equip(RPG.SLOT_SHIELD,shield);

    var armor = new RPG.Items.ChainMail();
    this.addItem(armor);
    this.equip(RPG.SLOT_ARMOR,armor);
	
	this._description = "elder's guard";
	this._char = "@";
	this._color = "red";
	this._image = "village-guard";
	
	this.setChat(new RPG.Misc.Chat('"Hey there! Friend or foe?"'));

	this.fullStats();
}

/**
 * @class Village smith
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageSmith = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageSmith.factory.ignore = true;
RPG.Beings.VillageSmith.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());

	this._gender = RPG.GENDER_MALE;
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	this.setFeat(RPG.FEAT_STRENGTH, 20);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);
	this.setFeat(RPG.FEAT_DEXTERITY, 20);
	this.setFeat(RPG.FEAT_MAGIC, 10);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 20);
	
	var hammer = new RPG.Items.Hammer();
	this.addItem(hammer);
	this.equip(RPG.SLOT_WEAPON,hammer);
	
	this._description = "dwarven smith";
	this._char = "h";
	this._color = "darkgray";
	this._image = "village-smith";
	
	this.setChat(new RPG.Misc.Chat('"Aye! Need some steel?"'));
	this.fullStats();
}

/**
 * @class Village elder
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageElder = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageElder.factory.ignore = true;
RPG.Beings.VillageElder.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());

	this._gender = RPG.GENDER_MALE;
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	this.setFeat(RPG.FEAT_STRENGTH, 20);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);
	this.setFeat(RPG.FEAT_DEXTERITY, 20);
	this.setFeat(RPG.FEAT_MAGIC, 20);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 20);
	
	var sword = new RPG.Items.LongSword();
	this.addItem(sword);
	this.equip(RPG.SLOT_WEAPON, sword);
	
	this._description = "village elder";
	this._char = "@";
	this._color = "brown";
	this._image = "village-elder";
	
	this.fullStats();
	
	this._quest = null;
	this._chats = {};
	this._staircase = null;
	this._staircaseCell = null;

	this._given = new RPG.Misc.Chat([
		'"The evil being lives in a dungeon close to south-east part of our village."',
		'"If you reach its lair, make sure you retrieve some of the treasure you find there."',
		'"Good luck!"'
	]).setEnd(function() {
		this._quest.setPhase(RPG.QUEST_GIVEN);
		RPG.World.pc.mapMemory().updateVisible();
	});
	
	this._chats[RPG.QUEST_NEW] = new RPG.Misc.Chat([
		'"Our village was attacked by some evil being recently."',
		'"Maybe you would like to help us?"'])
		.addOption("No, I am not interested.", function() {
			this._quest.setPhase(RPG.QUEST_TALKED);
		})
		.addOption("Yes, I would be happy to help!", this._given);
		
	this._chats[RPG.QUEST_TALKED] = new RPG.Misc.Chat('"So, you changed your mind regarding that little quest I offered you?"')
		.addOption("No, I am still not interested.")
		.addOption("Yes, I am now ready to help!", this._given);
	
	this._chats[RPG.QUEST_GIVEN] = new RPG.Misc.Chat('"That critter is still alive. Find it and kill it!"');
	
	this._chats[RPG.QUEST_DONE] = new RPG.Misc.Chat([
		'"Thank you for your help! We won\'t forget what you did for our village!"',
		'"Take this gold as our gratitude."'
	]).setEnd(function(){
			this._quest.setPhase(RPG.QUEST_REWARDED);
			this._quest = null;
		});
}

RPG.Beings.VillageElder.prototype.chat = function(who) {
	var phase = this._quest.getPhase();
	var chat = this._chats[phase];
	RPG.UI.setMode(RPG.UI_WAIT_CHAT, this, chat);
}

RPG.Beings.VillageElder.prototype.isChatty = function() {
	return !!this._quest;
}

RPG.Beings.VillageElder.prototype.setEnemy = function(being) {
	this._quest = new RPG.Quests.ElderEnemy(this, being);

	var staircase = this._cell.getMap().getFeatures(RPG.Features.Staircase.Down)[0];
	this._staircase = staircase;
	this._staircaseCell = staircase.getCell();
	this._staircaseCell.setFeature(null);
}

RPG.Beings.VillageElder.prototype.showStaircase = function() {
	this._staircaseCell.setFeature(this._staircase);
}

/**
 * @class Elder's enemy quest
 * @augments RPG.Quests.Kill
 */
RPG.Quests.ElderEnemy = OZ.Class().extend(RPG.Quests.Kill);

RPG.Quests.ElderEnemy.prototype.setPhase = function(phase) {
	this.parent(phase);
	if (phase == RPG.QUEST_GIVEN) {
		/* show staircase */
		this._giver.showStaircase();
	}
}

RPG.Quests.ElderEnemy.prototype.reward = function() {
	var gold = new RPG.Items.Gold(1000);
	RPG.World.pc.addItem(gold);
}

/**
 * @class Village-based story
 * @augments RPG.Story
 */
RPG.Story.Village = OZ.Class().extend(RPG.Story);

RPG.Story.Village.prototype.init = function() {
	this.parent();
	RPG.UI.sound.preload("tristram");
	
	this._maxDepth = 6;
	this._maps = [];
	
	this._mapgen = new RPG.Generators.Digger(new RPG.Misc.Coords(60, 20));
}

RPG.Story.Village.prototype._createPC = function(race, profession, name) {
	this.parent(race, profession, name);
	var rocks = new RPG.Items.Rock();
	rocks.setAmount(5);
	RPG.World.pc.addItem(rocks);
}

RPG.Story.Village.prototype._generateMap = function() {
	var map = null;
	if (!this._maps.length) {
		map = this._villageMap();
	} else {
		map = this._randomMap();
	}
	this._maps.push(map);
	return map;
}

RPG.Story.Village.prototype._villageMap = function() {
    var map = new RPG.Map.Village();
	this._attachNext(map);
	this._attachGameover(map);

	var elder = map.getElder();
	
	var troll = new RPG.Beings.Troll();
	troll.setName("Chleba");
	this._boss = troll;
	elder.setEnemy(this._boss);
	
	return map;
}

RPG.Story.Village.prototype._randomMap = function() {
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
		map.setSound("doom");
		var roomDown = arr.random();
		var index = arr.indexOf(roomDown);
		arr.splice(index, 1);
		var down = new RPG.Features.Staircase.Down();
		map.at(roomDown.getCenter()).setFeature(down);
		this._attachNext(map);
	} else {
		/* last level */
		map.setSound("doom2");

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

	return map;
}

	
/**
 * Staircase needs its target dungeon generated
 */
RPG.Story.Village.prototype._down = function(staircase) {
	var map = this._generateMap();
	var up = map.getFeatures(RPG.Features.Staircase.Up)[0];
	return up.getCell();
}

RPG.Story.Village.prototype._computeScore = function() {
	var total = this.parent();
	total += 150 * this._maps.length;
	return total;
}

RPG.Story.Village.prototype._attachGameover = function(map) {
	var up = map.getFeatures(RPG.Features.Staircase.Up)[0];
	up.setTarget(this.bind(this._endGame));
}

RPG.Story.Village.prototype._attachNext = function(map) {
	var down = map.getFeatures(RPG.Features.Staircase.Down)[0];
	down.setTarget(this.bind(this._down));
}
	
RPG.Story.Village.prototype._attachPrevious = function(map, previousMap) {
	var down = previousMap.getFeatures(RPG.Features.Staircase.Down)[0];
	var up = map.getFeatures(RPG.Features.Staircase.Up)[0];

	up.setTarget(down.getCell());
}
