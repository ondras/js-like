RPG.UI.buffer = null; /* text message display */
RPG.UI.map = null; /* map instance */
RPG.UI.status = null; /* statusbar */

RPG.UI._commands = []; /* avail commands */
RPG.UI._pending = null; /* command awaiting specification */
RPG.UI._dimmer = null; /* dimmer element */
RPG.UI._mode = -1;

/**
 * Static version of bind
 */
RPG.UI.bind = OZ.Class().prototype.bind;

RPG.UI.setMode = function(mode, command, data) {
	if (this._mode == mode) { return; }
	this._mode = mode;
	switch (mode) {
		case RPG.UI_NORMAL:
			this._pending = null;
			this._undim();
			this._adjustButtons({commands:true, cancel:false, dir:true});
		break;
		case RPG.UI_LOCKED:
			this._adjustButtons({commands:false, cancel:false, dir:false});
		break;
		case RPG.UI_WAIT_DIRECTION:
			this._pending = command;
			this.buffer.message(data+": select direction...");
			this._adjustButtons({commands:false, cancel:true, dir:true});
		break;
		case RPG.UI_WAIT_ITEMS:
			this._pending = command;
			this._dim();
			this._adjustButtons({commands:false, cancel:false, dir:false});
			new this.Itemlist(data);
		break;
		case RPG.UI_WAIT_CHAT:
			new RPG.UI.Chat(data, command);
		break;
		case RPG.UI_DONE_ITEMS:
			this._pending.exec(data);
			this.setMode(RPG.UI_NORMAL);
		break;
		case RPG.UI_DONE_CHAT:
			this.setMode(RPG.UI_NORMAL);
		break;
	}
}

/**
 * This command wants to be executed
 */
RPG.UI.command = function(command) {
	this.buffer.clear();

	/* no sry */
	if (this._mode == RPG.UI_LOCKED) { return; } 
	
	if (command instanceof RPG.UI.Command.Cancel && this._mode != RPG.UI_NORMAL) { 
		/* cancel */
		command.exec();
		return; 
	} 
	
	/* no commands in itemlist (bar cancel) */
	if (this._mode == RPG.UI_WAIT_ITEMS) { return; } 
	
	/* non-dir when direction is needed */
	if (!(command instanceof RPG.UI.Command.Direction) && this._mode == RPG.UI_WAIT_DIRECTION) { return; } 
	
	if (this._pending) {
		this._pending.exec(command);
		this.setMode(RPG.UI_NORMAL);
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
	var a = new ctor(RPG.World.getPC(), target, params);
	RPG.World.action(a);
}

RPG.UI.build = function() {
	var ta = OZ.$("buffer");
	this.buffer = new RPG.UI.TextBuffer(ta);

	var keypad = OZ.$("keypad");
	new RPG.UI.Command.Table(keypad);
	
	var mapswitch = OZ.$("mapswitch");
	new RPG.UI.Mapswitch(mapswitch);
	
	var status = OZ.$("status");
	this.status = new RPG.UI.Status(status);
	
	var div = OZ.$("commands");
	div.appendChild(new RPG.UI.Command.Autowalk().getButton());
	div.appendChild(new RPG.UI.Command.Pick().getButton());
	div.appendChild(new RPG.UI.Command.Drop().getButton());
	div.appendChild(new RPG.UI.Command.Inventory().getButton());
	div.appendChild(new RPG.UI.Command.Open().getButton());
	div.appendChild(new RPG.UI.Command.Close().getButton());
	div.appendChild(new RPG.UI.Command.Kick().getButton());
	div.appendChild(new RPG.UI.Command.Chat().getButton());
	div.appendChild(new RPG.UI.Command.Search().getButton());
	div.appendChild(new RPG.UI.Command.Ascend().getButton());
	div.appendChild(new RPG.UI.Command.Descend().getButton());
	div.appendChild(new RPG.UI.Command.Backlog().getButton());
	div.appendChild(new RPG.UI.Command.Trap().getButton());
	div.appendChild(new RPG.UI.Command.Cancel().getButton());
}

/**
 * @param {bool} [data.commands]
 * @param {bool} [data.cancel]
 * @param {bool} [data.dir]
 */ 
RPG.UI._adjustButtons = function(data) {
	for (var i=0;i<this._commands.length;i++) {
		var c = this._commands[i];
		var b = c.getButton();
		if (!b) { continue; }
		
		if (c instanceof RPG.UI.Command.Direction) {
			/* directional */
			b.disabled = !data.dir;
		} else if (c instanceof RPG.UI.Command.Cancel) {
			/* cancel button */
			b.disabled = !data.cancel;
		} else {
			/* standard buttons */
			b.disabled = !data.commands;
		}
	}
}

/**
 * Keydown handler
 * @param {event} e
 */
RPG.UI._keyPress = function(e) {
	for (var i=0;i<RPG.UI._commands.length;i++) {
		var c = RPG.UI._commands[i];
		if (c.test(e)) { 
			this.command(c); 
			OZ.Event.prevent(e);
		}
	}
}

/**
 * Dim the UI - because something "modal" will be shown
 */ 
RPG.UI._dim = function() {
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


OZ.Event.add(document, "keypress", RPG.UI.bind(RPG.UI._keyPress));

