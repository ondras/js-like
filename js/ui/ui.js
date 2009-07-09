RPG.UI._buffer = null; /* text message display */
RPG.UI._map = null; /* map instance */
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
			this.message(data+": select direction...");
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
	this.clear();

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

RPG.UI.message = function(str) {
	if (this._buffer) { this._buffer.message(str); }
}

RPG.UI.showBacklog = function() {
	if (this._buffer) { this._buffer.showBacklog(); }
}

RPG.UI.hideBacklog = function() {
	if (this._buffer) { this._buffer.hideBacklog(); }
}

RPG.UI.clear = function() {
	if (this._buffer) { this._buffer.clear(); }
}

RPG.UI.redraw = function() {
	if (this._map) { this._map.redraw(); }
}

RPG.UI.redrawCoords = function(coords) {
	if (this._map) { this._map.redrawCoords(coords); }
}

RPG.UI.adjust = function(map) {
	if (this._map) { this._map.adjust(map); }
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

/**
 * Perform a dialogue
 * @param {RPG.Misc.Chat} chat
 * @param {RPG.Actions.BaseAction} action Action which invoked this chat
 */

/**
 * Build image-based map
 */
RPG.UI.buildMap = function(options) {
	var map = OZ.DOM.elm("div", {"class":"map"});
	this._map = new RPG.UI.ImageMap(map, options);
	return map;
}

/**
 * Build ascii-based map
 */
RPG.UI.buildASCII = function(options) {
	var map = OZ.DOM.elm("div", {"class":"ascii"});
	this._map = new RPG.UI.ASCIIMap(map, options);
	return map;
}

/**
 * Build text output buffer
 */
RPG.UI.buildBuffer = function() {
	var ta = OZ.DOM.elm("textarea", {"class":"buffer"});
	this._buffer = new RPG.UI.TextBuffer(ta);
	return ta;
}

/**
 * Build command buttons
 */
RPG.UI.buildCommands = function() {
	var result = [];
	result.push(new RPG.UI.Command.Table().getContainer());
	
	var div = OZ.DOM.elm("div", {"class":"commands"});
	result.push(div);
	
	div.appendChild(new RPG.UI.Command.Autowalk().getButton());
	div.appendChild(new RPG.UI.Command.Pick().getButton());
	div.appendChild(new RPG.UI.Command.Drop().getButton());
	div.appendChild(new RPG.UI.Command.Inventory().getButton());
	div.appendChild(new RPG.UI.Command.Open().getButton());
	div.appendChild(new RPG.UI.Command.Close().getButton());
	div.appendChild(new RPG.UI.Command.Kick().getButton());
	div.appendChild(new RPG.UI.Command.Chat().getButton());
	div.appendChild(new RPG.UI.Command.Search().getButton());
	div.appendChild(new RPG.UI.Command.Backlog().getButton());
	div.appendChild(new RPG.UI.Command.Cancel().getButton());

	return result;
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

