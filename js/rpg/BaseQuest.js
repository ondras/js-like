/**
 * @class Quest
 */
RPG.Quests.BaseQuest = OZ.Class();
RPG.Quests.BaseQuest.prototype.init = function(giver) {
	this._phase = null;
	this._giver = giver;
	this._task = null; /* textual description */
	
	this.setPhase(RPG.QUEST_NEW);
}

RPG.Quests.BaseQuest.prototype.setPhase = function(phase) {
	this._phase = phase;
	
	switch (phase) {
		case RPG.QUEST_GIVEN:
			RPG.Game.pc.addQuest(this);
		break;
		case RPG.QUEST_DONE:
			RPG.UI.buffer.important("You have just completed a quest.");
		break;
		case RPG.QUEST_REWARDED:
			RPG.Game.pc.removeQuest(this);
			this.reward();
		break;
	}
	
	return this;
}
RPG.Quests.BaseQuest.prototype.getPhase = function() {
	return this._phase;
}
RPG.Quests.BaseQuest.prototype.getGiver = function() {
	return this._giver;
}
RPG.Quests.BaseQuest.prototype.getTask = function() {
	return this._task;
}
RPG.Quests.BaseQuest.prototype.setTask = function(task) {
	this._task = task;
	return this;
}
RPG.Quests.BaseQuest.prototype.reward = function() {
}
