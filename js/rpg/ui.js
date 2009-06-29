/**
 * @namespace
 */
RPG.UI = {
	Buffer: null,
	Map: null,
	_locked: false,
	_commands: [],
	_inputs: []
};

/**
 * Static version of bind
 */
RPG.UI.bind = OZ.Class().prototype.bind;

RPG.UI.init = function() {
	this._defineCommand([57], [33], function() { this._move(1, -1); });
	this._defineCommand([51], [34], function() { this._move(1, 1); });
	this._defineCommand([49], [35], function() { this._move(-1, 1); });
	this._defineCommand([55], [36], function() { this._move(-1, -1); });
	this._defineCommand([52], [37], function() { this._move(-1, 0); });
	this._defineCommand([56], [38], function() { this._move(0, -1); });
	this._defineCommand([54], [39], function() { this._move(1, 0); });
	this._defineCommand([50], [40], function() { this._move(0, 1); });

	/* wait */
	this._defineCommand([46, 53], [12], function() {
		this.action(RPG.Actions.Wait);
	});

	/* pick */
	this._defineCommand([44], [], function() {
		var arr = [];
		var pc = RPG.World.getPC();
		var items = pc.getMap().at(pc.getCoords()).getItems();
		for (var i=0;i<items.length;i++) {
			arr.push(items[i]);
		}
		if (arr.length) { 
			this.action(RPG.Actions.Pick, arr);
		}
	});
	
}

/**
 * Disable interactive mode
 */
RPG.UI.lock = function() {
	this._locked = true;
	this._inputs.forEach(function(inp){
		inp.disabled = true;
	});
}

/**
 * Enable interactive mode
 */
RPG.UI.unlock = function() {
	this._locked = false;
	this._inputs.forEach(function(inp){
		inp.disabled = false;
	});
}

/**
 * Pass an action to the World
 * @param {function} ctor action constructor
 * @param {?} target action target
 * @param {?} params action params
 */
RPG.UI.action = function(ctor, target, params) {
	if (this._locked) { return; }
	this.Buffer.clear();
	var a = new ctor(RPG.World.getPC(), target, params);
	RPG.World.action(a);
}

/**
 * Build image-based map
 */
RPG.UI.buildMap = function(options) {
	var map = OZ.DOM.elm("div", {"class":"map"});
	this.Map = new RPG.Visual.ImageMap(map, options);
	return map;
}

/**
 * Build ascii-based map
 */
RPG.UI.buildASCII = function(options) {
	var map = OZ.DOM.elm("div", {"class":"ascii"});
	this.Map = new RPG.Visual.ASCIIMap(map, options);
	return map;
}

/**
 * Build text output buffer
 */
RPG.UI.buildBuffer = function() {
	var ta = OZ.DOM.elm("textarea", {"class":"buffer"});
	this.Buffer = new RPG.Visual.TextBuffer(ta);
	return ta;
}

/**
 * Build directional navigation
 */
RPG.UI.buildKeypad = function() {
	var def = [
		{
			"◤": 36,
			"▲": 38,
			"◥": 33
		},
		{
			"◀": 37,
			"…": 190,
			"▶": 39
		},
		{
			"◣": 35,
			"▼": 40,
			"◢": 34
		}
	];

	var gen = function(code) {
		return function() {
			return RPG.UI._handleCode(0, code);
		}
	}
	
	var keypad = OZ.DOM.elm("table", {"class":"keypad"});
	var tb = OZ.DOM.elm("tbody");
	keypad.appendChild(tb);
	for (var i=0;i<def.length;i++) {
		var tr = OZ.DOM.elm("tr");
		tb.appendChild(tr);
		for (var p in def[i]) {
			var key = def[i][p];
			var td = OZ.DOM.elm("td");
			var inp = OZ.DOM.elm("input", {type:"button"});
			OZ.DOM.append([tr, td], [td, inp]);
			inp.value = p;
			this._inputs.push(inp);
			OZ.Event.add(inp, "click", gen(key));
		}
	}
	return keypad;
}

/**
 * Build command buttons
 */
RPG.UI.buildCommands = function() {
	var div = OZ.DOM.elm("div", {"class":"commands"});
	
	var i = OZ.DOM.elm("input", {type:"button", value:"Pick (,)"});
	div.appendChild(i);
	OZ.Event.add(i, "click", function() { RPG.UI._handleCode(44, 0); });

	return div;
}

/**
 * Add keyboard control
 */
RPG.UI.enableKeyboard = function() {
	OZ.Event.add(document, "keypress", this.bind(this._keyPress));
}

RPG.UI._defineCommand = function(charCodes, keyCodes, what) {
	this._commands.push({
		charCodes: charCodes,
		keyCodes: keyCodes,
		what: this.bind(what)
	});
}

/**
 * Process a given key
 * @param {int} keyCode
 * @param {int} charCode
 * @returns {bool} was there any action performed?
 */
RPG.UI._handleCode = function(charCode, keyCode) {
	for (var i=0;i<this._commands.length;i++) {
		var c = this._commands[i];
		if (c.keyCodes.indexOf(keyCode) != -1 || c.charCodes.indexOf(charCode) != -1) {
			c.what();
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

/**
 * Create correct "move" action
 * @param {int} dx
 * @param {int} dy
 */
RPG.UI._move = function(dx, dy) {
	var pc = RPG.World.getPC();
	var map = RPG.World.getMap();
	var coords = pc.getCoords().clone();
	coords.x += dx;
	coords.y += dy;
	
	/* invalid move */
	if (!map.isValid(coords)) { return; } 
	
	/* too far */
	if (pc.getCoords().distance(coords) > 1) { return; }

	/* being there? */
	var b = map.at(coords).getBeing();
	if (b) {
		this.action(RPG.Actions.Attack, b);
		return;
	} 
	
	/* closed door there? */
	var f = map.at(coords).getFeature();
	if (f && f instanceof RPG.Features.Door && f.isClosed()) {
		this.action(RPG.Actions.Open, coords);
		return;
	}
	
	/* can we move there? */
	if (map.isFree(coords)) {
		this.action(RPG.Actions.Move, coords);
		return;
	}
}
