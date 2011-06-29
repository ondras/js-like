/**
 * @class Killing quest
 * @augments RPG.Quests.BaseQuest
 */
RPG.Quests.Kill = OZ.Class().extend(RPG.Quests.BaseQuest);

RPG.Quests.Kill.prototype.init = function(giver, being) {
	this.parent(giver);
	this._being = being;
	this._event = null;

	var instance = being;
	var target = being;
	if (typeof(being) == "function") {
		instance = new being();
		instance.setGender(RPG.GENDER_MALE);
		target = null;
	}
	
	var s = RPG.Misc.format("Kill %a", instance);
	this.setTask(s);
	this._addEvents();
}

RPG.Quests.Kill.prototype.revive = function() {
	this._addEvents();
}

RPG.Quests.Kill.prototype._addEvents = function() {
	var target = this._being;
	if (typeof(target) == "function") { target = null; }

	this._event = RPG.Game.addEvent(target, "being-death", this.bind(this._death));
}

RPG.Quests.Kill.prototype._death = function(e) {
	if (this._phase != RPG.QUEST_GIVEN) { return; }
	if (typeof(this._being) == "function" && e.target.constructor != this._being) { return; }

	RPG.Game.removeEvent(this._event);
	this.setPhase(RPG.QUEST_DONE);
}

/**
 * @class Retrieving quest
 * @augments RPG.Quests.BaseQuest
 */
RPG.Quests.Retrieve = OZ.Class().extend(RPG.Quests.BaseQuest);

RPG.Quests.Retrieve.prototype.init = function(giver, item) {
	this.parent(giver);
	this._item = item;
	this._event = null;

	var s = RPG.Misc.format("Find %a and bring it to %the", item, giver);
	this.setTask(s);
	this._addEvents();
}

RPG.Quests.Retrieve.prototype.revive = function() {
	this._addEvents();
}

RPG.Quests.Retrieve.prototype._addEvents = function() {
	this._event = RPG.Game.addEvent(RPG.Game.pc, "item-pick", this.bind(this._pick));
}

RPG.Quests.Retrieve.prototype._pick = function(e) {
	var item = e.data.item;
	if (item != this._item) { return; }
	RPG.Game.removeEvent(this._event);
	this.setPhase(RPG.QUEST_DONE);
}
