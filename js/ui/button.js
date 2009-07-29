/**
 * @class Basic button
 */
RPG.UI.Button = OZ.Class();

/**
 * Static instance counter
 */
RPG.UI.Button._buttons = [];

/**
 * Static keypress handler
 */
RPG.UI.Button._keyPress = function(e) {
	for (var i=0;i<RPG.UI.Button._buttons.length;i++) {
		RPG.UI.Button._buttons[i]._keyPress(e);
	}
}

/**
 * Static click handler
 */
RPG.UI.Button._click = function(e) {
	var target = OZ.Event.target(e);
	for (var i=0;i<RPG.UI.Button._buttons.length;i++) {
		var input = RPG.UI.Button._buttons[i].getInput();
		if (input == target) {
			RPG.UI.Button._buttons[i]._click(e);
		}
	}
}

RPG.UI.Button.prototype.init = function(label, callback) {
	this.constructor._buttons.push(this);
	this._charCodes = [];
	this._keyCodes = [];
	this._ctrlKey = false;
	this._altKey = false;
	this._label = label || "";
	this._callback = callback;
	this._char = null;
	this._input = OZ.DOM.elm("input", {type:"button"});

	this._setLabel();
}

RPG.UI.Button.prototype.destroy = function() {
	var all = this.constructor._buttons;
	var index = all.indexOf(this);
	this.constructor._buttons.splice(index, 1);
}

RPG.UI.Button.prototype.getInput = function() {
	return this._input;
}

RPG.UI.Button.prototype._setLabel = function() {
	var l = this._label;
	
	if (this._char) {
		if (this._label) { l += " ("; }
		if (this._ctrlKey) { l += "^"; }
		if (this._altKey) { l += "m-"; }
		l += this._char;
		if (this._label) { l += ")"; }
	}
	
	this._input.value = l;
}

RPG.UI.Button.prototype.setCtrl = function() {
	this._ctrlKey = true;
	return this;
}

RPG.UI.Button.prototype.setAlt = function() {
	this._altKey = true;
	return this;
}

RPG.UI.Button.prototype.addKeyCode = function(keyCode) {
	this._keyCodes.push(keyCode);
	return this;
}

RPG.UI.Button.prototype.addCharCode = function(charCode) {
	this._charCodes.push(charCode);
	return this;
}

RPG.UI.Button.prototype.setChar = function(ch) {
	this._char = ch;
	this.addCharCode(ch.charCodeAt(0));
	this._setLabel();
	return this;
}

RPG.UI.Button.prototype.enable = function() {
	this._input.disabled = false;
}

RPG.UI.Button.prototype.disable = function() {
	this._input.disabled = true;
}

RPG.UI.Button.prototype._keyPress = function(e) {
	if (this._input.disabled) { return; }
	if (e.ctrlKey != this._ctrlKey) { return false; }
	if (e.altKey != this._altKey) { return false; }
	if (this._charCodes.indexOf(e.charCode) != -1 || this._keyCodes.indexOf(e.keyCode) != -1) {
		OZ.Event.prevent(e);
		this._callback(this);
	}
}

RPG.UI.Button.prototype._click = function(e) {
	if (this._input.disabled) { return; }
	this._callback(this);
}

OZ.Event.add(document, "click", RPG.UI.Button._click);
OZ.Event.add(document, "keypress", RPG.UI.Button._keyPress);
