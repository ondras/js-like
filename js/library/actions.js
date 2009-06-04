RPG.Actions.Wait = OZ.Class().extend(RPG.Engine.BaseAction);
RPG.Actions.Wait.prototype.init = function(source, target, params) {
	this.parent(source, target, params);
}
RPG.Actions.Wait.prototype.describe = function(who) {
	var str = this._source.describeA(who);
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
	var str = this._source.describeA(who);
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
	var level = this._source.getLevel();
	var source = this._source.getCoords();
	var target = this._target;
	
	var ok = level.valid(target) && level.isFree(target) && target.distance(source) == 1;
	if (ok) {
		level.setBeing(source, null);
		level.setBeing(target, this._source);
		this._tookTime = true;
	} else {
		this._tookTime = false;
	}
	return this._tookTime;
}
