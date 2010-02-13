/**
 * @class Save / Load dialog
 */
RPG.UI.SaveLoad = OZ.Class();

RPG.UI.SaveLoad.prototype.init = function(mode, callback) {
	this._dom = {
		select: OZ.DOM.elm("select"),
		status: OZ.DOM.elm("textarea", {width:"80%", rows:"5", readOnly:true}),
		ta: OZ.DOM.elm("textarea", {width:"80%", rows:"5"})
	};
	
	this._mode = mode;
	if (mode == RPG.SAVELOAD_SAVE) { this._dom.ta.readOnly = true; }
	
	this.CLIPBOARD	= "0";
	this.LOCAL		= "1";
	this.REMOTE		= "2";
	
	this._method = -1;
	this._methods = {};
	this._methods[this.CLIPBOARD] = {
		short: "Clipboard",
		long: "Use clipboard to (manually) transfer saved game data to/from a file of your choice. " +
			"Game state is stored on user's computer. "
	};
		
	this._methods[this.LOCAL] = {
		short: "Local storage",
		long: "Saved game data is stored inside a browser. Your browser must support the HTML5 'localStorage' feature. " +
			"Game state is stored on user's computer. "
	};

	this._methods[this.REMOTE] = {
		short: "Remote database",
		long: "Saved game data is transferred to/from a remote database server via AJAX. " +
			"Game state is stored on remote machine. "
	};
	
	this._titles = {};
	this._titles[RPG.SAVELOAD_SAVE] = "Save a game";
	this._titles[RPG.SAVELOAD_LOAD] = "Load a saved game";
	
	for (var p in this._methods) {
		var o = OZ.DOM.elm("option");
		var item = this._methods[p];
		o.value = p;
		o.innerHTML = item.short;
		item.option = o;
		item.enabled = true;
	}
	
	this._callback = callback;
	this._buttons = [];
	this._ec = [];
	this._ec.push(OZ.Event.add(this._dom.select, "change", this._change.bind(this)));
	this._testMethods();
}

/**
 * Create the dialog
 */
RPG.UI.SaveLoad.prototype._build = function() {
	this._dom.container = OZ.DOM.elm("div");

	var go = new RPG.UI.Button("Go", this._go.bind(this));
	if (this._mode == RPG.SAVELOAD_SAVE) {
		go.setChar("S");
	} else {
		go.setChar("L");
	}
	this._buttons.push(go);
	
	var close = new RPG.UI.Button("Close", this._close.bind(this));
	close.setChar("z");
	this._buttons.push(close);

	var d = OZ.DOM.elm("div", {innerHTML: "<strong>Method: </strong>"});
	d.appendChild(this._dom.select);
	d.appendChild(go.getInput());
	this._dom.container.appendChild(d);
	
	var d = OZ.DOM.elm("div");
	d.appendChild(this._dom.status);
	d.appendChild(this._dom.ta);
	this._dom.container.appendChild(d);
	
	this._dom.container.appendChild(close.getInput());
	
	for (var p in this._methods) {
		var item = this._methods[p];
		item.option.disabled = !item.enabled;
		this._dom.select.appendChild(item.option);
	}
	this._change();
	RPG.UI.showDialog(this._dom.container, this._titles[this._mode]);
}

/**
 * Check individual I/O method availability
 **/
RPG.UI.SaveLoad.prototype._testMethods = function() {
	if (!window.localStorage) { this._methods[this.LOCAL].enabled = false; }
	
	var response = function(data, status, headers) {
		if (status != 200) { this._methods[this.REMOTE].enabled = false; }
		this._build();
	}
	
	try {
		OZ.Request("ajax/?action=test", response.bind(this));
	} catch (e) {
		response.call(this, "", 500, {});
	}

}

/**
 * User clicked the button, do what we must
 */
RPG.UI.SaveLoad.prototype._go = function() {
	this._method = this._dom.select.value;
	this._dom.status.value = "";
	
	if (this._mode == RPG.SAVELOAD_SAVE) {
		RPG.Game.save(this._readyStateChange.bind(this));
	} else {
		this._retrieveData();
	}
}

/**
 * Save/load ready state change
 * @param {int} state One of RPG.SAVELOAD_ constants
 * @param {text} data Relevant data
 */
RPG.UI.SaveLoad.prototype._readyStateChange = function(state, data) {
	switch (state) {
		case RPG.SAVELOAD_PROCESS:
			this._log(data);
		break;
		case RPG.SAVELOAD_FAILURE:
			this._log("FAILURE: " + data);
		break;
		case RPG.SAVELOAD_DONE:
			if (this._mode == RPG.SAVELOAD_SAVE) {
				this._dataAvailable(data);
			} else {
				this._close();
			}
		break;
	}
}

/**
 * Data for saving/loading available
 */
RPG.UI.SaveLoad.prototype._dataAvailable = function(data) {
	switch (this._method) {
		case this.CLIPBOARD:
			this._dom.ta.style.display = "";
			this._dom.ta.value = data;
			this._log("SAVED, now copy the data from the textarea below and save it to a file.");
		break;
		
		case this.LOCAL:
			var name = prompt("Please name your save game");
			if (!name) { return; }

			var key = "";
			while (!key) {
				key = "js-like-" + name;
				if (localStorage.getItem(key)) {
					if (!confirm("This name already exists, overwrite?")) { key = "";  }
				}
			}
			try {
				localStorage.setItem(key, data);
				this._log("SAVED to local storage as '" + name + "'.");
			} catch(e) {
				this._log("FAILURE: "+e);
			}
		break;
		
		case this.REMOTE:
			this._log("Remote storage not yet implemented");
		break;
	}
}

/**
 * Get saved data and feed them to the Game
 */
RPG.UI.SaveLoad.prototype._retrieveData = function() {
	var done = function(data) { RPG.Game.load(data, this._readyStateChange.bind(this)); };
	done = done.bind(this);

	switch (this._method) {
		case this.CLIPBOARD:
			if (!this._dom.ta.value) {
				this._log("Please paste saved game data into a textarea below and try again :)");
				return;
			}
			done(this._dom.ta.value);
		break;
		
		case this.LOCAL:
			var name = prompt("What is the name of your saved game?");
			if (!name) { return; }
			var key = "js-like-" + name;
			var data = localStorage.getItem(key);
			if (data == null) {
				this._log("There is no such saved game.");
				return;
			}
			done(data);
		break;
		
		case this.REMOTE:
			this._log("Remote storage not yet implemented");
		break;
	}
}

/**
 * Log a text line to our textarea
 */
RPG.UI.SaveLoad.prototype._log = function(text) {
	this._dom.status.value += text + "\n";
}

/**
 * Onchange event of selectbox
 */
RPG.UI.SaveLoad.prototype._change = function(e) {
	var index = this._dom.select.value;
	this._dom.status.value = this._methods[index].long;
	this._dom.ta.style.display = (index == this.CLIPBOARD ? "" : "none");
}

/**
 * Cancel the dialog
 */
RPG.UI.SaveLoad.prototype._close = function() {
	this._ec.forEach(OZ.Event.remove);
	for (var i=0;i<this._buttons.length;i++) { this._buttons[i].destroy(); }
	this._buttons = [];
	RPG.UI.hideDialog();
	this._callback();
}
