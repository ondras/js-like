/**
 * @class Village map
 * @augments RPG.Map
 */
RPG.Map.Village = OZ.Class().extend(RPG.Map);

RPG.Map.Village.prototype.init = function() {
    var cellmap = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [3,0,1,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [3,3,1,2,2,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0],
        [0,3,1,1,1,1,0,0,0,0,0,1,2,2,2,1,0,0,0,0],
        [0,3,0,0,0,0,0,0,0,0,0,1,1,1,2,1,0,0,0,0],
        [0,3,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,3,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,3,3,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ];

	var height = cellmap.length;
	var width = cellmap[0].length;
	var size = new RPG.Misc.Coords(width, height);
	this.parent("A small village", size, 1);

	this._modifiers[RPG.FEAT_SIGHT_RANGE] = 2;
	
    var celltypes = [
        RPG.Cells.Grass,
        RPG.Cells.Wall,
        RPG.Cells.Corridor,
        RPG.Cells.Water,
    ];

    this.fromIntMap(cellmap.transpose(), celltypes);
	this.setWelcome("You come to a small peaceful village.");

    var doors_left = new RPG.Features.Door();
    var doors_right = new RPG.Features.Door();
    var stairs_down = new RPG.Features.Staircase.Down();
    var stairs_up = new RPG.Features.Staircase.Up();
    doors_left.close();
    doors_right.close();

    var c = null;

    c = this.at(new RPG.Misc.Coords(5,3));
    c.setFeature(doors_left);

    c = this.at(new RPG.Misc.Coords(14,6));
    c.setFeature(doors_right);

    c = this.at(new RPG.Misc.Coords(18,9));
    c.setFeature(stairs_down);

    c = this.at(new RPG.Misc.Coords(12,2));
    c.setFeature(stairs_up);

	this._elder = new RPG.Beings.VillageElder();
	this.at(new RPG.Misc.Coords(13, 5)).setBeing(this._elder);

	var task = new RPG.AI.WanderInArea(new RPG.Misc.Coords(12, 5), new RPG.Misc.Coords(14, 5));
	this._elder.ai().setDefaultTask(task);
	
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

	this._sound = "tristram";
}

RPG.Map.Village.prototype.use = function() {
	this.parent();
	RPG.UI.sound.preload("doom");
}

RPG.Map.Village.prototype.getElder = function() {
	return this._elder;
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
		this._staircaseCell.setFeature(this._staircase);
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
	])
		.setEnd(function(){
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

/**
 * @class Elder's enemy quest
 * @augments RPG.Quests.Kill
 */
RPG.Quests.ElderEnemy = OZ.Class().extend(RPG.Quests.Kill);
RPG.Quests.ElderEnemy.prototype.reward = function() {
	var gold = new RPG.Items.Gold(1000);
	RPG.World.pc.addItem(gold);
}
