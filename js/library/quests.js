/**
 * @class Killing quest
 * @augments RPG.Quests.BaseQuest
 */
RPG.Quests.Kill = OZ.Class().extend(RPG.Quests.BaseQuest);

RPG.Quests.Kill.prototype.init = function(giver, being) {
	this.parent(giver);
	var s = RPG.Misc.format("Kill %a", being);
	this.setTask(s);
	this._being = being;
	this._event = OZ.Event.add(being, "death", this.bind(this._death));
}

RPG.Quests.Kill.prototype._death = function(action) {
	OZ.Event.remove(this._event);
	this.setPhase(RPG.QUEST_DONE);
}
