/**
 * @class Smith's trophy quest
 * @augments RPG.IDialog
 * @augments RPG.Quests.Kill
 */
RPG.Quests.SmithTrophy = OZ.Class().extend(RPG.Quests.Kill)
				   .implement(RPG.IDialog);

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
				"You might want to look for it in underground caves located in the nothern part of the crossroads. Those strange caves \
				look different every time you visit them!"
			];
		break;
		
		case RPG.QUEST_GIVEN:
			return [
				"No need to hurry, just kill it when it crosses your path."
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
 * @augments RPG.IDialog
 * @augments RPG.Quests.Kill
 */
RPG.Quests.ElderEnemy = OZ.Class().extend(RPG.Quests.Kill)
				  .implement(RPG.IDialog);

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
 * @augments RPG.IDialog
 */
RPG.Quests.LostNecklace = OZ.Class().extend(RPG.Quests.Retrieve)
				    .implement(RPG.IDialog);

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
