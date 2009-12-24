/**
 * @class Killing quest
 * @augments RPG.Quests.BaseQuest
 */
RPG.Quests.Kill = OZ.Class().extend(RPG.Quests.BaseQuest);

RPG.Quests.Kill.prototype.init = function(giver, being) {
	this.parent(giver);
	this._being = being;

	var instance = being;
	var target = being;
	if (typeof(being) == "function") {
		instance = new being();
		instance.setGender(RPG.GENDER_MALE);
		target = null;
	}
	
	var s = RPG.Misc.format("Kill %a", instance);
	this.setTask(s);
	this._event = OZ.Event.add(target, "death", this.bind(this._death));
}

RPG.Quests.Kill.prototype._death = function(e) {
	if (typeof(this._being) == "function" && e.target.constructor != this._being) { return; }

	OZ.Event.remove(this._event);
	this.setPhase(RPG.QUEST_DONE);
}
