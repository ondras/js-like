/**
 * Waiting, doing nothing
 */
RPG.Actions.Wait = OZ.Class().extend(RPG.Engine.BaseAction);
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

/**
 * Moving to a given cell. Target == coords.
 */
RPG.Actions.Move = OZ.Class().extend(RPG.Engine.BaseAction);
RPG.Actions.Move.prototype.execute = function() {
	var level = this._source.getMap();
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
}
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
	str += this._target.toString(who);
	var ch = this._tookTime ? "." : "!";
	return this._phrase(str, ch);
}

/**
 * Attacking other being. Target == being.
 */
RPG.Actions.Attack = OZ.Class().extend(RPG.Engine.BaseAction);
RPG.Actions.Attack.prototype.init = function(source, target, params) {
	this.parent(source, target, params);
	this._hit = false;
	this._damage = false;
	this._kill = false;
	this._tookTime = true;
}
RPG.Actions.Attack.prototype.execute = function() {
	/* hit? */
	var hit = this._source.getHit() + Math.round(Math.randomNormal(5));
	var dv = this._target.getDV();
	if (hit < dv) { 
		return; 
	} else {
		this._hit = true;
	}

	/* damage? */
	var damage = this._source.getDamage() + Math.round(Math.randomNormal(10)); 
	damage = Math.max(damage, 0);
	var pv = this._target.getPV();
	if (damage > pv) {
		var amount = damage - pv;
		this._damage = amount;
		var alive = this._target.adjustHP(-amount);
		if (!alive) { this._kill = true; }
	}
}
RPG.Actions.Attack.prototype.describe = function(who) {
	var str = this._source.describeThe(who);
	str += " ";
	
	if (!this._hit) {
		str += (who == this._source ? "miss" : "misses");
		str += " ";
		str += this._target.describeThe(who);
		return this._phrase(str, ".");
	}
	
	if (!this._damage) {
		if (who == this._source) {
			str += "hit";
			str += " ";
			str += this._target.describeThe(who);
			str += " ";
			str += "but do not manage to harm";
			str += " ";
			str += this._target.describeIt();
			return this._phrase(str, ".");
		} else {
			str += "fails to hurt";
			str += " ";
			str += this._target.describeThe(who);
			return this._phrase(str, ".");
		}
	}
	
	str += (who == this._source ? "hit" : "hits");
	str += " ";
	str += this._target.describeThe(who);
	var ch = ".";
	if (this._kill) {
		ch = "!";
		str += " ";
		str += "and kill";
		str += " ";
		str += this._target.describeIt();
	}
	return this._phrase(str, ch);
}
