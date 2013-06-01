RPG.UI.buffer = null;			/* text message display */
RPG.UI.map = null;				/* map instance */
RPG.UI.status = null;			/* statusbar */
RPG.UI.sound = null;			/* soundmanager */
RPG.UI.dialog = null;			/* chat */
RPG.UI.font = "inconsolata";	/* chat */

RPG.UI._commands = [];	/* avail commands */
RPG.UI._pending = null; /* command awaiting specification */
RPG.UI._dimmer = null;	/* dimmer element */
RPG.UI._dialog = null;	/* current dialog */
RPG.UI._mode = -1;		/* current UI mode */
RPG.UI._target = null;	/* targetting coords */

RPG.UI.alert = function(text, title) {
	var engine = RPG.Game.getEngine();
	var div = OZ.DOM.elm("div", {innerHTML:"<p>"+text+"</p>"});
	
	var b = new RPG.UI.Button("Okay", function() {
		b.destroy();
		RPG.UI.hideDialog();
		engine.unlock();
	});
	b.setChars("z\u001B");
	
	div.appendChild(b.getInput());

	this.showDialog(div, title);
	b.getInput().focus();
	engine.lock();
}

RPG.UI.confirmS = function(text) {
	var result = confirm(text);
	window.focus();
	return result;
}

RPG.UI.confirm = function(text, title, yesCallback, noCallback) {
	var engine = RPG.Game.getEngine();
	var div = OZ.DOM.elm("div", {innerHTML:"<p>"+text+"</p>"});
	
	var done = function() {
		yes.destroy();
		no.destroy();
		RPG.UI.hideDialog();
	}
	var yes = new RPG.UI.Button("Yes", function() {
		done();
		if (yesCallback) { yesCallback(); }
		engine.unlock();
	});
	yes.setChar("y");
	
	var no = new RPG.UI.Button("No", function() {
		done();
		if (noCallback) { noCallback(); }
		engine.unlock();
	});
	no.setChar("n");

	div.appendChild(yes.getInput());
	div.appendChild(no.getInput());
	
	this.showDialog(div, title);
	engine.lock();
}

RPG.UI.setMode = function(mode, command, data) {
	if (this._mode == mode) { return; }
	this._mode = mode;
	switch (mode) {
		case RPG.UI_NORMAL:
			this._pending = null;
			this._adjustButtons({commands:true, cancel:false, dir:true});
		break;
		case RPG.UI_LOCKED:
			this._adjustButtons({commands:false, cancel:false, dir:false});
		break;
		case RPG.UI_WAIT_DIRECTION:
			this._pending = command;
			this.buffer.message(data+": select direction...");
			this._adjustButtons({commands:false, cancel:true, dir:true, pending:false});
		break;
		case RPG.UI_WAIT_TARGET:
			this._pending = command;
			this._target = RPG.Game.pc.getCoords().clone();
			this.buffer.message(data+": select target...");
			this._adjustButtons({commands:false, cancel:true, dir:true, pending:true});
		break;
	}
}

RPG.UI.refocus = function() {
	this.map.setFocus(RPG.Game.pc.getCoords());
}

/**
 * This command wants to be executed
 */
RPG.UI.command = function(command) {
	if (this._mode != RPG.UI_WAIT_TARGET) { 
		this.buffer.clear(); 
	} else if (command instanceof RPG.UI.Command.Cancel || command == this._pending) {
		this.buffer.clear(); 
	}

	/* no sry */
	if (this._mode == RPG.UI_LOCKED) { return; } 
	
	if (command instanceof RPG.UI.Command.Cancel) { 
		/* cancel */
		if (this._pending) { this._pending.cancel(); }
		command.exec();
		return;
	} 
	
	/* non-dir when direction is needed */
	if (this._mode == RPG.UI_WAIT_DIRECTION && !(command instanceof RPG.UI.Command.Direction)) { return; } 
	
	/* targetting mode */
	if (this._mode == RPG.UI_WAIT_TARGET) {
		if (command instanceof RPG.UI.Command.Direction) {
			/* adjust target */
			var test = this._target.clone().plus(RPG.DIR[command.getDir()]);
			var map = RPG.Game.pc.getMap();
			if (!map.isValid(test)) { return; }
			this._target = test;
			this._pending.notify(this._target);
			RPG.UI.map.setFocus(this._target);
		} else if (command == this._pending) {
			/* targetting finished, launch */
			this._pending.exec(this._target);
		}
		return; 
	}
	
	if (this._pending) {
		this._pending.exec(command);
	} else {
		command.exec();
	}
}

RPG.UI.build = function() {
	var ta = OZ.$("buffer");
	this.buffer = new RPG.UI.TextBuffer(ta);

	var keypad = OZ.$("keypad");
	new RPG.UI.Command.Table(keypad);
	keypad.appendChild(new RPG.UI.Command.Cancel().getButton().getInput());
	
	var status = OZ.$("status");
	this.status = new RPG.UI.Status(status);
	
	this.dialog = new RPG.UI.Dialog();
	
	var c = OZ.$("commands");
	
	var d = OZ.DOM.elm("div", {innerHTML:"Movement: "});
	c.appendChild(d);
	d.appendChild(new RPG.UI.Command.Autowalk().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Ascend().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Descend().getButton().getInput());
	d.appendChild(new RPG.UI.Command.SwitchPosition().getButton().getInput());
	
	var d = OZ.DOM.elm("div", {innerHTML:"Interaction: "});
	c.appendChild(d);
	d.appendChild(new RPG.UI.Command.Open().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Close().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Kick().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Chat().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Search().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Trap().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Eat().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Drink().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Cast().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Flirt().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Read().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Launch().getButton().getInput());

	var d = OZ.DOM.elm("div", {innerHTML:"Item management: "});
	c.appendChild(d);
	d.appendChild(new RPG.UI.Command.Pick().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Drop().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Inventory().getButton().getInput());

	var d = OZ.DOM.elm("div", {innerHTML:"Information: "});
	c.appendChild(d);
	d.appendChild(new RPG.UI.Command.Look().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Backlog().getButton().getInput());
	d.appendChild(new RPG.UI.Command.WeaponStats().getButton().getInput());
	d.appendChild(new RPG.UI.Command.KickStats().getButton().getInput());
	d.appendChild(new RPG.UI.Command.KillStats().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Quests().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Debts().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Attributes().getButton().getInput());

	var d = OZ.DOM.elm("div", {innerHTML:"Miscellaneous: "});
	c.appendChild(d);
	if (this.sound.isSupported()) {
		d.appendChild(new RPG.UI.Command.Mute().getButton().getInput());
	}
	d.appendChild(new RPG.UI.Command.Save().getButton().getInput());
	d.appendChild(new RPG.UI.Command.Load().getButton().getInput());
	var toggle = new RPG.UI.Command.ToggleButtons();
	d.appendChild(toggle.getButton().getInput());
	
	var misc = OZ.$("misc");

	var li = OZ.DOM.elm("li");
	var link = OZ.DOM.elm("a", {href:"#", innerHTML:"<strong>Help (?)</strong>"});
	OZ.DOM.append([misc, li], [li, link]);
	OZ.Event.add(link, "click", function(e) {
		OZ.Event.prevent(e);
		link.blur();
		toggle.exec();
	});

	new RPG.UI.Mapswitch(misc);
}

RPG.UI.showDialog = function(data, title) {
	this.setMode(RPG.UI_LOCKED);
	this._dim();
	if (!this._dialog) {
		this._dialog = OZ.DOM.elm("div", {"class":"dialog", position:"absolute"});
	}
	OZ.DOM.clear(this._dialog);
	document.body.appendChild(this._dialog);
	var h = OZ.DOM.elm("h1", {innerHTML:title});
	this._dialog.appendChild(h);
	this._dialog.appendChild(data);
	this.syncDialog();
}

RPG.UI.syncDialog = function() {
	var d = this._dimmer;
	if (!d) { return; }
	var c = this._dialog;


	d.style.width = "0px";
	d.style.height = "0px";
	c.style.left = "0px";
	c.style.top = "0px";

	var port = OZ.DOM.win();
	var scroll = OZ.DOM.scroll();

	d.style.left = scroll[0]+"px";
	d.style.top = scroll[1]+"px";
	d.style.width = port[0]+"px";
	d.style.height = port[1]+"px";
	
	var w = c.offsetWidth;
	var h = c.offsetHeight;
	c.style.left = (scroll[0] + Math.round((port[0]-w)/2)) + "px";
	c.style.top = (scroll[1] + Math.round((port[1]-h)/2)) + "px";
}

RPG.UI.hideDialog = function() {
	this._dialog.parentNode.removeChild(this._dialog);
	this._undim();
	this.setMode(RPG.UI_NORMAL);
}

/**
 * @param {bool} [data.commands]
 * @param {bool} [data.cancel]
 * @param {bool} [data.dir]
 * @param {bool} [data.pending]
 */
RPG.UI._adjustButtons = function(data) {
	for (var i=0;i<this._commands.length;i++) {
		var c = this._commands[i];
		var b = c.getButton().getInput();
		b.blur();
		if (c instanceof RPG.UI.Command.Direction) {
			/* directional */
			b.disabled = !data.dir;
		} else if (c instanceof RPG.UI.Command.Cancel) {
			/* cancel button */
			b.disabled = !data.cancel;
		} else if (c == this._pending) {
			/* pending button */
			b.disabled = !data.pending;
		} else {
			/* standard buttons */
			b.disabled = !data.commands;
		}
	}
}

/**
 * Dim the UI - because something "modal" will be shown
 */ 
RPG.UI._dim = function() {
	if (this._dimmer) { return; }
	var div = OZ.DOM.elm("div", {position:"absolute", backgroundColor:"black", opacity:0.5});
	document.body.appendChild(div);
	this._dimmer = div;
	
}

/**
 * Undim the UI
 */ 
RPG.UI._undim = function() {
	if (!this._dimmer) { return; }
	this._dimmer.parentNode.removeChild(this._dimmer);
	this._dimmer = null;
}

OZ.Event.add(window, "scroll", RPG.UI.syncDialog.bind(RPG.UI));
OZ.Event.add(window, "resize", RPG.UI.syncDialog.bind(RPG.UI));
