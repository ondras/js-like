RPG.UI.buffer = null; /* text message display */
RPG.UI.map = null; /* map instance */
RPG.UI.status = null; /* statusbar */
RPG.UI.sound = null; /* soundmanager */

RPG.UI._commands = []; /* avail commands */
RPG.UI._pending = null; /* command awaiting specification */
RPG.UI._dimmer = null; /* dimmer element */
RPG.UI._dialog = null; /* current dialog */
RPG.UI._mode = -1; /* current UI mode */	
RPG.UI._target = null; /* targetting coords */

RPG.UI.setMode = function(mode, command, data) {
	if (this._mode == mode) { return; }
	this._mode = mode;
	switch (mode) {
		case RPG.UI_NORMAL:
			this._pending = null;
			this._adjustButtons({commands:true, cancel:false, dir:true});
			this.map.setFocus(RPG.World.pc.getCell().getCoords());
		break;
		case RPG.UI_LOCKED:
			this._adjustButtons({commands:false, cancel:false, dir:false});
		break;
		case RPG.UI_WAIT_DIRECTION:
			this._pending = command;
			this.buffer.message(data+": select direction...");
			this._adjustButtons({commands:false, cancel:true, dir:true, pending:false});
		break;
		case RPG.UI_WAIT_TARGET:
			this._pending = command;
			this._target = RPG.World.pc.getCell().getCoords().clone();
			this.buffer.message(data+": select target...");
			this._adjustButtons({commands:false, cancel:true, dir:true, pending:true});
		break;
		case RPG.UI_WAIT_DIALOG:
			this._adjustButtons({commands:false, cancel:false, dir:false});
		break;
		case RPG.UI_WAIT_CHAT:
			new RPG.UI.Chat(data, command);
		break;
	}
}

/**
 * This command wants to be executed
 */
RPG.UI.command = function(command) {
	if (this._mode != RPG.UI_WAIT_TARGET) { 
		this.buffer.clear(); 
	} else if (command instanceof RPG.UI.Command.Cancel || command == this._pending) {
		this.buffer.clear(); 
	}

	/* no sry */
	if (this._mode == RPG.UI_LOCKED) { return; } 
	
	if (command instanceof RPG.UI.Command.Cancel && this._mode != RPG.UI_NORMAL) { 
		/* cancel */
		if (this._pending) { this._pending.cancel(); }
		command.exec();
		return; 
	} 
	
	/* no commands in dialog mode (bar cancel) */
	if (this._mode == RPG.UI_WAIT_DIALOG) { return; } 
	
	/* non-dir when direction is needed */
	if (this._mode == RPG.UI_WAIT_DIRECTION && !(command instanceof RPG.UI.Command.Direction)) { return; } 
	
	/* targetting mode */
	if (this._mode == RPG.UI_WAIT_TARGET) {
		if (command instanceof RPG.UI.Command.Direction) {
			/* adjust target */
			var test = this._target.clone().plus(command.getCoords());
			var map = RPG.World.getMap();
			if (!map.isValid(test)) { return; }
			this._target = test;
			RPG.UI.map.setFocus(this._target);
			this._pending.notify(this._target);
		}
		if (command == this._pending) {
			this._pending.exec(this._target);
		}
		return; 
	}
	
	if (this._pending) {
		this._pending.exec(command);
	} else {
		command.exec();
	}
}

/**
 * Pass an action to the World
 * @param {function} ctor action constructor
 * @param {?} target action target
 * @param {?} params action params
 */
RPG.UI.action = function(ctor, target, params) {
	if (this._locked) { return; }
	var a = new ctor(RPG.World.pc, target, params);
	RPG.World.action(a);
}

RPG.UI.build = function() {
	var ta = OZ.$("buffer");
	this.buffer = new RPG.UI.TextBuffer(ta);

	var keypad = OZ.$("keypad");
	new RPG.UI.Command.Table(keypad);
	keypad.appendChild(new RPG.UI.Command.Cancel().getButton().getInput());
	
	var mapswitch = OZ.$("mapswitch");
	new RPG.UI.Mapswitch(mapswitch);
	
	var status = OZ.$("status");
	this.status = new RPG.UI.Status(status);
	
	var c = OZ.$("commands");
	
	var d = OZ.DOM.elm("div", {innerHTML:"Movement: "});
	c.appendChild(d);
	d.appendChild(new RPG.UI.Command.Autowalk().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Ascend().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Descend().getButton().getInput());
	d.appendChild(new RPG.UI.Command.SwitchPosition().getButton().getInput());
	
	var d = OZ.DOM.elm("div", {innerHTML:"Interaction: "});
	c.appendChild(d);
	d.appendChild(new RPG.UI.Command.Open().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Close().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Kick().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Chat().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Search().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Trap().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Eat().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Drink().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Cast().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Flirt().getButton().getInput());

	var d = OZ.DOM.elm("div", {innerHTML:"Item management: "});
	c.appendChild(d);
	d.appendChild(new RPG.UI.Command.Pick().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Drop().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Inventory().getButton().getInput());

	var d = OZ.DOM.elm("div", {innerHTML:"Information: "});
	c.appendChild(d);
	d.appendChild(new RPG.UI.Command.Look().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Backlog().getButton().getInput());
	d.appendChild(new RPG.UI.Command.WeaponStats().getButton().getInput());
	d.appendChild(new RPG.UI.Command.KickStats().getButton().getInput());
}

RPG.UI.showDialog = function(data, title) {
	this._dim();
	if (!this._dialog) {
		this._dialog = OZ.DOM.elm("div", {"class":"dialog", position:"absolute"});
	}
	OZ.DOM.clear(this._dialog);
	document.body.appendChild(this._dialog);
	var h = OZ.DOM.elm("h1");
	h.innerHTML = title;
	this._dialog.appendChild(h);
	this._dialog.appendChild(data);
	this.syncDialog();
}

RPG.UI.syncDialog = function() {
	var c = this._dialog;
	var w = c.offsetWidth;
	var h = c.offsetHeight;
	var win = OZ.DOM.win();
	var scroll = OZ.DOM.scroll();
	c.style.left = (scroll[0] + Math.round((win[0]-w)/2)) + "px";
	c.style.top = (scroll[1] + Math.round((win[1]-h)/2)) + "px";
}

RPG.UI.hideDialog = function() {
	this._dialog.parentNode.removeChild(this._dialog);
	this._undim();
}

/**
 * @param {bool} [data.commands]
 * @param {bool} [data.cancel]
 * @param {bool} [data.dir]
 * @param {bool} [data.pending]
 */ 
RPG.UI._adjustButtons = function(data) {
	for (var i=0;i<this._commands.length;i++) {
		var c = this._commands[i];
		var b = c.getButton().getInput();
		
		if (c instanceof RPG.UI.Command.Direction) {
			/* directional */
			b.disabled = !data.dir;
		} else if (c instanceof RPG.UI.Command.Cancel) {
			/* cancel button */
			b.disabled = !data.cancel;
		} else if (c == this._pending) {
			/* pending button */
			b.disabled = !data.pending;
		} else {
			/* standard buttons */
			b.disabled = !data.commands;
		}
	}
}

/**
 * Dim the UI - because something "modal" will be shown
 */ 
RPG.UI._dim = function() {
	if (this._dimmer) { return; }
	var div = OZ.DOM.elm("div", {position:"absolute", backgroundColor:"black", opacity:0.5});
	document.body.appendChild(div);
	this._dimmer = div;
	
	
	var sync = function() {
		var port = OZ.DOM.win();
		var scroll = OZ.DOM.scroll();
		div.style.left = scroll[0]+"px";
		div.style.top = scroll[1]+"px";
		div.style.width = port[0]+"px";
		div.style.height = port[1]+"px";
	}
	
	this._ec = [];
	this._ec.push(OZ.Event.add(window, "scroll", sync));
	this._ec.push(OZ.Event.add(window, "resize", sync));
	sync();
}

/**
 * Undim the UI
 */ 
RPG.UI._undim = function() {
	if (!this._dimmer) { return; }
	this._ec.forEach(OZ.Event.remove);
	this._dimmer.parentNode.removeChild(this._dimmer);
	this._dimmer = null;
}

