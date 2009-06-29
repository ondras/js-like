/**
 * @class Waiting, doing nothing
 * @augments RPG.Engine.BaseAction
 */
RPG.Actions.Wait = OZ.Class().extend(RPG.Engine.BaseAction);
RPG.Actions.Wait.prototype.execute = function() {
/*	var str = "";
	if (this._source == RPG.World.getPC()) {
		str = "you wait";
	} else {
		str = this._source.describeA() + " waits";
	}
	RPG.UI.Buffer.show(str+".");
*/
}

/**
 * @class Moving to a given cell. Target == coords.
 * @augments RPG.Engine.BaseAction
 */
RPG.Actions.Move = OZ.Class().extend(RPG.Engine.BaseAction);
RPG.Actions.Move.prototype.execute = function() {
	var level = this._source.getMap();
	var source = this._source.getCoords();
	var target = this._target;
	var you = (this._source == RPG.World.getPC());

	level.setBeing(source, null);
	level.setBeing(target, this._source);
	this._tookTime = true;

/*	
	var str = "";
	str = (you ? "you" : this._source.describeA());
	str += " " + (you ? "move to" : "moves to");
	str += " "+this._target.toString()+".";
	RPG.UI.Buffer.show(str);
*/
	if (you) {
		this._seeItems();
		RPG.UI.Map.redraw();
	} else {
		RPG.UI.Map.redrawCoords(source);
		RPG.UI.Map.redrawCoords(target);
	}
}

RPG.Actions.Move.prototype._seeItems = function() {
	var coords = RPG.World.getPC().getCoords();
	var map = RPG.World.getMap();
	
	var items = map.at(coords).getItems();
	
	if (items.length > 1) {
		RPG.UI.Buffer.show("several items are lying here.");
	} else if (items.length == 1) {
		var item = items[0];
		var str = item.describeA();
		str += " is lying here.";
		RPG.UI.Buffer.show(str);
	}
}

/**
 * @class Attacking other being. Target == being.
 * @augments RPG.Engine.BaseAction
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
	var hit = this._source.getHit() + Math.round(Math.randomNormal(3));
	var dv = this._target.getDV();

	if (hit >= dv) { 
		this._hit = true;

		/* damage? */
		var damage = this._source.getDamage() + Math.round(Math.randomNormal(3)); 
		damage = Math.max(damage, 0);
		var pv = this._target.getPV();
		if (damage > pv) {
			var amount = damage - pv;
			this._damage = amount;
			this._kill = !this._target.adjustHP(-amount);
		}
	}
	
	var str = this._describe();
	RPG.UI.Buffer.show(str);
}

RPG.Actions.Attack.prototype._describe = function() {
	var you1 = (this._source == RPG.World.getPC());
	var you2 = (this._target == RPG.World.getPC());
	var str = "";
	str = (you1 ? "you" : this._source.describeThe()) + " ";
	
	if (!this._hit) {
		str += (you1 ? "miss" : "misses");
		str += " " + (you2 ? "you" : this._target.describeThe());
		str += ".";
		return str;
	}
	
	if (!this._damage) {
		if (you1) {
			str += "hit " + this._target.describeThe();
			str += ", but do not manage to harm " + this._target.describeIt();
		} else {
			str += " fails to hurt " + (you2 ? "you" : this._target.describeThe());
		}
		str += ".";
		return str;
	}
	
	str += (you1 ? "hit" : "hits");
	str += " " + (you2 ? "you" : this._target.describeThe());
	if (this._kill) {
		str += " and kill " + this._target.describeIt(); /* fixme endgame */
		str += "!";
	} else {
		if (!you2) {
			str += " and "+this._target.woundedState()+ " wound "+this._target.describeIt();
		}
		str += ".";
	}
	return str;
}

/**
 * @class Death - when something dies
 * @augments RPG.Engine.BaseAction
 */
RPG.Actions.Death = OZ.Class().extend(RPG.Engine.BaseAction);
RPG.Actions.Death.prototype.execute = function() {
	var map = RPG.World.getMap();
	map.setBeing(this._source.getCoords(), null); /* remove being */
	
	RPG.UI.Map.redrawCoords(this._source.getCoords());
	RPG.World.removeActor(this._source);
}

/**
 * @class Open a door
 * @augments RPG.Engine.BaseAction
 */
RPG.Actions.Open = OZ.Class().extend(RPG.Engine.BaseAction);
RPG.Actions.Open.prototype.execute = function() {
	var map = this._source.getMap();
	var coords = this._target;
	
	map.at(coords).getFeature().open();
	
	var str = "";
	var you = (this._source == RPG.World.getPC());
	if (you) {
		str += "you open";
	} else {
		str += this._source.describeA() + " opens";
	}
	str += " the door at " + coords.toString() + ".";
	
	RPG.UI.Buffer.show(str);
	RPG.UI.Map.redraw();
}

/**
 * @class Close a door
 * @augments RPG.Engine.BaseAction
 */
RPG.Actions.Close = OZ.Class().extend(RPG.Engine.BaseAction);
RPG.Actions.Close.prototype.execute = function() {
	var map = this._source.getMap();
	var coords = this._target;
	
	map.at(coords).getFeature().close();
	
	var str = "";
	var you = (this._source == RPG.World.getPC());
	if (you) {
		str += "you close";
	} else {
		str += this._source.describeA() + " closes";
	}
	str += " the door at " + coords.toString() + ".";
	
	RPG.UI.Buffer.show(str);
	RPG.UI.Map.redraw();
}

/**
 * @class Teleporting to a given cell. Target == coords.
 * @augments RPG.Engine.BaseAction
 */
RPG.Actions.Teleport = OZ.Class().extend(RPG.Engine.BaseAction);
RPG.Actions.Teleport.prototype.execute = function() {
	var level = this._source.getMap();
	var source = this._source.getCoords();
	var target = this._target;
	var you = (this._source == RPG.World.getPC());

	level.setBeing(source, null);
	level.setBeing(target, this._source);
	this._tookTime = true;

	var str = "";
	str = (you ? "you" : this._source.describeA());
	str += " suddenly ";
	str += (you ? "teleport" : "teleports");
	str += " away!";
	RPG.UI.Buffer.show(str);

	if (you) {
		RPG.UI.Map.redraw();
	} else {
		RPG.UI.Map.redrawCoords(source);
		RPG.UI.Map.redrawCoords(target);
	}
}

/**
 * @class Picking item(s). Target = item || item[]
 * @augments RPG.Engine.BaseAction
 */
RPG.Actions.Pick = OZ.Class().extend(RPG.Engine.BaseAction);
RPG.Actions.Pick.prototype.execute = function() {
	var items = this._target;
	if (!(items instanceof Array)) { items = [items]; }
	
	var map = this._source.getMap();
	var cell = map.at(this._source.getCoords());
	var you = (this._source == RPG.World.getPC());
	
	for (var i=0;i<items.length;i++) {
		var item = items[i];
		this._source.addItem(item);
		cell.removeItem(item);
		var str = (you ? "you" : this._source.describeA());
		str += " " + (you ? "pick" : "picks") + " up ";
		str += item.describeA();
		str += ".";
		RPG.UI.Buffer.show(str);
	}
}
