/**
 * @class Villager
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Villager = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Villager.factory.ignore = true;
RPG.Beings.Villager.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	
	this._description = "villager";
	this._char = "@";
	this._color = "peru";
	this._image = "villager";
	
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
	this.equip(sword, this.getMeleeSlot());
	
	this._description = "village elder";
	this._char = "@";
	this._color = "brown";
	this._image = "village-elder";
	
	this.fullStats();
	
	this._quest = null;
	
	this._chats = {};
	this._given = new RPG.Misc.Chat([
		'"The evil being lives in a dungeon close to south-east part of our village."',
		'"If you reach its lair, make sure you retrieve some of the treasure you find there."',
		'"Good luck!"'
	]).setEnd(function() {
		this._quest.setPhase(RPG.QUEST_GIVEN);
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
	
	this._chats[RPG.QUEST_GIVEN] = new RPG.Misc.Chat('"That evil being is still alive. Find it and kill it!"');
	
	this._chats[RPG.QUEST_DONE] = new RPG.Misc.Chat('"Thank you for your help! We won\'t forget what you did for our village!"')
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
	this._quest = new RPG.Quests.Kill(being);
}
