/**
 * @class Textual description area
 */
RPG.UI.TextBuffer = OZ.Class();
RPG.UI.TextBuffer.prototype.init = function(container) {
	this._dom = {
		container: container,
		textarea: OZ.DOM.elm("textarea"),
		backlog: OZ.DOM.elm("textarea")
	}
	this._dom.textarea.value = "";
	this._dom.textarea.readOnly = true;
	this._dom.backlog.value = "";
	this._dom.backlog.readOnly = true;
	container.appendChild(this._dom.textarea);
	container.appendChild(this._dom.backlog);
	this.hideBacklog();
	
	this._backlog = [];
	this._lastMessage = "";
	this._repeat = 0;
}

RPG.UI.TextBuffer.prototype.message = function(str) {
	this._dom.textarea.value += str+" ";

	if (str == this._lastMessage) {
		this._repeat++;
		this._backlog.pop();
		this._backlog.push(this._lastMessage + " (" + (this._repeat+1) + "x)");
	} else {
		this._backlog.push(str);
		this._repeat = 0;
		this._lastMessage = str;
	}
	
	if (this._dom.backlog.length > 500) { this._dom.backlog.shift(); }
	this._dom.backlog.value = this._backlog.join("\n");
	this._dom.backlog.scrollTop = this._dom.backlog.scrollHeight;	
}

RPG.UI.TextBuffer.prototype.important = function(str) {
	this.message(str);
	RPG.UI.alert(str, "Important message");
}

RPG.UI.TextBuffer.prototype.showBacklog = function() {
	OZ.DOM.addClass(this._dom.container, "backlog");
	this._dom.textarea.style.display = "none";
	this._dom.backlog.style.display = "";
	this._dom.backlog.scrollTop = this._dom.backlog.scrollHeight;
}

RPG.UI.TextBuffer.prototype.hideBacklog = function() {
	OZ.DOM.removeClass(this._dom.container, "backlog");
	this._dom.textarea.style.display = "";
	this._dom.backlog.style.display = "none";
}

RPG.UI.TextBuffer.prototype.clear = function() {
	this._dom.textarea.value = "";
}
