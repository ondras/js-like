RPG.UI._buffer = null;
RPG.UI._map = null;
RPG.UI._locked = false;
RPG.UI._commands = [];
RPG.UI._pending = null;

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
	RPG.UI.adjustButtons({commands:false, dir:false, cancel:false});
}

/**
 * Enable interactive mode
 */
RPG.UI.unlock = function() {
	this._locked = false;
	RPG.UI.adjustButtons({dir:true, commands:true, cancel:false});
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
		} else if (c == this._cancel) {
			/* cancel button */
			b.disabled = !data.cancel;
		} else {
			/* standard buttons */
			b.disabled = !data.commands;
		}
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
	this.clear();
	var a = new ctor(RPG.World.getPC(), target, params);
	RPG.World.action(a);
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
 * Add keyboard control
 */
RPG.UI.enableKeyboard = function() {
	OZ.Event.add(document, "keypress", this.bind(this._keyPress));
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

RPG.UI._surroundingDoors = function(closed) {
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
