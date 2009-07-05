RPG.UI._buffer = null; /* text message display */
RPG.UI._map = null; /* map instance */
RPG.UI._locked = false; /* is ui locked? (because it is not PC's time to act) */
RPG.UI._commands = []; /* avail commands */
RPG.UI._pending = null; /* command awaiting specification */
RPG.UI._auto = null; /* autowalk command instance */
RPG.UI.Chat = {};
RPG.UI.Itemlist = {};

/**
 * Static version of bind
 */
RPG.UI.bind = OZ.Class().prototype.bind;

RPG.UI.message = function(str) {
	if (this._buffer) { this._buffer.message(str); }
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
 * Disable interactive mode
 */
RPG.UI.lock = function() {
	this._locked = true;
	this.adjustButtons({commands:false, dir:false, cancel:false});
}

/**
 * Enable interactive mode
 */
RPG.UI.unlock = function() {
	this._locked = false;
	this.adjustButtons({dir:true, commands:true, cancel:false});
}

/**
 * Pass an action to the World
 * @param {function} ctor action constructor
 * @param {?} target action target
 * @param {?} params action params
 */
RPG.UI.action = function(ctor, target, params) {
	if (this._locked) { return; }
	this.clear();
	var a = new ctor(RPG.World.getPC(), target, params);
	RPG.World.action(a);
}

/**
 * Perform a dialogue
 * @param {RPG.Misc.Chat} chat
 * @param {RPG.Beings.BaseBeing} source
 * @param {RPG.Beings.BaseBeing} target
 */
RPG.UI.chat = function(chat, action) {
	this.Chat.invoke(chat, action);
}

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
	
	div.appendChild(new RPG.UI.Command.Pick().getButton());
	div.appendChild(new RPG.UI.Command.Open().getButton());
	div.appendChild(new RPG.UI.Command.Close().getButton());
	div.appendChild(new RPG.UI.Command.Kick().getButton());
	div.appendChild(new RPG.UI.Command.Cancel().getButton());
	div.appendChild(new RPG.UI.Command.Chat().getButton());
	div.appendChild(new RPG.UI.Command.Auto().getButton());

	return result;
}

/**
 * @param {bool} [data.commands]
 * @param {bool} [data.cancel]
 * @param {bool} [data.dir]
 */ 
RPG.UI.adjustButtons = function(data) {
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
 * Process a given key
 * @param {int} keyCode
 * @param {int} charCode
 * @returns {bool} was there any action performed?
 */
RPG.UI._handleCode = function(charCode, keyCode) {
	for (var i=0;i<RPG.UI._commands.length;i++) {
		var c = RPG.UI._commands[i];
		if (c.test(charCode, keyCode)) {
			this.clear();
			c.exec();
			return true;
		}
	}
	return false;
}

/**
 * Keydown handler
 * @param {event} e
 */
RPG.UI._keyPress = function(e) {
	if (this._handleCode(e.charCode, e.keyCode)) {
		OZ.Event.prevent(e);
	}
}

OZ.Event.add(document, "keypress", RPG.UI.bind(RPG.UI._keyPress));

