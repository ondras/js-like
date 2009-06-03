RPG.Actions.Wait = OZ.Class().extend(RPG.Engine.BaseAction);
RPG.Actions.Wait.prototype.init = function(source, target, params) {
	this.parent(source, target, params);
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
	if (this._tookTime) {
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
	var ch = this._tookTime ? "." : "!";
	return this._phrase(str, ch);
}
RPG.Actions.Move.prototype.execute = function() {
	var sourceCell = this._source.getCell();
	var source = sourceCell.getCoords();
	var level = sourceCell.getLevel();
	var target = this._target;
	var targetCell = level.at(target);
	
	var ok = level.valid(target) && targetCell.isFree() && target.distance(source) == 1;
	if (ok) {
		sourceCell.setBeing(null);
		targetCell.setBeing(this._source);
		this._tookTime = true;
	} else {
		this._tookTime = false;
	}
	return this._tookTime;
}
