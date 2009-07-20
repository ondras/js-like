/**
 * @class Textual description area
 */
RPG.UI.TextBuffer = OZ.Class();
RPG.UI.TextBuffer.prototype.init = function(container) {
	this._dom = {
		container: container,
		textarea: OZ.DOM.elm("textarea")
	}
	this._dom.textarea.value = "";
	this._dom.textarea.readOnly = true;
	container.appendChild(this._dom.textarea);
	
	this._backlog = "";
	this._lastMessage = "";
	this._repeat = 0;
}

RPG.UI.TextBuffer.prototype.reset = function() {
	this._backlog = "";
	this._lastMessage = "";
	this._repeat = 0;
	this._dom.textarea.value = "";
}

RPG.UI.TextBuffer.prototype.message = function(str) {
	this._dom.textarea.value += str+" ";

	if (str == this._lastMessage) {
		this._repeat++;
	} else {
		this._flushBacklog();
		this._repeat = 0;
		this._lastMessage = str;
	}
	
}

RPG.UI.TextBuffer.prototype.showBacklog = function() {
	OZ.DOM.addClass(this._dom.container, "backlog");
	this._flushBacklog();
	this._dom.textarea.value = this._backlog;
	this._dom.textarea.scrollTop = this._dom.textarea.scrollHeight;
}

RPG.UI.TextBuffer.prototype.hideBacklog = function() {
	OZ.DOM.removeClass(this._dom.container, "backlog");
	this._dom.textarea.value = this._lastMessage;
}

RPG.UI.TextBuffer.prototype.clear = function() {
	this._dom.textarea.value = "";
	if (this._backlog.length && this._backlog.charAt(this._backlog.length-1) != "\n") {
		this._backlog += "\n";
	}
}

RPG.UI.TextBuffer.prototype._flushBacklog = function() {
	if (this._lastMessage) { 
		this._backlog += this._lastMessage + " "; 
		this._lastMessage = "";
	}
	if (this._repeat > 1) { 
		this._backlog += "("+this._repeat+"x)\n"; 
	}
}
