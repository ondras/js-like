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
	var charCode = e.charCode || e.keyCode; /* opera puts charcode in keycode */
	var list = RPG.UI.Button._buttons.clone();
	for (var i=0;i<list.length;i++) {
		list[i][0]._key(e, charCode, -1);
	}
}

/**
 * Static keydown handler
 */
RPG.UI.Button._keyDown = function(e) {
	var keyCode = e.keyCode;
	var list = RPG.UI.Button._buttons.clone();
	for (var i=0;i<list.length;i++) {
		list[i][0]._key(e, -1, keyCode);
	}
}

/**
 * Static click handler
 */
RPG.UI.Button._click = function(e) {
	var target = OZ.Event.target(e);
	for (var i=0;i<RPG.UI.Button._buttons.length;i++) {
		var item = RPG.UI.Button._buttons[i];
		if (item[1] == target) {
			item[0]._click(e);
			return; 
		}
	}
}

RPG.UI.Button.prototype.init = function(label, callback) {
	this._charCodes = [];
	this._keyCodes = [];
	this._ctrlKey = false;
	this._altKey = false;
	this._label = null;
	this._callback = callback;
	this._char = null;
	this._input = OZ.DOM.elm("input", {type:"button"});
	
	this.constructor._buttons.push([this, this._input]);
	this.setLabel(label);
}

RPG.UI.Button.prototype.destroy = function() {
	var all = this.constructor._buttons;
	var index = -1;
	for (var i=0;i<all.length;i++) {
		var item = all[i];
		if (item[0] == this) { 
			index = i;
			break;
		}
	}
	this.constructor._buttons.splice(index, 1);
}

RPG.UI.Button.prototype.getInput = function() {
	return this._input;
}

RPG.UI.Button.prototype.setLabel = function(label) {
	this._label = label || "";
	this._setLabel();
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
	this._charCodes = [];
	this.addCharCode(ch.charCodeAt(0));
	this._setLabel();
	return this;
}

RPG.UI.Button.prototype.setChars = function(s) {
	this._char = s[0];
	this._charCodes = [];
	for(var i=0;i<s.length;i++)
	{
		this.addCharCode(s.charCodeAt(i));
	}
	this._setLabel();
	return this;
}

RPG.UI.Button.prototype.enable = function() {
	this._input.disabled = false;
}

RPG.UI.Button.prototype.disable = function() {
	this._input.disabled = true;
}

RPG.UI.Button.prototype._key = function(e, charCode, keyCode) {
	if (this._input.disabled) { return; }
	if (e.ctrlKey != this._ctrlKey) { return false; }
	if (e.altKey != this._altKey) { return false; }
	if (this._charCodes.indexOf(charCode) != -1 || this._keyCodes.indexOf(keyCode) != -1) {
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
OZ.Event.add(document, "keydown", RPG.UI.Button._keyDown);
