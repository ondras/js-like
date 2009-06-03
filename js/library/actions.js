RPG.Actions.Wait = OZ.Class().extend(RPG.Engine.BaseAction);
RPG.Actions.Wait.prototype.init = function(source, target, params) {
	this.parent(source, target, params);
	this._success = true;
}
RPG.Actions.Wait.prototype.describe = function(who) {
	var str = this._source.describe(who);
	str += " ";
	if (this._source == who) {
		str += "wait";
	} else {
		str += "waits";
	}
	return this._phrase(str, ".");
}

RPG.Actions.Move = OZ.Class().extend(RPG.Engine.BaseAction);
RPG.Actions.Move.prototype.describe = function(who) {
	var str = this._source.describe(who);
	str += " ";
	if (this._success) {
		if (this._source == who) {
			str += "move to";
		} else {
			str += "moves to";
		}
	} else {
		str += "cannot move to";
	}
	str += " ";
	str += this._target.describe(who);
	var ch = this._success ? "." : "!";
	return this._phrase(str, ch);
}
RPG.Actions.Move.prototype.execute = function() {
	var world = this._source.getWorld();
	var level = world.getLevel();
	
	var source = level.find(this._source);
	var sourceCell = level.at(source);
	var target = this._target;
	var targetCell = level.at(target);
	
	var ok = level.valid(target) && targetCell.isFree() && target.distance(source) == 1;
	if (ok) {
		sourceCell.setBeing(null);
		targetCell.setBeing(this._source);
		this._success = true;
	} else {
		this._success = false;
	}
	return this._success;
}
