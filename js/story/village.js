/**
 * @class Small village map
 * @augments RPG.Map.Village
 */
RPG.Map.SmallVillage = OZ.Class().extend(RPG.Map.Village);

RPG.Map.SmallVillage.prototype.init = function() {
    var str = 	"...===............................." +
				"...===...####......................" +
				"....===..#__#......................" +
				".....===.#___......................" +
				"......===#__#.....#####.....#####.." +
				"......===####.....#___#.....#___#.." +
				".###...==.........#___#.....#___#.." +
				".#.#....=.###.....###_#.....____#.." +
				".#.#...==.#_#...............#___#.." +
				".#.....===###...............#___#.." +
				".###....==.......###_#......#####.." +
				"........==.......#___#........==..." +
				".......====......#___#.........==.." +
				".......====......#___#............." +
				"......==.==......#####............." +
				".....==..=.........................";

	var width = 35;
	var height = str.length/width;
	var size = new RPG.Misc.Coords(width, height);
	this.parent("A small village", size, 1);

	this._modifiers[RPG.FEAT_SIGHT_RANGE] = 2;
	this._sound = "tristram";
	
	this.fromString(str, {"=":RPG.Cells.Water.getInstance(), "_":RPG.Cells.Corridor.getInstance()});
	this.setWelcome("You come to a small peaceful village.");

	this._buildPeople();

    var trees = 8;
	while (trees--) {
		var coords = this.getFreeCoords();
		if (this.getArea(coords)) { continue; } /* FIXME buildings should be defined as areas, will contain trees otherwise */
		this.setFeature(new RPG.Features.Tree(), coords);
	}
}

RPG.Map.SmallVillage.prototype.entering = function(being) {
	this.parent(being);
	if (being != RPG.Game.pc) { return; }

	RPG.UI.sound.preload("doom");
}

RPG.Map.SmallVillage.prototype.getElder = function() {
	return this._elder;
}

RPG.Map.SmallVillage.prototype.getSmith = function() {
	return this._smith;
}

RPG.Map.SmallVillage.prototype.getHealer = function() {
	return this._healer;
}

RPG.Map.SmallVillage.prototype.getWitch = function() {
	return this._witch;
}

RPG.Map.SmallVillage.prototype.getShopkeeper = function() {
	return this._shopkeeper;
}

RPG.Map.SmallVillage.prototype._buildPeople = function() {
    var doors_healer = new RPG.Features.Door();
    var doors_smith = new RPG.Features.Door();
    var doors_shop = new RPG.Features.Door();
    var doors_townhall = new RPG.Features.Door();
    var stairs_up = new RPG.Features.StaircaseUp();
    doors_healer.close();
    doors_smith.open();
    doors_shop.open();
    doors_townhall.close();

	var shop1 = new RPG.Misc.Coords(18, 11);
	var shop2 = new RPG.Misc.Coords(20, 13);
	var shop = new RPG.Areas.Shop(shop1, shop2);
	this.addArea(shop);
	
    this.setFeature(doors_healer, new RPG.Misc.Coords(12,3));
    this.setFeature(doors_smith, new RPG.Misc.Coords(21,7));
    this.setFeature(doors_townhall, new RPG.Misc.Coords(28,7));
    this.setFeature(stairs_up, new RPG.Misc.Coords(20,2));

    var task = null;

	this._elder = new RPG.Beings.VillageElder();
	this.setBeing(this._elder, new RPG.Misc.Coords(30, 5));
    task = new RPG.AI.Wait();
	this._elder.getAI().setDefaultTask(task);

    this._witch = new RPG.Beings.VillageWitch();
    this.setBeing(this._witch, new RPG.Misc.Coords(2,7));
    task = new RPG.AI.Wait();
	this._witch.getAI().setDefaultTask(task);

    this._healer = new RPG.Beings.VillageHealer();
    this.setBeing(this._healer, new RPG.Misc.Coords(11,3));
    task = new RPG.AI.WanderInArea(new RPG.Misc.Coords(10, 2), new RPG.Misc.Coords(11, 4));
	this._healer.getAI().setDefaultTask(task);

    this._smith = new RPG.Beings.VillageSmith();
    this.setBeing(this._smith, new RPG.Misc.Coords(20,6));
    task = new RPG.AI.WanderInArea(new RPG.Misc.Coords(19, 5), new RPG.Misc.Coords(21, 6));
	this._smith.getAI().setDefaultTask(task);

    this._shopkeeper = new RPG.Beings.VillageShopkeeper();
	shop.setShopkeeper(this._shopkeeper);

    this._guard_one = new RPG.Beings.VillageGuard();
    this.setBeing(this._guard_one, new RPG.Misc.Coords(27,6));
    task = new RPG.AI.Wait();
	this._guard_one.getAI().setDefaultTask(task);

    this._guard_two = new RPG.Beings.VillageGuard();
    this.setBeing(this._guard_two, new RPG.Misc.Coords(27,8));
    task = new RPG.AI.Wait();
	this._guard_two.getAI().setDefaultTask(task);

	var residents = 5;
	var chats = [
		["Work, work.", "villager-work"],
		["Ask our elder.", null]
	];
	
    for (var i = 0; i < residents; i++) {
        var villager = new RPG.Beings.Villager();
	    var chat = chats.random();
		villager.getAI().setDialogText(chat[0]);
		villager.getAI().setDialogSound(chat[1]);
        this.setBeing(villager, this.getFreeCoords());
    }
}

/**
 * @class Village healer
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageHealer = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageHealer.factory.ignore = true;
RPG.Beings.VillageHealer.visual = { desc:"village healer", color:"#f00", image:"village-healer" };
RPG.Beings.VillageHealer.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);

	this.setGender(RPG.GENDER_MALE);
	this.setConfirm(RPG.CONFIRM_ASK);
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	this.setFeat(RPG.FEAT_DEXTERITY, 15);
	this.setFeat(RPG.FEAT_MAGIC, 20);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 20);
	
	this.fullStats();
}

/**
 * @class Village shopkeeper
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageShopkeeper = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageShopkeeper.factory.ignore = true;
RPG.Beings.VillageShopkeeper.visual = { desc:"shopkeeper", color:"#f00", image:"village-shopkeeper" };
RPG.Beings.VillageShopkeeper.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);

	this.setGender(RPG.GENDER_FEMALE);
	this.setConfirm(RPG.CONFIRM_ASK);
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	this.setFeat(RPG.FEAT_SPEED, 200);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_STRENGTH, 20);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);

	this.fullStats();
}

/**
 * @class Village witch
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageWitch = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageWitch.factory.ignore = true;
RPG.Beings.VillageWitch.visual = { desc:"witch", color:"#00f", image:"village-witch" };
RPG.Beings.VillageWitch.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);

	this.setConfirm(RPG.CONFIRM_ASK);
	this.setGender(RPG.GENDER_FEMALE);
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	this.setFeat(RPG.FEAT_MAGIC, 25);
	this.setFeat(RPG.FEAT_MAX_HP, 20);

	var broom = new RPG.Items.Broom();
	this.addItem(broom);
	this.equip(RPG.SLOT_WEAPON, broom);
	
	this.addSpell(RPG.Spells.MagicBolt);
	this.addSpell(RPG.Spells.Teleport);

	this._ai.setDialogText("Quidquid latine dictum sit, altum sonatur.");

	this.fullStats();
}

/**
 * @class Village guard
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageGuard = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageGuard.factory.ignore = true;
RPG.Beings.VillageGuard.visual = { desc:"elder's guard", color:"#f00", image:"village-guard" };
RPG.Beings.VillageGuard.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);

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
	
	this._ai.setDialogText("Hey there! Friend or foe?");

	this.fullStats();
}

/**
 * @class Village smith
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageSmith = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageSmith.factory.ignore = true;
RPG.Beings.VillageSmith.visual = { desc:"dwarven smith", color:"#999", ch:"h", image:"village-smith" };
RPG.Beings.VillageSmith.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);

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
	this.equip(RPG.SLOT_WEAPON, hammer);
	
	this.fullStats();
}

/**
 * @class Village elder
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageElder = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageElder.factory.ignore = true;
RPG.Beings.VillageElder.visual = { desc:"village elder", color:"#960", image:"village-elder" };
RPG.Beings.VillageElder.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);

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
	
	this.fullStats();
}

/**
 * @class Wedding necklace
 * @augments RPG.Items.Necklace
 */
RPG.Items.WeddingNecklace = OZ.Class().extend(RPG.Items.Necklace);
RPG.Items.WeddingNecklace.factory.ignore = true;
RPG.Items.WeddingNecklace.visual = { desc:"wedding necklace", image:"wedding-necklace", color:"#fc0" };

/**
 * @class Smith's trophy quest
 * @augments RPG.Misc.IDialog
 * @augments RPG.Quests.Kill
 */
RPG.Quests.SmithTrophy = OZ.Class()
							.extend(RPG.Quests.Kill)
							.implement(RPG.Misc.IDialog);

RPG.Quests.SmithTrophy.prototype.init = function(giver) {
	var cl = RPG.Factories.npcs.getClass(1);
	this.parent(giver, cl);
	giver.getAI().setDialogQuest(this);
}

RPG.Quests.SmithTrophy.prototype.setPhase = function(phase) {
	this.parent(phase);
	if (phase == RPG.QUEST_REWARDED) { new this.constructor(this._giver); }
}

RPG.Quests.SmithTrophy.prototype.reward = function() {
	RPG.Game.pc.addItem(new RPG.Items.Gold(100));
}

RPG.Quests.SmithTrophy.prototype.getDialogText = function(being) {
	switch (this._phase) {
		case RPG.QUEST_NEW: 
			var instance = new this._being();
			instance.setGender(RPG.GENDER_MALE);
			var label = instance.describeA();
			return [
				"Aye! Need some steel?",
				"You look skilled enough; let me know if you manage to kill " + label + ", I will give ya a hundred gold for that.",
				"You might want to look for it in the small dungeon in the south-west part of our village; that strange cave \
				looks different every time you visit it!"
			];
		break;
		
		case RPG.QUEST_GIVEN:
			return [
				"No need to hurry, just kill it whet it crosses your path."
			];
		break;
		
		case RPG.QUEST_DONE:
			return [
				"Good kill! One day you will become a true master.",
				"As I promised, take this gold as a reward."
			];
		break;

		case RPG.QUEST_REWARDED:
			return ""; /* can not happen; once the quest reaches REWARDED state, it is automatically replaced by a new quest */
		break;
	}
}

RPG.Quests.SmithTrophy.prototype.advanceDialog = function(optionIndex, being) {
	switch (this._phase) {
		case RPG.QUEST_NEW:
			this.setPhase(RPG.QUEST_GIVEN);
			return false;
		break;
		
		case RPG.QUEST_GIVEN: 
			return false;
		break;
		
		case RPG.QUEST_DONE: 
			this.setPhase(RPG.QUEST_REWARDED);
			return false;
		break;

		case RPG.QUEST_REWARDED:
			return false;
		break;
	}
}

/**
 * @class Elder's enemy quest
 * @augments RPG.Misc.IDialog
 * @augments RPG.Quests.Kill
 */
RPG.Quests.ElderEnemy = OZ.Class()
							.extend(RPG.Quests.Kill)
							.implement(RPG.Misc.IDialog);

RPG.Quests.ElderEnemy.prototype.init = function(giver, being) {
	this._GIVING = 1;
	this.parent(giver, being);
	giver.getAI().setDialogQuest(this);
}

RPG.Quests.ElderEnemy.prototype.setPhase = function(phase) {
	this.parent(phase);
	if (phase == RPG.QUEST_GIVEN) { RPG.Game.getStory().questCallback(this); }
}

RPG.Quests.ElderEnemy.prototype.reward = function() {
	RPG.Game.pc.addItem(new RPG.Items.Gold(1000));
}

RPG.Quests.ElderEnemy.prototype.getDialogText = function(being) {
	switch (this._phase) {
		case RPG.QUEST_NEW: 
			return [
				"Welcome, adventurer. You come to our village in desperate times, as we were attacked by some evil being recently. \
				Even our bravest men failed to defeat it!",
				"Maybe you would like to help us?"
			];
		break;
		
		case RPG.QUEST_TALKED:
			return "So, you changed your mind regarding that little quest I offered you? \
				Such service will surely be rewarded...";
		break;
		
		case this._GIVING:
			return [
				"The evil being lives in a dungeon close to south-east part of our village. \
				You might encounter strange creatures down there, so take care and arm yourself for the voyage.",
				"If you reach the lair at the bottom of a cave system, make sure you retrieve some of the treasure you find there. \
				Good luck!"
			];
		break;
		
		case RPG.QUEST_GIVEN:
			return "That critter is still alive. Find it and kill it!";
		break;
		
		case RPG.QUEST_DONE:
			return [
				"Thank you for your help! We won't forget what you did for our village!",
				"Take this gold as our gratitude."
			];
		break;

		case RPG.QUEST_REWARDED:
			return "No problems in our village...";
		break;
	}
}

RPG.Quests.ElderEnemy.prototype.getDialogOptions = function(being) {
	switch (this._phase) {
		case RPG.QUEST_NEW:
			return ["Yes, I would be happy to help!", "No, I am not interested."];
		break;
		
		case RPG.QUEST_TALKED:
			return ["Yes, I am now ready to help!", "No, I am still not interested."];
		break;
		
		default:
			return [];
		break;
	}
}

RPG.Quests.ElderEnemy.prototype.advanceDialog = function(optionIndex, being) {
	switch (this._phase) {
		case RPG.QUEST_NEW:
			if (optionIndex == 0) { /* yes */
				this.setPhase(this._GIVING);
				return true;
			} else { /* no */
				this.setPhase(RPG.QUEST_TALKED);
				return false;
			}
		break;
		
		case RPG.QUEST_TALKED: 
			if (optionIndex == 0) { /* yes */
				this.setPhase(this._GIVING);
				return true;
			} else { /* no */
				return false;
			}
		break;
		
		case this._GIVING: 
			this.setPhase(RPG.QUEST_GIVEN);
			return false;
		break;
		
		case RPG.QUEST_GIVEN: 
			return false;
		break;
		
		case RPG.QUEST_DONE: 
			this.setPhase(RPG.QUEST_REWARDED);
			return false;
		break;

		case RPG.QUEST_REWARDED:
			return false;
		break;
	}
}

/**
 * @class Lost necklace quest
 * @augments RPG.Quests.Retrieve
 * @augments RPG.Misc.IDialog
 */
RPG.Quests.LostNecklace = OZ.Class()
							.extend(RPG.Quests.Retrieve)
							.implement(RPG.Misc.IDialog);
RPG.Quests.LostNecklace.prototype.init = function(giver, item) {
	this._REWARD_DEFENSIVE = 0;
	this._REWARD_OFFENSIVE = 1;
	
	this._reward = null;
	this._hasItem = false;
	this.parent(giver, item);
	giver.getAI().setDialogQuest(this);
}

RPG.Quests.LostNecklace.prototype.setPhase = function(phase) {
	this.parent(phase);
	if (phase == RPG.QUEST_GIVEN) { RPG.Game.getStory().questCallback(this); }
}

RPG.Quests.LostNecklace.prototype.reward = function() {
	var spell = this._reward;
	var pc = RPG.Game.pc;
	if (pc.getSpells().indexOf(spell) != -1) { return; }
	pc.addSpell(spell);
}

RPG.Quests.LostNecklace.prototype.getDialogText = function(being) {
	switch (this._phase) {
		case RPG.QUEST_NEW: 
			return [
				"Aye, times are bad. \
				My daughter's wedding is coming, but I lost my present for her.",
				"It is a precious little necklace - I believe I had it in my pocket when I ventured to that old maze nearby. \
				I may have lost it there; you can find the maze's entry in a nort-west corner of our village."
			];
		break;
		
		case RPG.QUEST_GIVEN:
			return "My daughter's wedding will be ruined without that necklace!";
		break;
		
		case RPG.QUEST_DONE:
			var text = ["I heard you managed to find the necklace! That is great news indeed."];
			
			if (being.hasItem(this._item)) {
				this._hasItem = true;
			} else {
				var i = being.getSlot(RPG.SLOT_NECK).getItem();
				if (i == this._item) { this._hasItem = true; }
			}
			
			if (this._hasItem) { 
				text.push("As a reward, let me teach you a spell. What kind of magic do you prefer?");
			} else {
				text.push("Please bring the necklace to me, I will reward you!");
			}
			return text;
		break;
		
		case this._REWARD_OFFENSIVE:
			return "I will teach you the Magic explosion spell.";
		break;

		case this._REWARD_DEFENSIVE:
			return "I will teach you the Healing spell.";
		break;

		case RPG.QUEST_REWARDED:
			return "Time will heal every scar.";
		break;
	}
}

RPG.Quests.LostNecklace.prototype.getDialogOptions = function(being) {
	switch (this._phase) {
		case RPG.QUEST_DONE:
			if (this._hasItem) {
				return ["Offensive magic", "Defensive magic"];
			} else {
				return [];
			}
		break;

		default:
			return [];
		break;
	}
}

RPG.Quests.LostNecklace.prototype.advanceDialog = function(optionIndex, being) {
	switch (this._phase) {
		case RPG.QUEST_NEW:
			this.setPhase(RPG.QUEST_GIVEN);
			return false;
		break;
		
		case RPG.QUEST_GIVEN: 
			return false;
		break;
		
		case RPG.QUEST_DONE:
			if (this._hasItem) {
				var i = being.getSlot(RPG.SLOT_NECK).getItem();
				if (i == this._item) { being.unequip(RPG.SLOT_NECK); }
				being.removeItem(this._item);
				
				if (optionIndex == 0) { /* offensive */
					this._reward = RPG.Spells.MagicExplosion;
					this.setPhase(this._REWARD_OFFENSIVE);
				} else { /* defensive */
					this._reward = RPG.Spells.Heal;
					this.setPhase(this._REWARD_DEFENSIVE);
				}
				
				return true;
			} else {
				return false;
			}
		break;

		case this._REWARD_OFFENSIVE:
			this.setPhase(RPG.QUEST_REWARDED);
			return false;
		break;

		case this._REWARD_DEFENSIVE:
			this.setPhase(RPG.QUEST_REWARDED);
			return false;
		break;

		case RPG.QUEST_REWARDED:
			return false;
		break;
	}
}

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
	if (!feature) { return; } /* panic; we are not on a staircase? */
	
	/* mark the target staircase as empty */
	var target = feature.getTarget();
	target.setTarget(null);
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
	
	this._addCallbacks();
	this._boss = null;
	this._village = null;
	this._necklace = new RPG.Items.WeddingNecklace();
}

RPG.Story.Village.prototype.revive = function() {
	this.parent();
	this._addCallbacks();
}

RPG.Story.Village.prototype._addCallbacks = function() {
	this._staircaseCallbacks["end"] = this._end;
    this._staircaseCallbacks["elder"] = this._nextElderDungeon;
    this._staircaseCallbacks["maze"] = this._nextMazeDungeon;
    this._staircaseCallbacks["dungeon"] = this._nextGenericDungeon;
    this._questCallbacks["elder"] = this._showElderStaircase;
    this._questCallbacks["maze"] = this._showMazeStaircase;
}

RPG.Story.Village.prototype._end = function(staircase) {
	if (!RPG.UI.confirm("Do you want to leave the village (this will end the game)?")) { return; }
	RPG.Game.end();
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
	return [this._village, this._village.getFeatures(RPG.Features.Connector.Exit)[0].getCoords()];
}

RPG.Story.Village.prototype._villageMap = function() {
	var map = new RPG.Map.SmallVillage();
	var up = map.getFeatures(RPG.Features.Connector.Exit)[0];
	this._staircases["end"] = up;

	this._boss = new RPG.Beings.Troll().setName("Chleba");
	var elder = map.getElder();
	this._quests["elder"] = new RPG.Quests.ElderEnemy(elder, this._boss);

	var healer = map.getHealer();
	this._quests["maze"] = new RPG.Quests.LostNecklace(healer, this._necklace);
	
	new RPG.Quests.SmithTrophy(map.getSmith());

    var staircase = new RPG.Features.StaircaseDown();
    map.setFeature(staircase, new RPG.Misc.Coords(1, 14));
    this._staircases["dungeon"] = staircase;

	return map;
}

RPG.Story.Village.prototype._showElderStaircase = function() {
    var staircase = new RPG.Features.StaircaseDown();
    this._village.setFeature(staircase, new RPG.Misc.Coords(32, 14));
    this._staircases["elder"] = staircase;
}

RPG.Story.Village.prototype._showMazeStaircase = function() {
    var staircase = new RPG.Features.StaircaseDown();
    this._village.setFeature(staircase, new RPG.Misc.Coords(1, 1));
    this._staircases["maze"] = staircase;
}

RPG.Story.Village.prototype._nextElderDungeon = function(staircase) {
	this._elderDepth++;
	var size = new RPG.Misc.Coords(60, 20);
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
	var size = new RPG.Misc.Coords(59, 19);
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
	var gen = RPG.Generators.Uniform.getInstance();
	var map = gen.generate("Generic dungeon", new RPG.Misc.Coords(60, 20), 1, {ctor:RPG.Map.RandomDungeon});
	RPG.Decorators.Hidden.getInstance().decorate(map, 0.01);
	
	/* stairs up */
	var room = map.getRooms().random();
	var up = new RPG.Features.StaircaseUp();
	map.setFeature(up, room.getCenter());
	
	/* bind to previous dungeon */
	up.setTarget(staircase);
	staircase.setTarget(up);
	
	/* enemies */
	var max = 4 + Math.floor(Math.random()*6);
	RPG.Decorators.Beings.getInstance().decorate(map, max);
	
	/* items */
	var max = 1 + Math.floor(Math.random()*3);
	RPG.Decorators.Items.getInstance().decorate(map, max);

	/* traps */
	var max = 1 + Math.floor(Math.random()*2);
	RPG.Decorators.Traps.getInstance().decorate(map, max);
}

RPG.Story.Village.prototype.computeScore = function() {
	var total = this.parent();
	total += 150 * this._elderDepth;
	return total;
}

