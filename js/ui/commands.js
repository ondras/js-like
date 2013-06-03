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

RPG.UI.Command.prototype.notify = function() {
}

RPG.UI.Command.prototype.cancel = function() {
}

RPG.UI.Command.prototype.exec = function() {
	RPG.UI.alert("Not implemented .)", "Debug");
}

RPG.UI.Command.prototype._click = function(e) {
	RPG.UI.command(this);
}

/**
 * Get list of surrounding doors in a given opened/closed condition
 */
RPG.UI.Command.prototype._surroundingDoors = function(closed) {
	var doors = false;
	var dc = 0;
	var center = RPG.Game.pc.getCoords();
	var map = RPG.Game.pc.getMap();
	
	var coords = map.getCoordsInCircle(center, 1, false);
	for (var i=0;i<coords.length;i++) {
		var f = map.getFeature(coords[i]);
		if (f && f instanceof RPG.Features.Door && f.isClosed() == closed) {
			dc++;
			doors = f;
		}
	}
	
	if (dc == 1) {
		return doors;
	} else {
		return dc;
	}
}

/**
 * Get list of surrounding beings
 */
RPG.UI.Command.prototype._surroundingBeings = function(closed) {
	var list = [];

	var map = RPG.Game.pc.getMap();
	var center = RPG.Game.pc.getCoords();
	
	var coords = map.getCoordsInCircle(center, 1, false);

	for (var i=0;i<coords.length;i++) {
		var b = map.getBeing(coords[i]);
		if (b) { list.push(b); }
	}
	
	return list;
}

/**
 * @class Directional command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Direction = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Direction.prototype.init = function(label, dir) {
	this.parent(label);
	this._dir = dir;
}
RPG.UI.Command.Direction.prototype.getDir = function() {
	return this._dir;
}
RPG.UI.Command.Direction.prototype.exec = function() {
	/* wait */
	if (this._dir == RPG.CENTER) {
		var result = RPG.Game.pc.wait();
		RPG.Game.getEngine().actionResult(result);
		return;
	}
	
	var pc = RPG.Game.pc;
	var coords = pc.getCoords().neighbor(this._dir);
	var map = pc.getMap();
	
	/* invalid move */
	if (!map.getCell(coords)) { 
		RPG.UI.buffer.message("You cannot move there!");
		return; 
	} 
	
	/* being there? */
	var b = map.getBeing(coords);
	if (b) {
		var yes = function() { 
			var hand = pc.getSlot(RPG.SLOT_WEAPON);
			return pc.attackMelee(b, hand);
		}
		var result = b.confirmAttack(yes); /* async */
		RPG.Game.getEngine().actionResult(result);
		return;
	} 
	
	/* closed door there? */
	var f = map.getFeature(coords);
	if (f && f instanceof RPG.Features.Door && f.isClosed()) {
		var result = pc.open(f);
		RPG.Game.getEngine().actionResult(result);
		return;
	}
	
	/* can we move there? */
	if (!map.blocks(RPG.BLOCKS_MOVEMENT, coords)) {
		var result = pc.move(coords);
		RPG.Game.getEngine().actionResult(result);
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
	var c = new RPG.UI.Command.Direction("◤", RPG.NW);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(55);
	c.getButton().addKeyCode(36);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("▲", RPG.N);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(56);
	c.getButton().addKeyCode(38);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◥", RPG.NE);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(57);
	c.getButton().addKeyCode(33);

	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);
	
	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◀", RPG.W);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(52);
	c.getButton().addKeyCode(37);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("⋯", RPG.CENTER);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(46);
	c.getButton().addCharCode(53);
	c.getButton().addKeyCode(12);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("▶", RPG.E);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(54);
	c.getButton().addKeyCode(39);

	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◣", RPG.SW);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(49);
	c.getButton().addKeyCode(35);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("▼", RPG.S);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(50);
	c.getButton().addKeyCode(40);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◢", RPG.SE);
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
	this._button.setChars("z\u001B");
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
	var pc = RPG.Game.pc;
	var map = pc.getMap();

	if (cmd) {
		RPG.UI.setMode(RPG.UI_NORMAL);
		/* direction given */
		var coords = pc.getCoords().neighbor(cmd.getDir());
		var f = map.getFeature(coords);
		if (f && f instanceof RPG.Features.Door && f.isClosed()) {
			/* correct direction */
			var result = RPG.Game.pc.open(f);
			RPG.Game.getEngine().actionResult(result);
			return;
		} else {
			/* incorrect direction */
			RPG.UI.buffer.message("there is no door at that location.");
		}
	} else {
		/* no direction, check surroundings */
		var doors = this._surroundingDoors(true);
		if (doors instanceof RPG.Features.Door) {
			/* exactly one door found */
			var result = RPG.Game.pc.open(doors);
			RPG.Game.getEngine().actionResult(result);
			return;
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
	var pc = RPG.Game.pc;
	var map = pc.getMap();

	if (cmd) {
		RPG.UI.setMode(RPG.UI_NORMAL);
		/* direction given */
		var coords = pc.getCoords().neighbor(cmd.getDir());
		var f = map.getFeature(coords);
		if (f && f instanceof RPG.Features.Door && !f.isClosed()) {
			/* correct direction */
			var result = RPG.Game.pc.close(f);
			RPG.Game.getEngine().actionResult(result);
			return;
		} else {
			/* incorrect direction */
			RPG.UI.buffer.message("there is no door at that location.");
		}
	} else {
		/* no direction, check surroundings */
		var doors = this._surroundingDoors(false);
		if (doors instanceof RPG.Features.Door) {
			/* exactly one door found */
			var result = RPG.Game.pc.close(doors);
			RPG.Game.getEngine().actionResult(result);
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
	if (cmd) {
		RPG.UI.setMode(RPG.UI_NORMAL);
		var coords = RPG.Game.pc.getCoords().neighbor(cmd.getDir());
		var result = RPG.Game.pc.kick(coords);
		RPG.Game.getEngine().actionResult(result);
	} else {
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Kick");
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
	var errMsg = "There is no one to chat with.";
	var pc = RPG.Game.pc;
	var map = pc.getMap();

	if (cmd) {
		/* direction given */
		RPG.UI.setMode(RPG.UI_NORMAL);
		var coords = pc.getCoords().neighbor(cmd.getDir());
		var being = map.getBeing(coords);
		if (!being) {
			RPG.UI.buffer.message(errMsg);
		} else {
			var result = RPG.Game.pc.chat(being);
			RPG.Game.getEngine().actionResult(result);
			return;
		}
	} else {
		var beings = this._surroundingBeings();
		if (!beings.length) {
			RPG.UI.buffer.message(errMsg);
		} else if (beings.length == 1) {
			var result = RPG.Game.pc.chat(beings[0]);
			RPG.Game.getEngine().actionResult(result);
			return;
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
	var result = RPG.Game.pc.search();
	RPG.Game.getEngine().actionResult(result);
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
	var pc = RPG.Game.pc;
	var items = pc.getMap().getItems(pc.getCoords());
	
	if (!items.length) {
		RPG.UI.buffer.message("There is nothing to pick up!");
		return;
	}
	
	if (items.length == 1) {
		var item = items[0];
		var amount = item.getAmount();
		var result = RPG.Game.pc.pick([[item, amount]]);
		RPG.Game.getEngine().actionResult(result);
		return;
	}
	
	new RPG.UI.Itemlist(items, "Select items to be picked up", -1, this.bind(this._done));
}
RPG.UI.Command.Pick.prototype._done = function(items) {
	var result = RPG.Game.pc.pick(items);
	RPG.Game.getEngine().actionResult(result);
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
	var pc = RPG.Game.pc;
	var items = pc.getItems();
	if (items.length) {
		new RPG.UI.Itemlist(items, "Select items to be dropped on the ground", -1, this.bind(this._done));
	} else {
		RPG.UI.buffer.message("You don't own anything!");
	}
}
RPG.UI.Command.Drop.prototype._done = function(items) {
	var result = RPG.Game.pc.drop(items);
	RPG.Game.getEngine().actionResult(result);
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
	new RPG.UI.Slots(RPG.Game.pc, this.bind(this._done));
}

RPG.UI.Command.Inventory.prototype._done = function(changed) {
	if (changed) { 
		var result = RPG.Game.pc.equipDone(); 
		RPG.Game.getEngine().actionResult(result);
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
	this._dir = null;
	this._left = false;
	this._right = false;
	this._steps = 0;
	this._yt = null;
	this._beings = 0;
}
RPG.UI.Command.Autowalk.prototype.exec = function(cmd) {
	if (cmd) {
		/* direction given */
		RPG.UI.setMode(RPG.UI_NORMAL);
		this._start(cmd.getDir());
	} else {
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Walk continuously");
	}
}

RPG.UI.Command.Autowalk.prototype._start = function(dir) {
	var pc = RPG.Game.pc;
	var map = pc.getMap();
	
	/* cannot walk to the wall */
	if (dir != RPG.CENTER) {
		var coords = pc.getCoords().neighbor(dir);
		if (map.blocks(RPG.BLOCKS_MOVEMENT, coords) ) { return; }
	}

	this._saveState(dir);
	this._steps = 0;
	this._yt = pc.yourTurn;
	pc.yourTurn = this.bind(this._yourTurn);
	this._beings = Infinity;
	var result = this._step();
	RPG.Game.getEngine().actionResult(result);
}

/**
 * Save state of current direction + left/right neighbors 
 */
RPG.UI.Command.Autowalk.prototype._saveState = function(dir) {
	this._dir = dir;
	if (dir == RPG.CENTER) { return; }
	
	var pc = RPG.Game.pc;
	var map = pc.getMap();
	var coords = pc.getCoords();
	
	var leftDir = (dir + 6) % 8;
	var rightDir = (dir + 2) % 8;
	var leftCoords = coords.neighbor(leftDir);
	var rightCoords = coords.neighbor(rightDir);
	this._left = leftCoords ? !map.blocks(RPG.BLOCKS_MOVEMENT, leftCoords) : false;
	this._right = rightCoords ? !map.blocks(RPG.BLOCKS_MOVEMENT, rightCoords) : false;
}

RPG.UI.Command.Autowalk.prototype._yourTurn = function() {
	if (this._check()) {
		/* still going */
		return this._step();
	} else {
		/* walk no more */
		RPG.Game.pc.yourTurn = this._yt;
		return RPG.Game.pc.yourTurn();
	}
}

/**
 * Most complicated part. Check whether we can continue autowalking.
 */
RPG.UI.Command.Autowalk.prototype._check = function() {
	var pc = RPG.Game.pc;
	var map = pc.getMap();
	var coords = pc.getCoords();
	
	var count = this._beingCount();
	if (count > this._beings) { return false; }
	this._beings = count;

	if (this._steps == 50) { return false; } /* too much steps */
	if (map.getItems(coords).length) { return false; } /* we stepped across some items */
	if (this._dir == RPG.CENTER) { return true; } /* standing on a spot is okay now */

	/* now check neighbor status */
	var leftDir = (this._dir + 6) % 8;
	var rightDir = (this._dir + 2) % 8;

	var aheadCoords = coords.neighbor(this._dir);
	var leftCoords = coords.neighbor(leftDir);
	var rightCoords = coords.neighbor(rightDir);
	
	if (!map.getCell(aheadCoords)) { return false; } /* end of map reached */
	var ahead = !map.blocks(RPG.BLOCKS_MOVEMENT, aheadCoords);
	var left = !map.blocks(RPG.BLOCKS_MOVEMENT, leftCoords);
	var right = !map.blocks(RPG.BLOCKS_MOVEMENT, rightCoords);
	
	/* leaving opened area/crossroads */
	if (this._left && !left) { this._left = left; }
	if (this._right && !right) { this._right = right; }
	
	/* standing against a being */
	if (map.getBeing(aheadCoords)) { return false; } 
	
	/* standing close to a feature */
	if (map.getFeature(coords) && pc.knowsFeature(map.getFeature(coords))) { return false; } 
	if (map.getFeature(leftCoords) && pc.knowsFeature(map.getFeature(leftCoords))) { return false; } 
	if (map.getFeature(rightCoords) && pc.knowsFeature(map.getFeature(rightCoords))) { return false; } 

	if (ahead) {
		/* we can - in theory - continue; just check if we are not standing on a crossroads */
		if ((!this._left && left) || (!this._right && right)) { return false; }
	} else {
		/* feature blocks way - stop */
		if (map.getFeature(aheadCoords) && pc.knowsFeature(map.getFeature(aheadCoords))) { return false; }
		
		/* try to change direction, because it is not possible to continue */
		var freecount = 0;
		var circle = map.getCoordsInCircle(coords, 1, false);
		for (var i=0;i<circle.length;i++) { if (!map.blocks(RPG.BLOCKS_MOVEMENT, circle[i])) { freecount++; } }
		if (freecount > 2) { return false; } /* too many options to go */
		
		if (left && !right) {
			/* turn left */
			this._saveState(leftDir);
		} else if (right && !left) {
			/* turn right */
			this._saveState(rightDir);
		} else {
			return false; /* the only way from here is diagonal, stop */
		}	
	}

	return true;
}

RPG.UI.Command.Autowalk.prototype._step = function() {
	this._steps++;
	var pc = RPG.Game.pc;
	
	if (this._dir == RPG.CENTER) {
		return RPG.Game.pc.wait();
	} else {
		return RPG.Game.pc.move(pc.getCoords().neighbor(this._dir));
	}
}

RPG.UI.Command.Autowalk.prototype._beingCount = function() {
	var counter = 0;
	var map = RPG.Game.pc.getMap();
	var visible = RPG.Game.pc.getVisibleCoords();
	for (var id in visible) {
		var coords = visible[id];
		if (map.getBeing(visible[id])) { counter++; }
	}
	return counter;
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
	RPG.UI.map.syncSize();
}

/**
 * @class Ascend
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Ascend = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Ascend.prototype.init = function() {
	this.parent("Ascend / Leave");
	this._button.setChar("<");
}

RPG.UI.Command.Ascend.prototype.exec = function() {
	var pc = RPG.Game.pc;
	var map = pc.getMap();
	var f = map.getFeature(pc.getCoords());
	if (f && f instanceof RPG.Features.Connector.Exit) {
		var result = RPG.Game.pc.enterConnector();
		RPG.Game.getEngine().actionResult(result);
	} else {
		RPG.UI.buffer.message("You don't see any exit here.");
	}
}


/**
 * @class Descend
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Descend = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Descend.prototype.init = function() {
	this.parent("Descend / Enter");
	this._button.setChar(">");
}

RPG.UI.Command.Descend.prototype.exec = function() {
	var pc = RPG.Game.pc;
	var map = pc.getMap();
	var f = map.getFeature(pc.getCoords());
	if (f && f instanceof RPG.Features.Connector.Entry) {
		var result = RPG.Game.pc.enterConnector();
		RPG.Game.getEngine().actionResult(result);
	} else {
		RPG.UI.buffer.message("You don't see any entry here.");
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
	var pc = RPG.Game.pc;
	var map = pc.getMap();
	var f = map.getFeature(pc.getCoords());
	if (f && f instanceof RPG.Features.Trap && pc.knowsFeature(f)) {
		var result = pc.activateTrap(f);
		RPG.Game.getEngine().actionResult(result);
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
	var pc = RPG.Game.pc;
	var hand = pc.getSlot(RPG.SLOT_WEAPON);
	var hit = hand.getHit();
	var dmg = hand.getDamage();
	RPG.UI.alert("Current weapon hit/damage: "+hit.toString()+"/"+dmg.toString(), "Game info");
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
	var pc = RPG.Game.pc;
	var feet = pc.getSlot(RPG.SLOT_FEET);
	var hit = feet.getHit();
	var dmg = feet.getDamage();
	RPG.UI.alert("Current kick hit/damage: "+hit.toString()+"/"+dmg.toString(), "Game info");
}

/**
 * @class Show kill statistics
 * @augments RPG.UI.Command
 */
RPG.UI.Command.KillStats = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.KillStats.prototype.init = function() {
	this.parent("Kill statistics");
	this._button.setCtrl();
	this._button.setChar("k");
}

RPG.UI.Command.KillStats.prototype.exec = function() {
	var pc = RPG.Game.pc;
	var kills = pc.getKills();
	RPG.UI.alert("Beings killed so far: "+kills, "Game info");
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
		this._coords.plus(RPG.DIR[cmd.getDir()]);
		var cell = RPG.Game.pc.getMap().getCell(this._coords);
		if (!cell) { return; }
		
		RPG.UI.map.setFocus(this._coords);
		var result = RPG.Game.pc.look(this._coords);
		RPG.Game.getEngine().actionResult(result);
	} else {
		this._coords = RPG.Game.pc.getCoords().clone();
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Look around");
	}
}

RPG.UI.Command.Look.prototype.cancel = function() {
	RPG.UI.refocus();
}

/**
 * Abstract consumption command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Consume = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Consume.prototype.exec = function(itemCtor, listTitle, errorString, method) {
	var pc = RPG.Game.pc;
	var map = pc.getMap();
	var items = map.getItems(pc.getCoords());
	this._container = null;
	this._method = method;
	
	/* from ground? */
	var all = this._filter(items, itemCtor);
	var title = listTitle;
	
	if (all.length) {
		this._container = map;
		title += " from the ground";
	} else {
		all = this._filter(pc.getItems(), itemCtor);
		if (!all.length) { 
			RPG.UI.buffer.message(errorString);
			return;
		}
		this._container = pc;
	}
	
	new RPG.UI.Itemlist(all, title, 1, this.bind(this._done));
}
RPG.UI.Command.Consume.prototype._filter = function(items, itemCtor) {
	var arr = [];
	for (var i=0;i<items.length;i++) {
		var item = items[i];
		if (item instanceof itemCtor && !item.isUnpaid()) { arr.push(item); }
	}
	return arr;
}
RPG.UI.Command.Consume.prototype._done = function(items) {
	if (!items.length) { return; }
	
	var item = items[0][0];
	var result = this._method.call(RPG.Game.pc, item, this._container); 
	RPG.Game.getEngine().actionResult(result);
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
				RPG.Game.pc.eat);
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
				RPG.Game.pc.drink);
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
		var coords = RPG.Game.pc.getCoords().neighbor(cmd.getDir());
		RPG.UI.setMode(RPG.UI_NORMAL);
		var result = RPG.Game.pc.switchPosition(coords);
		RPG.Game.getEngine().actionResult(result);
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

RPG.UI.Command.Cast.prototype.notify = function(coords) {
	if (this._spell.getType() == RPG.SPELL_TARGET) {
		var source = RPG.Game.pc.getCoords();
		this._spell.showTrajectory(source, coords, RPG.Game.pc.getMap());
	}
}

RPG.UI.Command.Cast.prototype.exec = function(coords) {
	if (!this._spell) { /* list of spells */
		var spells = RPG.Game.pc.getSpells();
		if (spells.length) {
			new RPG.UI.Spelllist(spells, "Select a spell to cast", this.bind(this._done));
		} else {
			RPG.UI.buffer.message("You don't know any spells.");
		}
		
	} else { /* we have spell and optionally a direction/target */
		RPG.UI.map.removeProjectiles();
		RPG.UI.refocus();

		var type = this._spell.getType();
		
		switch (type) {
			case RPG.SPELL_SELF:
				var target = null;
			break;
			case RPG.SPELL_TOUCH:
			case RPG.SPELL_DIRECTION:
				var target = coords.getDir();
			break;
			case RPG.SPELL_REMOTE:
			case RPG.SPELL_TARGET:
				var target = coords;
			break;
		}

		RPG.UI.setMode(RPG.UI_NORMAL);
		var result = RPG.Game.pc.cast(this._spell, target);
		this._spell = null;		
		RPG.Game.getEngine().actionResult(result);
	}
}

RPG.UI.Command.Cast.prototype.cancel = function() {
	this._spell = null;
	RPG.UI.map.removeProjectiles();
	RPG.UI.refocus();
}

/**
 * Spell selected
 */
RPG.UI.Command.Cast.prototype._done = function(spells) {
	if (!spells.length) { return; }
	
	var spell = spells[0][0];
	spell = new spell(RPG.Game.pc);
	var cost = spell.getCost();
	
	if (RPG.Game.pc.getStat(RPG.STAT_MANA) < cost) {
		RPG.UI.buffer.message("Not enough mana.");
		return;
	}
	
	this._spell = spell;
	var type = spell.getType();
	switch (type) {
		case RPG.SPELL_SELF:
			this.exec();
		break;
		case RPG.SPELL_TOUCH:
		case RPG.SPELL_DIRECTION:
			RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Cast a spell");
		break;
		case RPG.SPELL_REMOTE:
		case RPG.SPELL_TARGET:
			RPG.UI.setMode(RPG.UI_WAIT_TARGET, this, "Cast a spell");
		break;
	}
	
	if (type == RPG.SPELL_TARGET) {
		this.notify(RPG.Game.pc.getCoords());
	}
}

/**
 * @class Flirt command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Flirt = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Flirt.prototype.init = function() {
	this.parent("Flirt");
	this._button.setChar("f");
}
RPG.UI.Command.Flirt.prototype.exec = function(cmd) {
	if (!cmd) {
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Flirt with someone");
	} else {
		RPG.UI.setMode(RPG.UI_NORMAL);
		var coords = RPG.Game.pc.getCoords().neighbor(cmd.getDir());
		var result = RPG.Game.pc.flirt(coords);
		RPG.Game.getEngine().actionResult(result);
	}
}

/**
 * @class Mute/unmute command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Mute = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Mute.prototype.init = function() {
	this.parent("Mute");
	this._button.setChar("m");
}
RPG.UI.Command.Mute.prototype.exec = function() {
	var state = !RPG.UI.sound.getMuted();
	RPG.UI.sound.setMuted(state);
	if (state) {
		this._button.setLabel("Unmute");
	} else {
		this._button.setLabel("Mute");
	}
}

/**
 * @class Read command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Read = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Read.prototype.init = function() {
	this.parent("Read");
	this._button.setChar("r");
}
RPG.UI.Command.Read.prototype.exec = function() {
	var pc = RPG.Game.pc;
	var all = [];
	var items = pc.getItems();
	for (var i=0;i<items.length;i++) {
		var item = items[i];
		if (item instanceof RPG.Items.Readable && !item.isUnpaid()) { all.push(item); }
	}
	
	if (!all.length) { 
		RPG.UI.buffer.message("You don't own anything readable!"); 
		return;
	}

	new RPG.UI.Itemlist(all, "Select item to read", 1, this.bind(this._done));
}

RPG.UI.Command.Read.prototype._done = function(items) {
	if (!items.length) { return; }
	
	var item = items[0][0];
	var result = RPG.Game.pc.read(item);
	RPG.Game.getEngine().actionResult(result);
}

/**
 * @class List quests
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Quests = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Quests.prototype.init = function() {
	this.parent("Quests");
	this._button.setChar("q");
}
RPG.UI.Command.Quests.prototype.exec = function() {
	new RPG.UI.Questlist(RPG.Game.pc.getQuests());
}

/**
 * @class Throw/shoot command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Launch = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Launch.prototype.init = function() {
	this.parent("Throw/shoot");
	this._button.setChar("t");
}

RPG.UI.Command.Launch.prototype.notify = function(coords) {
	var pc = RPG.Game.pc;
	pc.getSlot(RPG.SLOT_PROJECTILE).getItem().showTrajectory(pc.getCoords(), coords, pc.getMap());
}

RPG.UI.Command.Launch.prototype.exec = function(coords) {
	var pc = RPG.Game.pc;
	if (!coords) {
		var item = pc.getSlot(RPG.SLOT_PROJECTILE).getItem();
		if (!item) { 
			RPG.UI.buffer.message("You have no ammunition ready.");
			return;
		}
		
		if (!item.isLaunchable()) {
			RPG.UI.buffer.message("You have no suitable weapon for this ammunition.");
			return;
		}

		RPG.UI.setMode(RPG.UI_WAIT_TARGET, this, "Throw/shoot");
	} else {
		RPG.UI.refocus();
		RPG.UI.map.removeProjectiles();
		RPG.UI.setMode(RPG.UI_NORMAL);
		var map = pc.getMap();
		
		if (coords.equals(pc.getCoords())) {
			RPG.UI.buffer.message("You do not want to do that, do you?");
			return;
		}
		
		var result = RPG.Game.pc.launch(pc.getSlot(RPG.SLOT_PROJECTILE).getItem(), coords);
		RPG.Game.getEngine().actionResult(result);
	}
}

RPG.UI.Command.Launch.prototype.cancel = function() {
	RPG.UI.map.removeProjectiles();
	RPG.UI.refocus();
}

/**
 * @class Save
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Save = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Save.prototype.init = function() {
	this.parent("Save");
	this._button.setChar("S");
}

RPG.UI.Command.Save.prototype.exec = function() {
	RPG.UI.saveload.show(RPG.SAVELOAD_SAVE);
}

/**
 * @class Load
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Load = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Load.prototype.init = function() {
	this.parent("Load");
	this._button.setChar("L");
}

RPG.UI.Command.Load.prototype.exec = function() {
	RPG.UI.saveload.show(RPG.SAVELOAD_LOAD);
}

/**
 * @class Debts
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Debts = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Debts.prototype.init = function() {
	this.parent("Show debts");
	this._button.setChar("P");
}

RPG.UI.Command.Debts.prototype.exec = function() {
	var debts = RPG.Game.pc.getDebts();
	var str = "You currently owe " + (debts || "no") + " gold pieces.";
	RPG.UI.alert(str, "Game info");
}

/**
 * @class Toggle buttons
 * @augments RPG.UI.Command
 */
RPG.UI.Command.ToggleButtons = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.ToggleButtons.prototype.init = function() {
	this.parent("Toggle command buttons");
	this._button.setChar("?");
	this._state = true;
	this.exec();
}

RPG.UI.Command.ToggleButtons.prototype.exec = function() {
	this._state = !this._state;
	OZ.$("keypad").style.display = (this._state ? "" : "none");
	OZ.$("commands").style.display = (this._state ? "" : "none");
	if (RPG.UI.map) { RPG.UI.map.syncSize(); }
}

/**
 * @class Attributes
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Attributes = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Attributes.prototype.init = function() {
	this.parent("Attributes");
	this._button.setChar("x");
}
RPG.UI.Command.Attributes.prototype.exec = function() {
	var feature = RPG.Game.pc.getMap().getFeature(RPG.Game.pc.getCoords());
	var allow = (feature && feature instanceof RPG.Features.Altar);
	new RPG.UI.Attributes(RPG.Game.pc, allow);
}
