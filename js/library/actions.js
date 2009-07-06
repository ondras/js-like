/**
 * @class Waiting, doing nothing
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Wait = OZ.Class().extend(RPG.Actions.BaseAction);

/**
 * @class Moving to a given cell. Target == coords.
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Move = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Move.prototype.execute = function() {
	var level = this._source.getMap();
	var source = this._source.getCoords();
	var target = this._target;
	var you = (this._source == RPG.World.getPC());

	level.setBeing(source, null);
	level.setBeing(target, this._source);

	if (you) {
		this._describe();
		RPG.UI.redraw();
	} else {
		RPG.UI.redrawCoords(source);
		RPG.UI.redrawCoords(target);
	}
}

/**
 * @class Attacking other being. Target == being, params == weapon
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Attack = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Attack.prototype.init = function(source, target, params) {
	this.parent(source, target, params);
	this._hit = false;
	this._damage = false;
	this._kill = false;
}
RPG.Actions.Attack.prototype.execute = function() {
	var weapon = this._params;
	
	/* hit? */
	var hit = RPG.Rules.isMeleeHit(this._source, this._target, weapon);
	if (hit) { 
		this._hit = true;

		/* damage? */
		var crit = RPG.Rules.isCritical(this._source);
		var damage = RPG.Rules.getMeleeDamage(this._source, this._target, weapon, crit);
		
		if (damage) {
			this._damage = true;
			this._kill = !this._target.adjustHP(-damage);
		}
	}
	
	var str = this._describe();
	RPG.UI.message(str);
}

RPG.Actions.Attack.prototype._describe = function() {
	var youAttacker = (this._source == RPG.World.getPC());
	var youDefender = (this._target == RPG.World.getPC());
	var attacker = (youAttacker ? "you" : this._source.describeThe());
	var defender = (youDefender ? "you" : this._target.describeThe());
	var missVerb = (youAttacker ? "miss" : "misses");
	var kickVerb = (youAttacker ? "kick" : "kicks");
	var hitVerb = (youAttacker ? "hit" : "hits");
	if (this._params instanceof RPG.Misc.Foot) { hitVerb = kickVerb; }
	
	var str = attacker.capitalize() + " ";
	str = (youAttacker ? "you" : this._source.describeThe()).capitalize() + " ";
	
	if (!this._hit) {
		str += missVerb + " " + defender + ".";
		return str;
	}
	
	if (!this._damage) {
		if (youAttacker) {
			str += hitVerb + " " + defender;
			str += ", but do not manage to harm " + this._target.describeIt();
		} else {
			str += "fails to hurt " + defender;
		}
		str += ".";
		return str;
	}
	
	str += hitVerb + " " + defender;
	if (this._kill) {
		if (youDefender) {
			str += " and kills " + defender;
		} else {
			str += " and kill "+this._target.describeIt();
		}
		str += "!";
	} else if (!youDefender) {
		str += " and "+this._target.woundedState()+ " wound "+this._target.describeIt();
		str += ".";
	} else {
		str += ".";
	}
	return str;
}

/**
 * @class Death - when something dies
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Death = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Death.prototype.execute = function() {
	var map = RPG.World.getMap();
	map.setBeing(this._source.getCoords(), null); /* remove being */
	
	RPG.UI.redrawCoords(this._source.getCoords());
	RPG.World.removeActor(this._source);
	
	if (RPG.World.getPC() == this.getSource()) {
		RPG.World.pause();
		alert("MWHAHAHA you are dead!");
	}
}

/**
 * @class Open a door
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Open = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Open.prototype.execute = function() {
	var map = this._source.getMap();
	var coords = this._target;
	var you = (this._source == RPG.World.getPC());
	
	var door = map.at(coords).getFeature();

	var locked = door.isLocked();
	if (locked) {
		if (you) {
			RPG.UI.message("The door is locked.");
		}
		return;
	}
	
	var stuck = RPG.Rules.isDoorStuck(this._source, door);
	if (stuck) {
		if (you) {
			RPG.UI.message("Ooops! The door is stuck.");
		}
		return;
	}
	
	map.at(coords).getFeature().open();
	
	var str = "";
	if (you) {
		str += "you open";
	} else {
		str += this._source.describeA() + " opens";
	}
	str = str.capitalize();
	
	str += " the door.";
	
	RPG.UI.message(str);
	RPG.UI.redraw();
}

/**
 * @class Close a door
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Close = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Close.prototype.execute = function() {
	var map = this._source.getMap();
	var coords = this._target;
	
	var cell = map.at(coords);
	if (cell.getBeing()) {
		RPG.UI.message("There is someone standing at the door.");
		this._tookTime = false;
		return;
	}
	
	var items = cell.getItems();
	if (items.length) {
		if (items.length == 1) {
			RPG.UI.message("An item blocks the door.");
		} else {
			RPG.UI.message("Several items block the door.");
		}
		this._tookTime = false;
		return;
	}

	cell.getFeature().close();
	
	var str = "";
	var you = (this._source == RPG.World.getPC());
	if (you) {
		str += "you close";
	} else {
		str += this._source.describeA() + " closes";
	}
	str = str.capitalize();
	str += " the door.";
	
	RPG.UI.message(str);
	RPG.UI.redraw();
}

/**
 * @class Teleporting to a given cell. Target == coords.
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Teleport = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Teleport.prototype.execute = function() {
	var level = this._source.getMap();
	var source = this._source.getCoords();
	var target = this._target;
	var pc = RPG.World.getPC();
	var you = (this._source == RPG.World.getPC());

	if (you) {
		RPG.UI.message("You suddenly teleport away!");
	} else {
		if (pc.canSee(source)) {
			var str = this._source.describeA().capitalize();
			str += " suddenly disappears!";
			RPG.UI.message(str);
		}
		
		if (pc.canSee(target)) {
			var str = this._source.describeA().capitalize();
			if (pc.canSee(source)) {
				str += " immediately reappears!";
			} else {
				str += " suddenly appears from nowhere!";
			}
			RPG.UI.message(str);
		}
	}
	
	var move = new RPG.Actions.Move(this._source, this._target);
	RPG.World.action(move);
}

/**
 * @class Picking item(s). Target = item || item[]
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Pick = OZ.Class().extend(RPG.Actions.BaseAction);
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
		
		/* FIXME! */
		if (item instanceof RPG.Items.Weapon) { this._source.setWeapon(item); }
		
		var str = (you ? "you" : this._source.describeA()).capitalize();
		str += " " + (you ? "pick" : "picks") + " up ";
		str += (you ? item.describeThe() : item.describeA());
		str += ".";
		RPG.UI.message(str);
	}
}

/**
 * @class Droping item(s). Target = item || item[]
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Drop = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Drop.prototype.execute = function() {
	var items = this._target;
	if (!(items instanceof Array)) { items = [items]; }
	
	var map = this._source.getMap();
	var cell = map.at(this._source.getCoords());
	var you = (this._source == RPG.World.getPC());
	
	for (var i=0;i<items.length;i++) {
		var item = items[i];
		this._source.removeItem(item);
		cell.addItem(item);
		
		/* FIXME! */
		if (this._source.getWeapon() == item) { this._source.setWeapon(item); }
		
		var str = (you ? "you" : this._source.describeA()).capitalize();
		str += " " + (you ? "drop" : "drops") + " ";
		str += (you ? item.describeThe() : item.describeA());
		str += ".";
		RPG.UI.message(str);
	}
}

/**
 * @class Kick something
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Kick = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Kick.prototype.execute = function() {
	/* FIXME only PC is allowed to kick */
	var coords = this._target;
	var map = this._source.getMap();
	var cell = map.at(coords);
	var feature = cell.getFeature();
	var being = cell.getBeing();
	var items = cell.getItems();
	
	if (this._source == being) {
		RPG.UI.message("You wouldn't do that, would you?");
		return;
	}
	
	if (cell.flags & RPG.CELL_OBSTACLE) {
		RPG.UI.message("Ouch! That hurts!");
		return;
	}
	
	if (feature && feature instanceof RPG.Features.Door && feature.isClosed()) {
		/* kick door */
		var dmg = this._source.getDamage(this._source.getFoot());
		var result = feature.damage(dmg);
		if (result) {
			RPG.UI.message("You kick the door.");
		} else {
			RPG.UI.message("You kick the door and destroy it!");
			RPG.UI.redraw();
		}
		return;
	}
	
	if (being) {
		/* kick being */
		var a = new RPG.Actions.Attack(this._source, being, this._source.getFoot());
		RPG.World.action(a);
		this._tookTime = false;
		return;
	}
	
	if (items.length) {
		/* try kicking items */
		var target = coords.clone().minus(this._source.getCoords()).plus(coords);
		if (map.isValid(target) && map.at(target).isFree()) {
			/* kick topmost item */
			var item = items[items.length-1];
			map.at(coords).removeItem(item);
			map.at(target).addItem(item);
			var str = "You kick " + item.describeThe() + ". ";
			str += "It slides away.";
			RPG.UI.message(str);
			RPG.UI.redrawCoords(coords);
			RPG.UI.redrawCoords(target);
			return;
		}
	}
	
	RPG.UI.message("You kick in empty air.");
}

/**
 * @class Initiate chat
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Chat = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Chat.prototype.execute = function() {
	/* FIXME only PC is allowed to kick */
	RPG.UI.message("You talk to "+this._target.describe()+".");
	
	var chat = this._target.getChat();
	if (chat) {
		RPG.UI.setMode(RPG.UI_WAIT_CHAT, this, chat);
	} else {
		RPG.UI.message(this._target.describeIt() + " does not reply.");
	}
}
