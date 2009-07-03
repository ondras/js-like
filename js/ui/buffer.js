/**
 * @class Textual description area
 */
RPG.UI.TextBuffer = OZ.Class();
RPG.UI.TextBuffer.prototype.init = function(textarea) {
	this._dom = {
		textarea: textarea
	}
	this._dom.textarea.value = "";
}

RPG.UI.TextBuffer.prototype.message = function(str) {
	this._dom.textarea.value += str+" ";
}

RPG.UI.TextBuffer.prototype.clear = function() {
	this._dom.textarea.value = "";
}
