/**
 * @class Complex dialogue interface
 */
RPG.UI.Dialog = OZ.Class();

RPG.UI.Dialog.prototype.init = function() {
	this._dom = {
		container: OZ.DOM.elm("div", {className:"chat"}),
		content: OZ.DOM.elm("div"),
		options: OZ.DOM.elm("ul")
	};
	this._buttons = [];
	this._dialog = null;
	this._buffer = [];
	this._links = [];
	
	var close = new RPG.UI.Button("Close", this._close.bind(this));
	close.setChars("z\u001B");
	close.disable();
	this._buttons.push(close);

	this._dom.container.appendChild(this._dom.content);
	this._dom.container.appendChild(close.getInput());
	
	OZ.Event.add(this._dom.content, "click", this._click.bind(this));
}

RPG.UI.Dialog.prototype.show = function(dialog, being) {
	var pc = RPG.Game.pc;
	
	var text = dialog.getDialogText(pc);
	var options = dialog.getDialogOptions(pc);

	if (!options.length && !(text instanceof Array)) { /* simple line in case dialog is not array and there are no options */
		var sound = dialog.getDialogSound(pc);
		if (sound) { RPG.UI.sound.play(sound); }
		RPG.UI.buffer.message('"' + text + '"');
		return RPG.ACTION_TIME;
	}
	
	this._dialog = dialog;
	
	var port = OZ.DOM.win();
	this._dom.container.style.width = Math.round(port[0]/2) + "px";

	var title = RPG.Misc.format("%D", being);
	RPG.UI.showDialog(this._dom.container, title);

	this._buffer = [];
	for (var i=0;i<this._buttons.length;i++) { this._buttons[i].enable(); }
	OZ.DOM.clear(this._dom.content);
	this._redraw();
	return RPG.ACTION_DEFER;
}

RPG.UI.Dialog.prototype._click = function(e) {
	var elm = OZ.Event.target(e);
	var index = this._links.indexOf(elm);
	if (index == -1) { return; }
	OZ.Event.prevent(e);
	
	OZ.DOM.clear(this._dom.options);

	if (this._buffer.length) { /* continue */
		this._redraw();
	} else { /* answer picked */
		var cont = this._dialog.advanceDialog(index, RPG.Game.pc);
		if (cont) { this._redraw(); }
	}
}

RPG.UI.Dialog.prototype._redraw = function() {
	var pc = RPG.Game.pc;
	
	if (!this._buffer.length) {
		var text = this._dialog.getDialogText(pc);
		if (text instanceof Array) {
			this._buffer = text;
		} else {
			this._buffer.push(text);
		}
	}
	
	var str = this._buffer.shift(); /* pick first text */
	var p = OZ.DOM.elm("p");
	p.innerHTML = str;
	this._dom.content.appendChild(p);
	
	if (this._buffer.length) { /* "continue" */
		this._buildOptions(["Continue"]);
	} else { /* any options ? */
		var answers = this._dialog.getDialogOptions(pc);
		if (answers.length) { 
			this._buildOptions(answers); 
		} else {
			this._dialog.advanceDialog(-1, pc);
		}
	}

	this._dom.content.scrollTop = this._dom.content.scrollHeight; /* scroll to bottom */
}

RPG.UI.Dialog.prototype._buildOptions = function(options) {
	this._links = [];
	var ul = this._dom.options;
	OZ.DOM.clear(ul);
	for (var i=0;i<options.length;i++) {
		var li = OZ.DOM.elm("li");
		var a = OZ.DOM.elm("a", {href:"#", innerHTML:options[i]});
		OZ.DOM.append([li, a], [ul, li]);
		this._links.push(a);
	}
	this._dom.content.appendChild(ul);
	
	this._links[0].focus();
}

RPG.UI.Dialog.prototype._close = function() {
	for (var i=0;i<this._buttons.length;i++) { this._buttons[i].disable(); }
	RPG.UI.hideDialog();
	RPG.Game.getEngine().actionResult(RPG.ACTION_TIME);
}
