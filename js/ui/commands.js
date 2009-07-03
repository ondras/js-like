/**
 * @class Basic command
 */
RPG.UI.Command = OZ.Class();

RPG.UI.Command.prototype.init = function(label) {
	RPG.UI._commands.push(this);
	this._charCodes = [];
	this._keyCodes = [];
	this._func = function() {};
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

RPG.UI.Command.prototype.setFunc = function(func) {
	this._func = func;
}

RPG.UI.Command.prototype.test = function(charCode, keyCode) {
	if (this._button && this._button.disabled) { return false; }
	return (this._charCodes.indexOf(charCode) != -1 || this._keyCodes.indexOf(keyCode) != -1);
}

RPG.UI.Command.prototype.exec = function() {
	this._func.call(this);
}

/**
 * @class Directional command
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
 * @class Complex command, may depend on other commands
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
	
	var result = this._func.call(this, subcommand);
	if (result) { 
		RPG.UI.adjustButtons({commands:true, cancel:false, dir:true});
	} else {
		RPG.UI.adjustButtons({commands:false, cancel:true, dir:true});
		RPG.UI._pending = this; 
	}
}

/**
 * Build command buttons
 */
RPG.UI.buildCommands = function() {
	var result = [];
	result.push(this._buildKeypad());
	
	var div = OZ.DOM.elm("div", {"class":"commands"});
	result.push(div);
	
	var c = new RPG.UI.Command("Pick (,)");
	div.appendChild(c.getButton());
	c.addCharCode(44);
	c.setFunc(function(){
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
	});
	
	var c = new RPG.UI.Command.Complex("Open (o)");
	div.appendChild(c.getButton());
	c.addCharCode(111);
	c.setFunc(function(cmd) {
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
			var doors = RPG.UI._surroundingDoors(true);
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
	});

	var c = new RPG.UI.Command.Complex("Close (c)");
	div.appendChild(c.getButton());
	c.addCharCode(99);
	c.setFunc(function(cmd){
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
			var doors = RPG.UI._surroundingDoors(false);
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
	});

	var c = new RPG.UI.Command.Complex("Kick (k)");
	div.appendChild(c.getButton());
	c.addCharCode(107);
	c.setFunc(function(cmd){
		if (!cmd) {
			RPG.UI.clear();
			RPG.UI.message("Kick: select direction...");
			return false;
		} else {
			var coords = RPG.World.getPC().getCoords().clone().plus(cmd.getCoords());
			RPG.UI.action(RPG.Actions.Kick, coords);
			return true;
		}
	});
	
	var c = new RPG.UI.Command("Cancel (z)");
	this._cancel = c;
	div.appendChild(c.getButton());
	c.addCharCode(122);
	c.setFunc(function(){
		RPG.UI.clear();
		RPG.UI._pending = null;
		RPG.UI.adjustButtons({commands:true, dir:true, cancel:false});
	});

	return result;
}

/**
 * Build directional navigation
 */
RPG.UI._buildKeypad = function() {
	var keypad = OZ.DOM.elm("table", {"class":"keypad"});
	var tb = OZ.DOM.elm("tbody");
	keypad.appendChild(tb);

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

	return keypad;
}
