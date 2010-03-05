/**
 * @class Complex dialogue interface
 */
RPG.UI.ComplexChat = OZ.Class();

RPG.UI.ComplexChat.prototype.init = function() {
	this._dom = {
		container: OZ.DOM.elm("div", {className:"chat"}),
		content: OZ.DOM.elm("div"),
		options: OZ.DOM.elm("ul")
	};
	this._buttons = [];
	this._chat = null;
	this._buffer = [];
	this._links = [];
	
	var close = new RPG.UI.Button("Close", this._close.bind(this));
	close.setChar("z");
	this._buttons.push(close);
	close.disable();

	this._dom.container.appendChild(this._dom.content);
	this._dom.container.appendChild(close.getInput());
	
	OZ.Event.add(this._dom.content, "click", this._click.bind(this));
}

RPG.UI.ComplexChat.prototype.show = function(chat, being) {
	RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
	
	var port = OZ.DOM.win();
	this._dom.container.style.width = Math.round(port[0]/2) + "px";

	var title = RPG.Misc.format("%D", being);
	RPG.UI.showDialog(this._dom.container, title);

	this._chat = chat;
	this._buffer = [];
	for (var i=0;i<this._buttons.length;i++) { this._buttons[i].enable(); }
	OZ.DOM.clear(this._dom.content);
	this._redraw();
}

RPG.UI.ComplexChat.prototype._click = function(e) {
	var elm = OZ.Event.target(e);
	var index = this._links.indexOf(elm);
	if (index == -1) { return; }
	OZ.Event.prevent(e);
	
	OZ.DOM.clear(this._dom.options);

	if (this._buffer.length) { /* continue */
		this._redraw();
	} else { /* answer picked */
		var cont = this._chat.advance(index);
		if (cont) { this._redraw(); }
	}
}

RPG.UI.ComplexChat.prototype._redraw = function() {
	if (!this._buffer.length) {
		var text = this._chat.getText();
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
		var answers = this._chat.getAnswers();
		if (answers.length) { 
			this._buildOptions(answers); 
		} else {
			this._chat.advance();
		}
	}

	this._dom.content.scrollTop = this._dom.content.scrollHeight; /* scroll to bottom */
}

RPG.UI.ComplexChat.prototype._buildOptions = function(options) {
	this._links = [];
	var ul = this._dom.options;
	for (var i=0;i<options.length;i++) {
		var li = OZ.DOM.elm("li");
		var a = OZ.DOM.elm("a", {href:"#", innerHTML:options[i]});
		OZ.DOM.append([li, a], [ul, li]);
		this._links.push(a);
	}
	this._dom.content.appendChild(ul);
	
	this._links[0].focus();
}

RPG.UI.ComplexChat.prototype._close = function() {
	for (var i=0;i<this._buttons.length;i++) { this._buttons[i].disable(); }
	RPG.UI.hideDialog();
	RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
	RPG.Game.getEngine().actionResult(RPG.ACTION_TIME);
}
