/**
 * @namespace
 */
RPG.UI = {
	Buffer: null,
	Map: null,
	_locked: false,
	_inputs: []
};

/**
 * Static version of bind
 */
RPG.UI.bind = OZ.Class().prototype.bind;

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
			"Up left": 36,
			"Up": 38,
			"Up right": 33
		},
		{
			"Left": 37,
			"Wait": 190,
			"Right": 39
		},
		{
			"Down left": 35,
			"Down": 40,
			"Down right": 34
		}
	];
	
	var gen = function(code) {
		return function() {
			return RPG.UI._handleCode(code);
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
 * Add keyboard control
 */
RPG.UI.enableKeyboard = function() {
	OZ.Event.add(document, "keydown", this.bind(this._keyDown));
}

/**
 * Process a given keyCode
 * @param {int} keyCode
 * @returns {bool} was there any action performed?
 */
RPG.UI._handleCode = function(keyCode) {
	switch (keyCode) {
		case 105:
		case 33: 
			this._move(1, -1); 
		break;
		
		case 99:
		case 34: 
			this._move(1, 1); 
		break;

		case 103:
		case 36: 
			this._move(-1, -1); 
		break;
		
		case 97:
		case 35: 
			this._move(-1, 1); 
		break;
		
		case 100:
		case 37: 
			this._move(-1, 0); 
		break;
		
		case 104:
		case 38: 
			this._move(0, -1); 
		break;

		case 102:
		case 39: 
			this._move(1, 0); 
		break;
		
		case 98:
		case 40: 
			this._move(0, 1); 
		break;
		
		case 12: 
		case 101:
		case 190: 
			this.action(RPG.Actions.Wait);
		break;
		
		default: 
			return false; 
		break;
	}
	return true;
}

/**
 * Keydown handler
 * @param {event} e
 */
RPG.UI._keyDown = function(e) {
	if (this._handleCode(e.keyCode)) {
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
	var door = map.at(coords).getDoor();
	if (door && door.isClosed()) {
		this.action(RPG.Actions.Open, coords);
		return;
	}
	
	/* can we move there? */
	if (map.isFree(coords)) {
		this.action(RPG.Actions.Move, coords);
		return;
	}
}
