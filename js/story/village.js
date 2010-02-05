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
	
    var celltypes = [
        RPG.Cells.Grass,
        RPG.Cells.Wall,
        RPG.Cells.Corridor,
        RPG.Cells.Water,
    ];

    this.fromIntMap(cellmap.transpose(), celltypes);
	this.setWelcome("You come to a small peaceful village.");

	this._buildPeople();

    var trees = 5;
    for (var i=0;i<trees;i++) {
        var tree = new RPG.Features.Tree();
        c = this.getFreeCell();
        c.setFeature(tree);
    }
}

RPG.Map.Village.prototype.entered = function() {
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

RPG.Map.Village.prototype._buildPeople = function() {
    var doors_healer = new RPG.Features.Door();
    var doors_smith = new RPG.Features.Door();
    var doors_shop = new RPG.Features.Door();
    var doors_townhall = new RPG.Features.Door();
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
		new RPG.Misc.Chat().defineState(0, '"Work, work."').defineSound(0, "villager-work"),
		new RPG.Misc.Chat().defineState(0, '"Ask our elder."')
	];
	
    for (var i = 0; i < residents; i++) {
        var villager = new RPG.Beings.Villager();
        //var potion = new RPG.Items.HealingPotion();
	    //villager.addItem(potion);
		villager.setChat(chats.random());
        c = this.getFreeCell();
        c.setBeing(villager);
    }
	
	/*
	var thrower = new RPG.Beings.GoblinRockthrower();
	this.at(new RPG.Misc.Coords(22,3)).setBeing(thrower);
	thrower.setFeat(RPG.FEAT_MAGIC, 20);
	thrower.fullStats();
	thrower.addSpell(RPG.Spells.Fireball);
	*/
}

/**
 * @class Village healer
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageHealer = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageHealer.factory.ignore = true;
RPG.Beings.VillageHealer.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());

	this.setGender(RPG.GENDER_MALE);
	this.setConfirm(RPG.CONFIRM_ASK);
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

	this.setGender(RPG.GENDER_FEMALE);
	this.setConfirm(RPG.CONFIRM_ASK);
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	
	this._description = "shopkeeper";
	this._char = "@";
	this._color = "red";
	this._image = "village-shopkeeper";

	this.setChat(new RPG.Misc.Chat().defineState(0, '"Be careful and don\'t break anything!"'));
	
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

	this.setConfirm(RPG.CONFIRM_ASK);
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

	this.addSpell(RPG.Spells.MagicBolt);
	this.addSpell(RPG.Spells.Teleport);

	this.setChat(new RPG.Misc.Chat().defineState(0, '"Quidquid latine dictum sit, altum sonatur."'));

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

	this.setConfirm(RPG.CONFIRM_ASK);
	this.setGender(RPG.GENDER_MALE);
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	this.setFeat(RPG.FEAT_STRENGTH, 20);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);
	this.setFeat(RPG.FEAT_DEXTERITY, 20);
	this.setFeat(RPG.FEAT_MAGIC, 20);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 20);

	var sword = new RPG.Items.LongSword();
	this.equip(RPG.SLOT_WEAPON,sword);

	var shield = new RPG.Items.LargeShield();
	this.equip(RPG.SLOT_SHIELD,shield);

    var armor = new RPG.Items.ChainMail();
    this.equip(RPG.SLOT_ARMOR,armor);
	
	this._description = "elder's guard";
	this._char = "@";
	this._color = "red";
	this._image = "village-guard";
	
	this.setChat(new RPG.Misc.Chat().defineState(0, '"Hey there! Friend or foe?"'));

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

	this.setConfirm(RPG.CONFIRM_ASK);
	this.setGender(RPG.GENDER_MALE);
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	this.setFeat(RPG.FEAT_STRENGTH, 20);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);
	this.setFeat(RPG.FEAT_DEXTERITY, 20);
	this.setFeat(RPG.FEAT_MAGIC, 10);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 20);
	
	var hammer = new RPG.Items.Hammer();
	this.equip(RPG.SLOT_WEAPON,hammer);
	
	this._description = "dwarven smith";
	this._char = "h";
	this._color = "darkgray";
	this._image = "village-smith";
	
	this.setChat(new RPG.Misc.Chat().defineState(0, '"Aye! Need some steel?"'));
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

	this.setConfirm(RPG.CONFIRM_ASK);
	this.setGender(RPG.GENDER_MALE);
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	this.setFeat(RPG.FEAT_STRENGTH, 20);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);
	this.setFeat(RPG.FEAT_DEXTERITY, 20);
	this.setFeat(RPG.FEAT_MAGIC, 20);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 20);
	
	var sword = new RPG.Items.LongSword();
	this.equip(RPG.SLOT_WEAPON, sword);
	
	this._description = "village elder";
	this._char = "@";
	this._color = "brown";
	this._image = "village-elder";
	
	this.fullStats();
}

/**
 * @class Wedding necklace
 * @augments RPG.Items.Necklace
 */
RPG.Items.WeddingNecklace = OZ.Class().extend(RPG.Items.Necklace);
RPG.Items.WeddingNecklace.prototype.init = function() {
	this.parent();
	this._image = "wedding-necklace"; /* FIXME */
	this._color = "gold";
	this._description = "wedding necklace";
}

/**
 * @class Elder's enemy quest
 * @augments RPG.Quests.Kill
 */
RPG.Quests.ElderEnemy = OZ.Class().extend(RPG.Quests.Kill);

RPG.Quests.ElderEnemy.prototype.init = function(giver, being) {
	var chat = new RPG.Misc.Chat(this);
	giver.setChat(chat);
	
	var GIVING = 0;
	
	/* first encounter */
	chat.defineState(RPG.QUEST_NEW, [
		'"Our village was attacked by some evil being recently."',
		'"Maybe you would like to help us?"'
	]);
	chat.defineAnswer(RPG.QUEST_NEW, "Yes, I would be happy to help!", GIVING);
	chat.defineAnswer(RPG.QUEST_NEW, "No, I am not interested.", RPG.QUEST_TALKED);
	
	/* second encounter, if not given yet */
	chat.defineState(RPG.QUEST_TALKED, '"So, you changed your mind regarding that little quest I offered you?"');
	chat.defineEnd(RPG.QUEST_TALKED);
	chat.defineAnswer(RPG.QUEST_TALKED, "Yes, I am now ready to help!", GIVING);
	chat.defineAnswer(RPG.QUEST_TALKED, "No, I am still not interested.", RPG.QUEST_TALKED);
	chat.defineCallback(RPG.QUEST_TALKED, function() { this.setPhase(RPG.QUEST_TALKED); });
	
	/* giving the quest */
	chat.defineState(GIVING, [
		'"The evil being lives in a dungeon close to south-east part of our village."',
		'"If you reach its lair, make sure you retrieve some of the treasure you find there."',
		'"Good luck!"'
	], RPG.QUEST_GIVEN);
	
	/* given the quest */
	chat.defineState(RPG.QUEST_GIVEN, '"That critter is still alive. Find it and kill it!"'); 
	chat.defineEnd(RPG.QUEST_GIVEN);
	chat.defineCallback(RPG.QUEST_GIVEN, function() { this.setPhase(RPG.QUEST_GIVEN); });
	
	/* giving the reward */
	chat.defineState(RPG.QUEST_DONE, [
		'"Thank you for your help! We won\'t forget what you did for our village!"',
		'"Take this gold as our gratitude."'
	], RPG.QUEST_REWARDED);
	
	/* already rewarded */
	chat.defineState(RPG.QUEST_REWARDED, '"No problems in our village..."');
	chat.defineEnd(RPG.QUEST_REWARDED);
	chat.defineCallback(RPG.QUEST_REWARDED, function() { this.setPhase(RPG.QUEST_REWARDED); });

	this._chat = chat;
	this.parent(giver, being);
}

RPG.Quests.ElderEnemy.prototype.setPhase = function(phase) {
	this.parent(phase);
	if (phase == RPG.QUEST_GIVEN) { RPG.Game.getStory().questCallback(this); }
	if (phase == RPG.QUEST_DONE) { this._chat.setState(RPG.QUEST_DONE); }
}

RPG.Quests.ElderEnemy.prototype.reward = function() {
	var gold = new RPG.Items.Gold(1000);
	RPG.Game.pc.addItem(gold);
}

/**
 * @class Lost necklace quest
 * @augments RPG.Quests.Retrieve
 */
RPG.Quests.LostNecklace = OZ.Class().extend(RPG.Quests.Retrieve);
RPG.Quests.LostNecklace.prototype.init = function(giver, item) {
	this._reward = null;
	
	var chat = new RPG.Misc.Chat(this);
	giver.setChat(chat);
	this._chat = chat;
	var REWARD_DEFENSIVE = 0;
	var REWARD_OFFENSIVE = 1;
	var REWARD_TESTING = 2;
	var REWARD_READY = 3;
	
	chat.defineState(RPG.QUEST_NEW, [
		'"Aye, times are bad."',
		'"My daughter\'s wedding is coming, but I lost my present for her."',
		'"It is a precious little necklace - I believe I had it in my pocket when I ventured to that old maze nearby."',
		'"I may have lost it there; you can find the maze\'s entry in a nort-west corner of our village."'
	], RPG.QUEST_GIVEN);
	
	chat.defineState(RPG.QUEST_GIVEN, '"My daughter\'s wedding will be ruined without that necklace!"');
	chat.defineEnd(RPG.QUEST_GIVEN);
	chat.defineCallback(RPG.QUEST_GIVEN, function() { this.setPhase(RPG.QUEST_GIVEN); });
	
	chat.defineState(RPG.QUEST_DONE, ['"I heard you managed to find the necklace! That is great news indeed."'], REWARD_TESTING);
	chat.defineEnd(RPG.QUEST_DONE);
	
	chat.defineState(REWARD_TESTING, ['"Please bring the necklace to me, I will reward you!"'], RPG.QUEST_DONE);
	chat.defineCallback(REWARD_TESTING, function() {
		var pc = RPG.Game.pc;
		var ok = false;
		if (pc.hasItem(this._item)) {
			ok = true;
		} else {
			var i = pc.getSlot(RPG.SLOT_NECK).getItem();
			if (i == this._item) {
				ok = true;
				pc.unequip(RPG.SLOT_NECK);
			}
		}
		
		if (ok) { 
			this._chat.setState(REWARD_READY); 
			pc.removeItem(this._item);
		}
	});
	
	chat.defineState(REWARD_READY, '"As a reward, let me teach you a spell. What kind of magic do you prefer?"');
	chat.defineAnswer(REWARD_READY, "Offensive magic", REWARD_OFFENSIVE);
	chat.defineAnswer(REWARD_READY, "Defensive magic", REWARD_DEFENSIVE);
	
	chat.defineState(REWARD_OFFENSIVE, '"I will teach you the Magic explosion spell."', RPG.QUEST_REWARDED);
	chat.defineCallback(REWARD_OFFENSIVE, function() { this._reward = RPG.Spells.MagicExplosion; });
	
	chat.defineState(REWARD_DEFENSIVE, '"I will teach you the Healing spell."', RPG.QUEST_REWARDED);
	chat.defineCallback(REWARD_DEFENSIVE, function() { this._reward = RPG.Spells.Heal; });
	
	chat.defineState(RPG.QUEST_REWARDED, '"Time will heal every scar."');
	chat.defineEnd(RPG.QUEST_REWARDED);
	chat.defineCallback(RPG.QUEST_REWARDED, function() { this.setPhase(RPG.QUEST_REWARDED); });
	
	this.parent(giver, item);
}

RPG.Quests.LostNecklace.prototype.setPhase = function(phase) {
	this.parent(phase);
	if (phase == RPG.QUEST_GIVEN) { RPG.Game.getStory().questCallback(this); }
	if (phase == RPG.QUEST_DONE) { this._chat.setState(RPG.QUEST_DONE); }
}

RPG.Quests.LostNecklace.prototype.reward = function() {
	var spell = this._reward;
	var pc = RPG.Game.pc;
	if (pc.getSpells().indexOf(spell) != -1) { return; }
	pc.addSpell(spell);
}

/**
 * @class Village-based story
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
	
	this._boss = null;
	this._village = null;
	this._necklace = new RPG.Items.WeddingNecklace();
	
	this._staircaseCallbacks["end"] = this.end;
    this._staircaseCallbacks["elder"] = this._nextElderDungeon;
    this._staircaseCallbacks["maze"] = this._nextElderDungeon;
    this._questCallbacks["elder"] = this._showElderStaircase;
    this._questCallbacks["maze"] = this._showMazeStaircase;

	this._digger = new RPG.Generators.Digger(new RPG.Misc.Coords(60, 20));
	this._maze1 = new RPG.Generators.DividedMaze(new RPG.Misc.Coords(59, 19));
	this._maze2 = new RPG.Generators.IceyMaze(new RPG.Misc.Coords(59, 19), null, 10);
	this._maze3 = new RPG.Generators.Maze(new RPG.Misc.Coords(59, 19));
}

RPG.Story.Village.prototype._createPC = function(race, profession, name) {
	var pc = this.parent(race, profession, name);
	var rocks = new RPG.Items.Rock();
	rocks.setAmount(5);
	pc.addItem(rocks);
	return pc;
}

RPG.Story.Village.prototype._firstMap = function() {
	this._village = this._villageMap();
	return this._village;
}

RPG.Story.Village.prototype._villageMap = function() {
	var map = new RPG.Map.Village();
	var up = map.getFeatures(RPG.Features.Staircase.Up)[0];
	this._staircases["end"] = up;

	this._boss = new RPG.Beings.Troll().setName("Chleba");
	var elder = map.getElder();
	this._quests["elder"] = new RPG.Quests.ElderEnemy(elder, this._boss);

	var healer = map.getHealer();
	this._quests["maze"] = new RPG.Quests.LostNecklace(healer, this._necklace);

	return map;
}

RPG.Story.Village.prototype._showElderStaircase = function() {
    var staircase = new RPG.Features.Staircase.Down();
    this._village.at(new RPG.Misc.Coords(32, 14)).setFeature(staircase);
    this._staircases["elder"] = staircase;
	RPG.UI.map.redrawVisible(); 
}

RPG.Story.Village.prototype._showMazeStaircase = function() {
    var staircase = new RPG.Features.Staircase.Down();
    this._village.at(new RPG.Misc.Coords(1, 1)).setFeature(staircase);
    this._staircases["maze"] = staircase;
	RPG.UI.map.redrawVisible(); 
}

RPG.Story.Village.prototype._nextElderDungeon = function(staircase) {
	this._elderDepth++;

	var rooms = [];
	var map = null;
	do {
		map = this._digger.generate("Dungeon #" + this._elderDepth, this._elderDepth);
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
	var up = new RPG.Features.Staircase.Up();
	map.at(roomUp.getCenter()).setFeature(up);
	
	/* bind to previous dungeon */
	up.setTarget(staircase.getCell());
	
	/* stairs down */
	if (this._elderDepth < this._maxElderDepth) {
		map.setSound("doom");
		var roomDown = arr.random();
		var index = arr.indexOf(roomDown);
		arr.splice(index, 1);
		var down = new RPG.Features.Staircase.Down();
		map.at(roomDown.getCenter()).setFeature(down);
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

		map.at(roomTreasure.getCenter()).setBeing(this._boss);
	}
	
	/* artifact */
	if (this._elderDepth+1 == this._maxElderDepth) {
		var cell = map.getFreeCell(true);
		var tmp = new RPG.Items.KlingonSword();
		var trap = new RPG.Features.Trap.Teleport();
		cell.setFeature(trap);
		cell.addItem(tmp);
	}

	return up.getCell();
}

RPG.Story.Village.prototype._nextMazeDungeon = function(staircase) {
	this._mazeDepth++;

	var generator = this["_maze" + this._mazeDepth];
	map = generator.generate("Maze #" + this._mazeDepth, this._mazeDepth);
	if (this._mazeDepth == 1) { map.setSound("neverhood"); } /* FIXME */

	RPG.Decorators.Hidden.getInstance().decorate(map, 0.01);
	
	var corners = map.cellsInTwoCorners();

	/* stairs up */
	var up = new RPG.Features.Staircase.Up();
	corners[0].setFeature(up);
	
	/* bind to previous dungeon */
	up.setTarget(staircase.getCell());
	
	/* stairs down */
	if (this._mazeDepth < this._maxMazeDepth) {
		var down = new RPG.Features.Staircase.Down();
		corners[1].setFeature(down);
		this._staircases["maze"] = down;
	} else {
		corners[1].addItem(this._necklace);
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
	
	return up.getCell();
}

RPG.Story.Village.prototype._computeScore = function() {
	var total = this.parent();
	total += 150 * this._elderDepth;
	return total;
}

