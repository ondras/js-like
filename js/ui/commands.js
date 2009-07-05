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
	this._button = OZ.DOM.elm("input", {type:"button", value:label});
	OZ.Event.add(this._button, "click", this.bind(function(e){this.exec();}));
}

RPG.UI.Command.prototype.getButton = function() {
	return this._button;
}

RPG.UI.Command.prototype.addKeyCode = function(keyCode) {
	this._keyCodes.push(keyCode);
}

RPG.UI.Command.prototype.addCharCode = function(charCode) {
	this._charCodes.push(charCode);
}

RPG.UI.Command.prototype.test = function(charCode, keyCode) {
	if (this._button && this._button.disabled) { return false; }
	return (this._charCodes.indexOf(charCode) != -1 || this._keyCodes.indexOf(keyCode) != -1);
}

RPG.UI.Command.prototype.exec = function() {
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
 * @class Pick command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Pick = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Pick.prototype.init = function() {
	this.parent("Pick (,)");
	this.addCharCode(44);
}
RPG.UI.Command.Pick.prototype.exec = function() {
	var arr = [];
	var pc = RPG.World.getPC();
	var items = pc.getMap().at(pc.getCoords()).getItems();
	for (var i=0;i<items.length;i++) {
		arr.push(items[i]);
	}
	if (arr.length) { 
		RPG.UI.action(RPG.Actions.Pick, arr);
	} else {
		RPG.UI.message("There is nothing to pick up!");
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
	RPG.UI._pending = null;
	RPG.UI.adjustButtons({commands:true, dir:true, cancel:false});
}

/**
 * @class Complex command, may depend on other commands
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Complex = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Complex.prototype.exec = function(subcommand) {
	var pending = RPG.UI._pending;
	
	/* someone else is pending, cancel */
	if (pending && pending != this) { return; } 
	
	RPG.UI._pending = null;

	/* second click on a pending command => cancel */
	if (pending && !subcommand) { 
		RPG.UI.adjustButtons({commands:true, cancel:false, dir:true});
		return; 
	}
	
	var result = this.tryExec(subcommand);
	if (result) { 
		RPG.UI.adjustButtons({commands:true, cancel:false, dir:true});
	} else {
		RPG.UI.adjustButtons({commands:false, cancel:true, dir:true});
		RPG.UI._pending = this; 
	}
}

RPG.UI.Command.Complex.prototype.tryExec = function(subcommand) {
}

/**
 * @class Open command
 * @augments RPG.UI.Command.Complex
 */
RPG.UI.Command.Open = OZ.Class().extend(RPG.UI.Command.Complex);
RPG.UI.Command.Open.prototype.init = function() {
	this.parent("Open (o)");
	this.addCharCode(111);
}
RPG.UI.Command.Open.prototype.tryExec = function(cmd) {
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
			RPG.UI.message("Open a door: select direction...");
			return false;
		}
	}
	return true;
}

/**
 * @class Close command
 * @augments RPG.UI.Command.Complex
 */
RPG.UI.Command.Close = OZ.Class().extend(RPG.UI.Command.Complex);
RPG.UI.Command.Close.prototype.init = function() {
	this.parent("Close (c)");
	this.addCharCode(99);
}
RPG.UI.Command.Close.prototype.tryExec = function(cmd) {
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
			RPG.UI.message("Close a door: select direction...");
			return false;
		}
	}
	return true;
}

/**
 * @class Kick command
 * @augments RPG.UI.Command.Complex
 */
RPG.UI.Command.Kick = OZ.Class().extend(RPG.UI.Command.Complex);
RPG.UI.Command.Kick.prototype.init = function() {
	this.parent("Kick (k)");
	this.addCharCode(107);
}
RPG.UI.Command.Kick.prototype.tryExec = function(cmd) {
	if (!cmd) {
		RPG.UI.message("Kick: select direction...");
		return false;
	} else {
		var coords = RPG.World.getPC().getCoords().clone().plus(cmd.getCoords());
		RPG.UI.action(RPG.Actions.Kick, coords);
		return true;
	}
}

/**
 * @class Chat
 * @augments RPG.UI.Command.Complex
 */
RPG.UI.Command.Chat = OZ.Class().extend(RPG.UI.Command.Complex);	
RPG.UI.Command.Chat.prototype.init = function() {
	this.parent("Chat (C)");
	this.addCharCode(67);
}
RPG.UI.Command.Chat.prototype.tryExec = function(cmd) {
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
		return true;
	} else {
		var beings = this._surroundingBeings();
		if (!beings.length) {
			RPG.UI.message(errMsg);
			return true;
		} else if (beings.length == 1) {
			RPG.UI.action(RPG.Actions.Chat, beings[0]);
			return true;
		} else {
			RPG.UI.message("Chat: select direction...");
			return false;
		}
	}
}

/**
 * @class Autowalker
 * @augments RPG.UI.Command.Complex
 */
RPG.UI.Command.Auto = OZ.Class().extend(RPG.UI.Command.Complex);	
RPG.UI.Command.Auto.prototype.init = function() {
	this.parent("Walk continuously (w)");
	this.addCharCode(119);
	this._coords = null;
	this._surround = {};
	this._steps = 0;
	this._yt = null;
}
RPG.UI.Command.Auto.prototype.tryExec = function(cmd) {
	if (cmd) {
		/* direction given */
		this._start(cmd.getCoords());
		return true;
	} else {
		RPG.UI.message("Walk continuously: select direction...");
		return false;
	}
}

RPG.UI.Command.Auto.prototype._start = function(coords) {
	var pc = RPG.World.getPC();
	var map = pc.getMap();
	var target = pc.getCoords().clone().plus(coords);

	/* cannot walk to the wall */
	if (!map.at(target).isFree()) { return; }

	/* save state of relevant siblings */
	this._coords = coords.clone();
	this._surround = {};
	var n1 = new RPG.Misc.Coords(coords.y, -coords.x);
	var n2 = new RPG.Misc.Coords(-coords.y, coords.x);
	var d1 = coords.clone().plus(n1);
	var d2 = coords.clone().plus(n2);
	
	var arr = [coords, n1, n2, d1, d2];
	for (var i=0;i<arr.length;i++) {
		var c = arr[i].clone();
		var str = c.x+","+c.y;
		this._surround[str] = map.at(c.plus(pc.getCoords())).isFree();
	}
	
	this._steps = 0;
	this._yt = pc.yourTurn;
	pc.yourTurn = this.bind(this._yourTurn);
	this._step();
}

RPG.UI.Command.Auto.prototype._yourTurn = function() {
	if (this._check()) {
		/* still going */
		this._step();
	} else {
		/* walk no more */
		RPG.World.getPC().yourTurn = this._yt;
	}
}

RPG.UI.Command.Auto.prototype._check = function() {
	var pc = RPG.World.getPC();
	var map = pc.getMap();
	var cell = map.at(pc.getCoords());

	if (this._steps == 50) { return false; } /* too much steps */
	if (cell.getFeature()) { return false; } /* we came to a feature */
	if (cell.getItems().length) { return false; } /* we stepped across some items */
	
	for (var p in this._surround) {
		var arr = p.split(",");
		var c = new RPG.Misc.Coords();
		c.x = parseInt(arr[0], 10);
		c.y = parseInt(arr[1], 10);
		if (map.at(c.plus(pc.getCoords())).isFree() != this._surround[p]) { return false; } /* surrounding cells have changed */
	}
	
	return true;
}

RPG.UI.Command.Auto.prototype._step = function() {
	this._steps++;
	var pc = RPG.World.getPC();
	
	if (this._coords.x || this._coords.y) {
		var a = new RPG.Actions.Move(pc, pc.getCoords().clone().plus(this._coords));
	} else {
		var a = new RPG.Actions.Wait(pc);
	}
	RPG.World.action(a);
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