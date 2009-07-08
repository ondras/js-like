/**
 * @class Basic command
 */
RPG.UI.Command = OZ.Class();

/**
 * Build directional navigation
 */
RPG.UI.Command.prototype.init = function(label) {
	RPG.UI._commands.push(this);
	this._charCodes = [];
	this._keyCodes = [];
	this._ctrlKey = false;
	this._altKey = false;
	this._button = OZ.DOM.elm("input", {type:"button", value:label});
	OZ.Event.add(this._button, "click", this.bind(this._click));
}


RPG.UI.Command.prototype.getButton = function() {
	return this._button;
}

RPG.UI.Command.prototype.setCtrl = function() {
	this._ctrlKey = true;
}

RPG.UI.Command.prototype.setAlt = function() {
	this._altKey = true;
}

RPG.UI.Command.prototype.addKeyCode = function(keyCode) {
	this._keyCodes.push(keyCode);
}

RPG.UI.Command.prototype.addCharCode = function(charCode) {
	this._charCodes.push(charCode);
}

RPG.UI.Command.prototype.test = function(event) {
	if (this._button.disabled) { return false; }
	if (event.ctrlKey != this._ctrlKey) { return false; }
	if (event.altKey != this._altKey) { return false; }
	
	return (this._charCodes.indexOf(event.charCode) != -1 || this._keyCodes.indexOf(event.keyCode) != -1);
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
	var map = pc.getMap();
	
	for (var i=-1;i<=1;i++) {
		for (var j=-1;j<=1;j++) {
			if (!i && !j) { continue; }
			
			var c = pc.getCoords().clone().plus(new RPG.Misc.Coords(i, j));
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
	var map = pc.getMap();
	
	for (var i=-1;i<=1;i++) {
		for (var j=-1;j<=1;j++) {
			if (!i && !j) { continue; }
			
			var c = pc.getCoords().clone().plus(new RPG.Misc.Coords(i, j));
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
	if (RPG.UI._pending) {
		RPG.UI._pending.exec(this);
		return;
	}
	
	/* wait */
	if (!this._coords.x && !this._coords.y) {
		RPG.UI.action(RPG.Actions.Wait);
		return;
	}
	
	var pc = RPG.World.getPC();
	var map = RPG.World.getMap();
	var coords = pc.getCoords().clone().plus(this._coords);
	
	/* invalid move */
	if (!map.isValid(coords)) { 
		RPG.UI.message("You cannot move there!");
		return; 
	} 
	
	/* being there? */
	var b = map.at(coords).getBeing();
	if (b) {
		RPG.UI.action(RPG.Actions.Attack, b, pc.getWeapon());
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
 * @class Cancel command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Cancel = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Cancel.prototype.init = function() {
	this.parent("Cancel (z)");
	this.addCharCode(122);
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
	this.parent("Open (o)");
	this.addCharCode(111);
}
RPG.UI.Command.Open.prototype.exec = function(cmd) {
	var pc = RPG.World.getPC();

	if (cmd) {
		/* direction given */
		var coords = pc.getCoords().clone().plus(cmd.getCoords());
		var f = map.at(coords).getFeature();
		if (f && f instanceof RPG.Features.Door && f.isClosed()) {
			/* correct direction */
			RPG.UI.action(RPG.Actions.Open, coords);
		} else {
			/* incorrect direction */
			RPG.UI.message("there is no door at that location.");
		}
	} else {
		/* no direction, check surroundings */
		var doors = this._surroundingDoors(true);
		if (doors instanceof RPG.Misc.Coords) {
			/* exactly one door found */
			RPG.UI.action(RPG.Actions.Open, doors);
		} else if (doors == 0) {
			RPG.UI.message("There are no closed doors nearby.");
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
	this.parent("Close (c)");
	this.addCharCode(99);
}
RPG.UI.Command.Close.prototype.exec = function(cmd) {
	var pc = RPG.World.getPC();

	if (cmd) {
		/* direction given */
		var coords = pc.getCoords().clone().plus(cmd.getCoords());
		var f = map.at(coords).getFeature();
		if (f && f instanceof RPG.Features.Door && !f.isClosed()) {
			/* correct direction */
			RPG.UI.action(RPG.Actions.Close, coords);
		} else {
			/* incorrect direction */
			RPG.UI.message("there is no door at that location.");
		}
	} else {
		/* no direction, check surroundings */
		var doors = this._surroundingDoors(false);
		if (doors instanceof RPG.Misc.Coords) {
			/* exactly one door found */
			RPG.UI.action(RPG.Actions.Close, doors);
		} else if (doors == 0) {
			RPG.UI.message("There are no opened doors nearby.");
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
	this.parent("Kick (k)");
	this.addCharCode(107);
}
RPG.UI.Command.Kick.prototype.exec = function(cmd) {
	if (!cmd) {
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Kick");
	} else {
		var coords = RPG.World.getPC().getCoords().clone().plus(cmd.getCoords());
		RPG.UI.action(RPG.Actions.Kick, coords);
	}
}

/**
 * @class Chat
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Chat = OZ.Class().extend(RPG.UI.Command);	
RPG.UI.Command.Chat.prototype.init = function() {
	this.parent("Chat (C)");
	this.addCharCode(67);
}
RPG.UI.Command.Chat.prototype.exec = function(cmd) {
	var errMsg = "There is noone to chat with.";
	var pc = RPG.World.getPC();

	if (cmd) {
		/* direction given */
		var coords = pc.getCoords().clone().plus(cmd.getCoords());
		var being = pc.getMap().at(coords).getBeing();
		if (!being) {
			RPG.UI.message(errMsg);
		} else {
			RPG.UI.action(RPG.Actions.Chat, being);
		}
	} else {
		var beings = this._surroundingBeings();
		if (!beings.length) {
			RPG.UI.message(errMsg);
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
	this.parent("Search (s)");
	this.addCharCode(115);
}
RPG.UI.Command.Search.prototype.exec = function(cmd) {
	RPG.UI.action(RPG.Actions.Search, RPG.World.getPC());
}

/**
 * @class Pick command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Pick = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Pick.prototype.init = function() {
	this.parent("Pick (,)");
	this.addCharCode(44);
}
RPG.UI.Command.Pick.prototype.exec = function(selectedItems) {
	var arr = [];
	var pc = RPG.World.getPC();
	
	if (selectedItems) {
		if (selectedItems) {
			RPG.UI.action(RPG.Actions.Pick, selectedItems);
		}
	} else {
		var items = pc.getMap().at(pc.getCoords()).getItems();
		
		if (!items.length) {
			RPG.UI.message("There is nothing to pick up!");
			return;
		}
		
		if (items.length == 1) {
			RPG.UI.action(RPG.Actions.Pick, items[0]);
			return; 
		}
		
		var obj = {
			items: items,
			label: "Select items to be picked up",
			pick: -1
		}
		RPG.UI.setMode(RPG.UI_WAIT_ITEMS, this, obj);
	}
}

/**
 * @class Drop command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Drop = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Drop.prototype.init = function() {
	this.parent("Drop (d)");
	this.addCharCode(100);
}
RPG.UI.Command.Drop.prototype.exec = function(selectedItems) {
	var arr = [];
	var pc = RPG.World.getPC();
	
	if (selectedItems) {
		if (selectedItems.length) {
			RPG.UI.action(RPG.Actions.Drop, selectedItems);
		}
	} else {
		var items = pc.getItems();
		if (items.length) {
			var obj = {
				items: items,
				label: "Select items to be dropped on the ground",
				pick: -1
			}
			RPG.UI.setMode(RPG.UI_WAIT_ITEMS, this, obj);
		} else {
			RPG.UI.message("You don't own anything!");
		}
	}
}

/**
 * @class Inventory command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Inventory = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Inventory.prototype.init = function() {
	this.parent("Inventory (i)");
	this.addCharCode(105);
	this._state = false;
}
RPG.UI.Command.Inventory.prototype.exec = function() {
	var arr = [];
	var pc = RPG.World.getPC();
	
	if (this._state) {
		this._state = false;
	} else {
		var items = pc.getItems();
		if (items.length) {
			this._state = true;
			var obj = {
				items: items,
				label: "Your inventory",
				pick: 0
			}
			RPG.UI.setMode(RPG.UI_WAIT_ITEMS, this, obj);
		} else {
			RPG.UI.message("You don't own anything!");
		}
	}
}

/**
 * @class Autowalker
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Autowalk = OZ.Class().extend(RPG.UI.Command);	
RPG.UI.Command.Autowalk.prototype.init = function() {
	this.parent("Walk continuously (w)");
	this.addCharCode(119);
	this._coords = null;
	this._left = false;
	this._right = false;
	this._steps = 0;
	this._yt = null;
}
RPG.UI.Command.Autowalk.prototype.exec = function(cmd) {
	if (cmd) {
		/* direction given */
		this._start(cmd.getCoords());
	} else {
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Walk continuously");
	}
}

RPG.UI.Command.Autowalk.prototype._start = function(coords) {
	var pc = RPG.World.getPC();
	var map = pc.getMap();
	var target = pc.getCoords().clone().plus(coords);

	/* cannot walk to the wall */
	if (!map.at(target).isFree()) { return; }

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
	var map = pc.getMap();
	var leftC = new RPG.Misc.Coords(-coords.y, coords.x);
	var rightC = new RPG.Misc.Coords(coords.y, -coords.x);
	this._left = map.at(leftC.plus(pc.getCoords())).isFree();
	this._right = map.at(rightC.plus(pc.getCoords())).isFree();
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
	var map = pc.getMap();
	var coords = pc.getCoords();
	var cell = map.at(coords);

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
	if (cell.getFeature()) { return false; } /* standing against a feature */

	return true;
}

RPG.UI.Command.Autowalk.prototype._step = function() {
	this._steps++;
	var pc = RPG.World.getPC();
	
	if (this._coords.x || this._coords.y) {
		RPG.UI.action(RPG.Actions.Move, pc.getCoords().clone().plus(this._coords));
	} else {
		RPG.UI.action(RPG.Actions.Wait);
	}
}

/**
 * @class Message buffer backlog
 */
RPG.UI.Command.Backlog = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Backlog.prototype.init = function() {
	this.parent("Message backlog (^m)");
	this.addCharCode(109);
	this.setCtrl();
	this._visible = false;
}

RPG.UI.Command.Backlog.prototype.exec = function() {
	if (this._visible) {
		RPG.UI.hideBacklog();
		this._visible = false;
	} else {
		RPG.UI.showBacklog();
		this._visible = true;
	}
}

/**
 * @class Keypad
 */
RPG.UI.Command.Table = OZ.Class();

RPG.UI.Command.Table.prototype.init = function() {
	var table = OZ.DOM.elm("table", {"class":"keypad"});
	var tb = OZ.DOM.elm("tbody");
	table.appendChild(tb);

	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);
	
	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◤", new RPG.Misc.Coords(-1, -1));
	OZ.DOM.append([tr, td], [td, c.getButton()]);
	c.addCharCode(55);
	c.addKeyCode(36);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("▲", new RPG.Misc.Coords(0, -1));
	OZ.DOM.append([tr, td], [td, c.getButton()]);
	c.addCharCode(56);
	c.addKeyCode(38);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◥", new RPG.Misc.Coords(1, -1));
	OZ.DOM.append([tr, td], [td, c.getButton()]);
	c.addCharCode(57);
	c.addKeyCode(33);

	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);
	
	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◀", new RPG.Misc.Coords(-1, 0));
	OZ.DOM.append([tr, td], [td, c.getButton()]);
	c.addCharCode(52);
	c.addKeyCode(37);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("⋯", new RPG.Misc.Coords(0, 0));
	OZ.DOM.append([tr, td], [td, c.getButton()]);
	c.addCharCode(46);
	c.addCharCode(53);
	c.addKeyCode(12);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("▶", new RPG.Misc.Coords(1, 0));
	OZ.DOM.append([tr, td], [td, c.getButton()]);
	c.addCharCode(54);
	c.addKeyCode(39);

	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◣", new RPG.Misc.Coords(-1, 1));
	OZ.DOM.append([tr, td], [td, c.getButton()]);
	c.addCharCode(49);
	c.addKeyCode(35);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("▼", new RPG.Misc.Coords(0, 1));
	OZ.DOM.append([tr, td], [td, c.getButton()]);
	c.addCharCode(50);
	c.addKeyCode(40);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◢", new RPG.Misc.Coords(1, 1));
	OZ.DOM.append([tr, td], [td, c.getButton()]);
	c.addCharCode(51);
	c.addKeyCode(34);

	this._table = table;
}

RPG.UI.Command.Table.prototype.getContainer = function() {
	return this._table;
}
