/**
 * @class Basic command
 */
RPG.UI.Command = OZ.Class();

RPG.UI.Command.prototype.init = function(label) {
	RPG.UI._commands.push(this);
	this._button = new RPG.UI.Button(label, this.bind(this._activate));
}

RPG.UI.Command.prototype._activate = function(button) {
	RPG.UI.command(this);
}

RPG.UI.Command.prototype.getButton = function() {
	return this._button;
}

RPG.UI.Command.prototype.exec = function() {
}

RPG.UI.Command.prototype._click = function(e) {
	RPG.UI.command(this);
}

/**
 * Get list of surrounding doors in a given opened/closed condition
 */
RPG.UI.Command.prototype._surroundingDoors = function(closed) {
	var coords = false;
	var dc = 0;
	var pc = RPG.World.getPC();
	var cell = pc.getCell();
	var map = cell.getMap();
	var center = cell.getCoords();
	
	for (var i=-1;i<=1;i++) {
		for (var j=-1;j<=1;j++) {
			if (!i && !j) { continue; }
			
			var c = center.clone().plus(new RPG.Misc.Coords(i, j));
			var f = map.at(c).getFeature();
			if (f && f instanceof RPG.Features.Door && f.isClosed() == closed) {
				dc++;
				coords = c;
			}
		}
	}
	
	if (dc == 1) {
		return coords;
	} else {
		return dc;
	}
}

/**
 * Get list of surrounding beings
 */
RPG.UI.Command.prototype._surroundingBeings = function(closed) {
	var list = [];
	var pc = RPG.World.getPC();
	var cell = pc.getCell();
	var map = cell.getMap();
	var center = cell.getCoords();
	
	for (var i=-1;i<=1;i++) {
		for (var j=-1;j<=1;j++) {
			if (!i && !j) { continue; }
			
			var c = center.clone().plus(new RPG.Misc.Coords(i, j));
			var b = map.at(c).getBeing();
			if (b) { list.push(b); }
		}
	}
	
	return list;
}

/**
 * @class Directional command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Direction = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Direction.prototype.init = function(label, coords) {
	this.parent(label);
	this._coords = coords.clone();
}
RPG.UI.Command.Direction.prototype.getCoords = function() {
	return this._coords;
}
RPG.UI.Command.Direction.prototype.exec = function() {
	/* wait */
	if (!this._coords.x && !this._coords.y) {
		RPG.UI.action(RPG.Actions.Wait);
		return;
	}
	
	var pc = RPG.World.getPC();
	var cell = pc.getCell();
	var map = cell.getMap();
	var coords = cell.getCoords().clone().plus(this._coords);
	
	/* invalid move */
	if (!map.isValid(coords)) { 
		RPG.UI.buffer.message("You cannot move there!");
		return; 
	} 
	
	/* being there? */
	var b = map.at(coords).getBeing();
	if (b) {
		var hand = pc.getMeleeSlot();
		RPG.UI.action(RPG.Actions.Attack, b, hand);
		return;
	} 
	
	/* closed door there? */
	var f = map.at(coords).getFeature();
	if (f && f instanceof RPG.Features.Door && f.isClosed()) {
		RPG.UI.action(RPG.Actions.Open, coords);
		return;
	}
	
	/* can we move there? */
	if (map.at(coords).isFree()) {
		RPG.UI.action(RPG.Actions.Move, coords);
		return;
	}	
}

/**
 * @class Keypad
 */
RPG.UI.Command.Table = OZ.Class();

RPG.UI.Command.Table.prototype.init = function(container) {
	var table = OZ.DOM.elm("table");
	var tb = OZ.DOM.elm("tbody");
	table.appendChild(tb);
	container.appendChild(table);

	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);
	
	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◤", new RPG.Misc.Coords(-1, -1));
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(55);
	c.getButton().addKeyCode(36);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("▲", new RPG.Misc.Coords(0, -1));
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(56);
	c.getButton().addKeyCode(38);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◥", new RPG.Misc.Coords(1, -1));
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(57);
	c.getButton().addKeyCode(33);

	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);
	
	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◀", new RPG.Misc.Coords(-1, 0));
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(52);
	c.getButton().addKeyCode(37);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("⋯", new RPG.Misc.Coords(0, 0));
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(46);
	c.getButton().addCharCode(53);
	c.getButton().addKeyCode(12);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("▶", new RPG.Misc.Coords(1, 0));
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(54);
	c.getButton().addKeyCode(39);

	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◣", new RPG.Misc.Coords(-1, 1));
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(49);
	c.getButton().addKeyCode(35);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("▼", new RPG.Misc.Coords(0, 1));
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(50);
	c.getButton().addKeyCode(40);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◢", new RPG.Misc.Coords(1, 1));
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(51);
	c.getButton().addKeyCode(34);
}

/**
 * @class Cancel command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Cancel = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Cancel.prototype.init = function() {
	this.parent("Cancel");
	this._button.setChar("z");
}
RPG.UI.Command.Cancel.prototype.exec = function() {
	RPG.UI.setMode(RPG.UI_NORMAL);
}

/**
 * @class Open command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Open = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Open.prototype.init = function() {
	this.parent("Open");
	this._button.setChar("o");
}
RPG.UI.Command.Open.prototype.exec = function(cmd) {
	var pc = RPG.World.getPC();
	var map = pc.getCell().getMap();

	if (cmd) {
		/* direction given */
		var coords = pc.getCell().getCoords().clone().plus(cmd.getCoords());
		var f = map.at(coords).getFeature();
		if (f && f instanceof RPG.Features.Door && f.isClosed()) {
			/* correct direction */
			RPG.UI.action(RPG.Actions.Open, coords);
		} else {
			/* incorrect direction */
			RPG.UI.buffer.message("there is no door at that location.");
		}
		RPG.UI.setMode(RPG.UI_NORMAL);
	} else {
		/* no direction, check surroundings */
		var doors = this._surroundingDoors(true);
		if (doors instanceof RPG.Misc.Coords) {
			/* exactly one door found */
			RPG.UI.action(RPG.Actions.Open, doors);
		} else if (doors == 0) {
			RPG.UI.buffer.message("There are no closed doors nearby.");
		} else {
			/* too many doors */
			RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Open a door");
		}
	}
}

/**
 * @class Close command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Close = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Close.prototype.init = function() {
	this.parent("Close");
	this._button.setChar("c");
}
RPG.UI.Command.Close.prototype.exec = function(cmd) {
	var pc = RPG.World.getPC();
	var map = pc.getCell().getMap();

	if (cmd) {
		/* direction given */
		var coords = pc.getCell().getCoords().clone().plus(cmd.getCoords());
		var f = map.at(coords).getFeature();
		if (f && f instanceof RPG.Features.Door && !f.isClosed()) {
			/* correct direction */
			RPG.UI.action(RPG.Actions.Close, coords);
		} else {
			/* incorrect direction */
			RPG.UI.buffer.message("there is no door at that location.");
		}
		RPG.UI.setMode(RPG.UI_NORMAL);
	} else {
		/* no direction, check surroundings */
		var doors = this._surroundingDoors(false);
		if (doors instanceof RPG.Misc.Coords) {
			/* exactly one door found */
			RPG.UI.action(RPG.Actions.Close, doors);
		} else if (doors == 0) {
			RPG.UI.buffer.message("There are no opened doors nearby.");
		} else {
			/* too many doors */
			RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Close a door");
		}
	}
}

/**
 * @class Kick command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Kick = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Kick.prototype.init = function() {
	this.parent("Kick");
	this._button.setChar("k");
}
RPG.UI.Command.Kick.prototype.exec = function(cmd) {
	if (!cmd) {
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Kick");
	} else {
		var coords = RPG.World.getPC().getCell().getCoords().clone().plus(cmd.getCoords());
		RPG.UI.action(RPG.Actions.Kick, coords);
		RPG.UI.setMode(RPG.UI_NORMAL);
	}
}

/**
 * @class Chat
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Chat = OZ.Class().extend(RPG.UI.Command);	
RPG.UI.Command.Chat.prototype.init = function() {
	this.parent("Chat");
	this._button.setChar("C");
}
RPG.UI.Command.Chat.prototype.exec = function(cmd) {
	var errMsg = "There is noone to chat with.";
	var pc = RPG.World.getPC();
	var cell = pc.getCell();
	var map = cell.getMap();

	if (cmd) {
		/* direction given */
		var coords = cell.getCoords().clone().plus(cmd.getCoords());
		var being = map.at(coords).getBeing();
		if (!being) {
			RPG.UI.buffer.message(errMsg);
		} else {
			RPG.UI.action(RPG.Actions.Chat, being);
		}
		RPG.UI.setMode(RPG.UI_NORMAL);
	} else {
		var beings = this._surroundingBeings();
		if (!beings.length) {
			RPG.UI.buffer.message(errMsg);
		} else if (beings.length == 1) {
			RPG.UI.action(RPG.Actions.Chat, beings[0]);
		} else {
			RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Chat");
		}
	}
}

/**
 * @class Search surroundings
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Search = OZ.Class().extend(RPG.UI.Command);	
RPG.UI.Command.Search.prototype.init = function() {
	this.parent("Search");
	this._button.setChar("s");
}
RPG.UI.Command.Search.prototype.exec = function() {
	RPG.UI.action(RPG.Actions.Search, RPG.World.getPC());
}

/**
 * @class Pick command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Pick = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Pick.prototype.init = function() {
	this.parent("Pick");
	this._button.setChar(",");
}
RPG.UI.Command.Pick.prototype.exec = function() {
	var pc = RPG.World.getPC();
	var items = pc.getCell().getItems();
	
	if (!items.length) {
		RPG.UI.buffer.message("There is nothing to pick up!");
		return;
	}
	
	if (items.length == 1) {
		var item = items[0];
		var amount = item.getAmount();
		RPG.UI.action(RPG.Actions.Pick, [[item, amount]]);
		return;
	}
	
	RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
	new RPG.UI.Itemlist(items, "Select items to be picked up", -1, this.bind(this._done));
}
RPG.UI.Command.Pick.prototype._done = function(items) {
	RPG.UI.setMode(RPG.UI_NORMAL);
	RPG.UI.action(RPG.Actions.Pick, items);
}

/**
 * @class Drop command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Drop = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Drop.prototype.init = function() {
	this.parent("Drop");
	this._button.setChar("d");
}
RPG.UI.Command.Drop.prototype.exec = function() {
	var pc = RPG.World.getPC();
	var items = pc.getItems();
	if (items.length) {
		RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
		new RPG.UI.Itemlist(items, "Select items to be dropped on the ground", -1, this.bind(this._done));
	} else {
		RPG.UI.buffer.message("You don't own anything!");
	}
}
RPG.UI.Command.Drop.prototype._done = function(items) {
	RPG.UI.setMode(RPG.UI_NORMAL);
	RPG.UI.action(RPG.Actions.Drop, items);
}

/**
 * @class Inventory command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Inventory = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Inventory.prototype.init = function() {
	this.parent("Inventory");
	this._button.setChar("i");
}
RPG.UI.Command.Inventory.prototype.exec = function() {
	RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
	new RPG.UI.Slots(RPG.World.getPC(), this.bind(this._done));
}

RPG.UI.Command.Inventory.prototype._done = function(changed) {
	RPG.UI.setMode(RPG.UI_NORMAL);
	if (changed) {
		RPG.UI.action(RPG.Actions.Equip);
	}
}

/**
 * @class Autowalker
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Autowalk = OZ.Class().extend(RPG.UI.Command);	
RPG.UI.Command.Autowalk.prototype.init = function() {
	this.parent("Walk continuously");
	this._button.setChar("w");
	this._coords = null;
	this._left = false;
	this._right = false;
	this._steps = 0;
	this._yt = null;
}
RPG.UI.Command.Autowalk.prototype.exec = function(cmd) {
	if (cmd) {
		/* direction given */
		RPG.UI.setMode(RPG.UI_NORMAL);
		this._start(cmd.getCoords());
	} else {
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Walk continuously");
	}
}

RPG.UI.Command.Autowalk.prototype._start = function(coords) {
	var pc = RPG.World.getPC();
	var cell = pc.getCell();
	var map = cell.getMap();
	var target = cell.getCoords().clone().plus(coords);

	/* cannot walk to the wall */
	if (coords.x || coords.y) {
		if (!map.at(target).isFree() ) { return; }
	}

	this._saveState(coords);
	
	this._steps = 0;
	this._yt = pc.yourTurn;
	pc.yourTurn = this.bind(this._yourTurn);
	this._step();
}

/**
 * Save state of current direction + left/right neighbors 
 */
RPG.UI.Command.Autowalk.prototype._saveState = function(coords) {
	this._coords = coords.clone();
	var pc = RPG.World.getPC();
	var map = RPG.World.getMap();
	var cell = pc.getCell();
	var leftC = new RPG.Misc.Coords(-coords.y, coords.x);
	var rightC = new RPG.Misc.Coords(coords.y, -coords.x);
	this._left = map.at(leftC.plus(cell.getCoords())).isFree();
	this._right = map.at(rightC.plus(cell.getCoords())).isFree();
}

RPG.UI.Command.Autowalk.prototype._yourTurn = function() {
	if (this._check()) {
		/* still going */
		this._step();
	} else {
		/* walk no more */
		RPG.World.getPC().yourTurn = this._yt;
	}
}

/**
 * Most complicated part. Check whether we can continue autowalking.
 */
RPG.UI.Command.Autowalk.prototype._check = function() {
	var pc = RPG.World.getPC();
	var cell = pc.getCell();
	var map = cell.getMap();
	var coords = cell.getCoords();

	if (this._steps == 50) { return false; } /* too much steps */
	if (cell.getItems().length) { return false; } /* we stepped across some items */
	
	if (!this._coords.x && !this._coords.y) { return true; } /* standing on a spot is okay now */

	/* now check neighbor status */
	var n1 = new RPG.Misc.Coords(-this._coords.y, this._coords.x);
	var n2 = new RPG.Misc.Coords(this._coords.y, -this._coords.x);
	var aheadC = this._coords.clone().plus(coords);
	var leftC = n1.clone().plus(coords);
	var rightC = n2.clone().plus(coords);
	var ahead = !(map.at(aheadC).flags & RPG.CELL_OBSTACLE);
	var left = !(map.at(leftC).flags & RPG.CELL_OBSTACLE);
	var right = !(map.at(rightC).flags & RPG.CELL_OBSTACLE);
	
	/* leaving opened area/crossroads */
	if (this._left && !left) { this._left = left; }
	if (this._right && !right) { this._right = right; }
	
	if (ahead) {
		/* we can - in theory - continue; just check if we are not standing on a crossroads */
		if ((!this._left && left) || (!this._right && right)) { return false; }
	} else {
		/* try to change direction, because it is not possible to continue */
		var freecount = 0;
		for (var i=-1;i<=1;i++) {
			for (var j=-1;j<=1;j++) {
				if (!i && !j) { continue; }
				var c = map.at(new RPG.Misc.Coords(i, j).plus(coords));
				if (!(c.flags & RPG.CELL_OBSTACLE)) { freecount++; }
			}
		}
		if (freecount > 2) { return false; } /* too many options to go */
		
		if (left && !right) {
			/* turn left */
			this._saveState(n1);
		} else if (right && !left) {
			/* turn right */
			this._saveState(n2);
		} else {
			return false; /* the only way from here is diagonal, stop */
		}	
	}
	
	var cell = map.at(this._coords.clone().plus(coords));
	if (cell.getBeing()) { return false; } /* standing against a being */
	if (cell.getFeature() && cell.getFeature().knowsAbout(pc)) { return false; } /* standing against a feature */

	return true;
}

RPG.UI.Command.Autowalk.prototype._step = function() {
	this._steps++;
	var pc = RPG.World.getPC();
	
	if (this._coords.x || this._coords.y) {
		RPG.UI.action(RPG.Actions.Move, pc.getCell().getCoords().clone().plus(this._coords));
	} else {
		RPG.UI.action(RPG.Actions.Wait);
	}
}

/**
 * @class Message buffer backlog
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Backlog = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Backlog.prototype.init = function() {
	this.parent("Message backlog");
	this._button.setCtrl();
	this._button.setChar("m");
	this._visible = false;
}

RPG.UI.Command.Backlog.prototype.exec = function() {
	if (this._visible) {
		RPG.UI.buffer.hideBacklog();
		this._visible = false;
	} else {
		RPG.UI.buffer.showBacklog();
		this._visible = true;
	}
}

/**
 * @class Ascend
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Ascend = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Ascend.prototype.init = function() {
	this.parent("Ascend");
	this._button.setChar("<");
}

RPG.UI.Command.Ascend.prototype.exec = function() {
	var pc = RPG.World.getPC();
	var f = pc.getCell().getFeature();
	if (f && f instanceof RPG.Features.Staircase.Up) {
		RPG.UI.action(RPG.Actions.Ascend, f);
	} else {
		RPG.UI.buffer.message("You don't see any stairs leading upwards.");
	}
}


/**
 * @class Descend
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Descend = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Descend.prototype.init = function() {
	this.parent("Descend");
	this._button.setChar(">");
}

RPG.UI.Command.Descend.prototype.exec = function() {
	var pc = RPG.World.getPC();
	var f = pc.getCell().getFeature();
	if (f && f instanceof RPG.Features.Staircase.Down) {
		RPG.UI.action(RPG.Actions.Descend, f);
	} else {
		RPG.UI.buffer.message("You don't see any stairs leading downwards.");
	}
}

/**
 * @class Activate trap
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Trap = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Trap.prototype.init = function() {
	this.parent("Activate trap");
	this._button.setCtrl();
	this._button.setChar("t");
}

RPG.UI.Command.Trap.prototype.exec = function() {
	var pc = RPG.World.getPC();
	var f = pc.getCell().getFeature();
	if (f && f instanceof RPG.Features.Trap && f.knowsAbout(pc)) {
		f.setOff();
	} else {
		RPG.UI.buffer.message("There is no trap you are aware of.");
	}
}

/**
 * @class Show current hit/dmg
 * @augments RPG.UI.Command
 */
RPG.UI.Command.WeaponStats = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.WeaponStats.prototype.init = function() {
	this.parent("Weapon statistics");
	this._button.setChar("W");
}

RPG.UI.Command.WeaponStats.prototype.exec = function() {
	var pc = RPG.World.getPC();
	var hand = pc.getMeleeSlot();
	var hit = hand.getHit();
	var dmg = hand.getDamage();
	alert("Current weapon hit/damage: "+hit.toString()+"/"+dmg.toString());
}

/**
 * @class Show kick hit/dmg
 * @augments RPG.UI.Command
 */
RPG.UI.Command.KickStats = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.KickStats.prototype.init = function() {
	this.parent("Kick statistics");
	this._button.setChar("K");
}

RPG.UI.Command.KickStats.prototype.exec = function() {
	var pc = RPG.World.getPC();
	var feet = pc.getFeetSlot();
	var hit = feet.getHit();
	var dmg = feet.getDamage();
	alert("Current kick hit/damage: "+hit.toString()+"/"+dmg.toString());
}

/**
 * @class Look around
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Look = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Look.prototype.init = function() {
	this.parent("Look");
	this._button.setChar("l");
	this._coords = null;
}

RPG.UI.Command.Look.prototype.exec = function(cmd) {
	if (cmd) {
		var test = this._coords.clone().plus(cmd.getCoords());
		var map = RPG.World.getMap();
		if (!map.isValid(test)) { return; }
		this._coords = test;
		RPG.UI.map.setFocus(this._coords);
		RPG.UI.action(RPG.Actions.Look, this._coords);
	} else {
		this._coords = RPG.World.getPC().getCell().getCoords().clone();
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Look around");
	}
}

/**
 * Abstract consumption command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Consume = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Consume.prototype.exec = function(itemCtor, listTitle, errorString, actionCtor) {
	var pc = RPG.World.getPC();
	var cell = pc.getCell();
	var items = cell.getItems();
	this._container = null;
	this._actionCtor = actionCtor;
	
	/* from ground? */
	var all = this._filter(items, itemCtor);
	var title = listTitle;
	
	if (all.length) {
		this._container = cell;
		title += " from the ground";
	} else {
		all = this._filter(pc.getItems(), itemCtor);
		if (!all.length) { 
			RPG.UI.buffer.message(errorString);
			return;
		}
		this._container = pc;
	}
	
	RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
	new RPG.UI.Itemlist(all, title, 1, this.bind(this._done));
}
RPG.UI.Command.Consume.prototype._filter = function(items, itemCtor) {
	var arr = [];
	for (var i=0;i<items.length;i++) {
		var item = items[i];
		if (item instanceof itemCtor) { arr.push(item); }
	}
	return arr;
}
RPG.UI.Command.Consume.prototype._done = function(items) {
	RPG.UI.setMode(RPG.UI_NORMAL);
	if (!items.length) { return; }
	
	var item = items[0][0];
	RPG.UI.action(this._actionCtor, item, this._container);
}

/**
 * @class Eating
 * @augments RPG.UI.Command.Consume
 */
RPG.UI.Command.Eat = OZ.Class().extend(RPG.UI.Command.Consume);

RPG.UI.Command.Eat.prototype.init = function() {
	this.parent("Eat");
	this._button.setChar("e");
}

RPG.UI.Command.Eat.prototype.exec = function() {
	this.parent(RPG.Items.Consumable, 
				"Select item to be eaten", 
				"You don't own anything edible!",
				RPG.Actions.Eat);
}

/**
 * @class Drinking
 * @augments RPG.UI.Command.Consume
 */
RPG.UI.Command.Drink = OZ.Class().extend(RPG.UI.Command.Consume);

RPG.UI.Command.Drink.prototype.init = function() {
	this.parent("Drink");
	this._button.setChar("D");
}

RPG.UI.Command.Drink.prototype.exec = function() {
	this.parent(RPG.Items.Potion, 
				"Select a potion", 
				"You don't own any potions!",
				RPG.Actions.Drink);
}

/**
 * @class Switch position with a being
 * @augments RPG.UI.Command
 */
RPG.UI.Command.SwitchPosition = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.SwitchPosition.prototype.init = function() {
	this.parent("Switch position");
	this._button.setCtrl();
	this._button.setChar("s");
}

RPG.UI.Command.SwitchPosition.prototype.exec = function(cmd) {
	if (!cmd) {
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Switch position");
	} else {
		var coords = RPG.World.getPC().getCell().getCoords().clone().plus(cmd.getCoords());
		RPG.UI.action(RPG.Actions.SwitchPosition, coords);
		RPG.UI.setMode(RPG.UI_NORMAL);
	}
}

/**
 * @class Cast a spell
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Cast = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Cast.prototype.init = function() {
	this.parent("Cast a spell");
	this._button.setChar("Z");
	
	this._spell = null;
}

RPG.UI.Command.Cast.prototype.exec = function(cmd) {
	if (!cmd) {
		/* list of spells */
		this._spell = null;
		
		/* FIXME magic wand in hand? */
		
		var spells = RPG.World.getPC().spellMemory().getSpells();
		if (spells.length) {
			RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
			new RPG.UI.Itemlist(spells, "Select a spell to cast", 1, this.bind(this._done));
		} else {
			RPG.UI.buffer.message("You don't know any spells.");
		}
		
	} else {
		/* spell direction */
		var coords = RPG.World.getPC().getCell().getCoords().clone().plus(cmd.getCoords());
		RPG.UI.action(RPG.Actions.Cast, coords, this._spell);
		RPG.UI.setMode(RPG.UI_NORMAL);
	}
}

/**
 * Spell selected
 */
RPG.UI.Command.Cast.prototype._done = function(spells) {
	if (!spells.length) {
		RPG.UI.setMode(RPG.UI_NORMAL);
		return;
	}
	
	this._spell = spells[0][0];
	RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Cast a spell");
}

