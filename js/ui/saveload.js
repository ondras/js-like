/**
 * @class Save / Load dialog
 */
RPG.UI.SaveLoad = OZ.Class();

RPG.UI.SaveLoad.prototype.init = function() {
	this.CLIPBOARD	= "0";
	this.LOCAL		= "1";
	this.REMOTE		= "2";
	this._method = this.CLIPBOARD;
	this._methods = {};
	this._prefix = "js-like-";
	this._savedNames = {};
	this._titles = {};
	this._buttons = [];
	this._mode = null;

	this._dom = {
		select: OZ.DOM.elm("select"),
		status: OZ.DOM.elm("textarea", {width:"80%", rows:"5", readOnly:true}),
		ta: OZ.DOM.elm("textarea", {width:"80%", rows:"5"}),
		savedSelect: OZ.DOM.elm("select"),
		saved: OZ.DOM.elm("div")
	};
	
	this._savedNames[this.LOCAL] = {};
	this._savedNames[this.REMOTE] = {};

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
	
	OZ.Event.add(this._dom.select, "change", this._change.bind(this));
	this._build();
	for (var i=0;i<this._buttons.length;i++) { this._buttons[i].disable(); }
}

RPG.UI.SaveLoad.prototype.show = function(mode) {
	this._mode = mode;
	for (var i=0;i<this._buttons.length;i++) { this._buttons[i].enable(); }
	
	this._dom.ta.readOnly = (mode == RPG.SAVELOAD_SAVE);
	
	this._savedNames[this.LOCAL] = {};
	this._savedNames[this.REMOTE] = {};
	this._testMethods();
}

/**
 * Create the dialog
 */
RPG.UI.SaveLoad.prototype._build = function() {
	this._dom.container = OZ.DOM.elm("div");

	var go = new RPG.UI.Button("Go", this._go.bind(this));
	this._buttons.push(go);
	
	var close = new RPG.UI.Button("Close", this._close.bind(this));
	close.setChars("z\u001B");
	this._buttons.push(close);

	var d = OZ.DOM.elm("div", {innerHTML: "<strong>Method: </strong>"});
	d.appendChild(this._dom.select);
	d.appendChild(go.getInput());
	this._dom.container.appendChild(d);
	
	this._dom.saved.innerHTML = "<strong>Saved game: </strong>";
	this._dom.saved.appendChild(this._dom.savedSelect);
	d.appendChild(this._dom.saved);

	var d = OZ.DOM.elm("div");
	d.appendChild(this._dom.status);
	d.appendChild(this._dom.ta);
	this._dom.container.appendChild(d);
	
	this._dom.container.appendChild(close.getInput());
	
	for (var p in this._methods) {
		var item = this._methods[p];
		this._dom.select.appendChild(item.option);
	}
}

RPG.UI.SaveLoad.prototype._syncDOM = function() {
	var go = this._buttons[0];
	if (this._mode == RPG.SAVELOAD_SAVE) {
		go.setChar("S");
	} else {
		go.setChar("L");
	}
	
	for (var p in this._methods) {
		var item = this._methods[p];
		item.option.disabled = !item.enabled;
	}
	this._change();
}

/**
 * Check individual I/O method availability
 */
RPG.UI.SaveLoad.prototype._testMethods = function() {
	this._methods[this.CLIPBOARD].enabled = true;
	this._methods[this.LOCAL].enabled = true;
	this._methods[this.REMOTE].enabled = true;
	
	if (!window.localStorage) { 
		this._methods[this.LOCAL].enabled = false; 
	} else if (this._mode == RPG.SAVELOAD_LOAD) { /* check saved names */
		this._savedNames[this.LOCAL] = {};
		var cnt = 0;
		for (var i=0;i<localStorage.length;i++) {
			var key = localStorage.key(i);
			if (key.indexOf(this._prefix) == 0) {
				cnt++;
				var name = key.substr(this._prefix.length);
				this._savedNames[this.LOCAL][name] = name;
			}
		}
		if (!cnt) { this._methods[this.LOCAL].enabled = false; }
	}
	
	var response = function(data, status, headers) {
		if (status != 200) { 
			this._methods[this.REMOTE].enabled = false; 
		} else {
			this._savedNames[this.REMOTE] = {};
			var parts = document.cookie.split(/; */);
			var cnt = 0;
			for (var i=0;i<parts.length;i++) {
				var item = parts[i].split("=");
				if (item[0].indexOf(this._prefix) == 0) {
					cnt++;
					var name = item[0].substr(this._prefix.length);
					this._savedNames[this.REMOTE][name] = item[1];
				}
			}

			if (!cnt) { this._methods[this.REMOTE].enabled = false; }
		}

		this._syncDOM();
		RPG.UI.showDialog(this._dom.container, this._titles[this._mode]);
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
	RPG.Stats.send(RPG.Stats.SAVE);
	switch (this._method) {
		case this.CLIPBOARD:
			this._dom.ta.style.display = "";
			this._dom.ta.value = Compress.arrayToString(data, Compress.BASE64);
			this._log("SAVED, now copy the data from the textarea below and save it to a file.");
		break;
		
		case this.LOCAL:
			var name = prompt("Please name your save game");
			if (!name) { return; }

			var key = "";
			while (!key) {
				key = this._prefix + name;
				if (localStorage.getItem(key)) {
					if (!RPG.UI.confirmS("This name already exists, overwrite?")) { key = "";  }
				}
			}
			try {
				localStorage.setItem(key, Compress.arrayToString(data, Compress.UNICODE));
				this._log("SAVED to local storage as '" + name + "'.");
			} catch(e) {
				this._log("FAILURE: "+e);
			}
		break;
		
		case this.REMOTE:
			var name = prompt("Please name your save game");
			if (!name) { return; }
			var key = this._prefix + name;
			this._log("Sending...");
			OZ.Request("ajax/?action=save&name="+encodeURIComponent(key), this._response.bind(this), {
				method:"post", 
				data:Compress.arrayToString(data, Compress.BASE64),
				headers:{"Content-type":"text/plain"}
			});
		break;
	}
}

RPG.UI.SaveLoad.prototype._response = function(data, status, headers) {
	if (status == 200) {
		if (this._mode == RPG.SAVELOAD_SAVE) {
			this._log("Successfully saved.");
		} else {
			var d = Compress.stringToArray(data, Compress.BASE64);
			RPG.Game.load(d, this._readyStateChange.bind(this));
		}
	} else {
		this._log("FAILURE: "+data);
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
			var data = Compress.stringToArray(this._dom.ta.value, Compress.BASE64);
			done(data);
		break;
		
		case this.LOCAL:
			var key = this._prefix + this._dom.savedSelect.value;
			var data = localStorage.getItem(key);
			if (data == null) {
				this._log("There is no such saved game.");
				return;
			}
			data = Compress.stringToArray(data, Compress.UNICODE)
			done(data);
		break;
		
		case this.REMOTE:
			this._log("Retrieving...");
			var hash = this._dom.savedSelect.value;
			OZ.Request("ajax/?action=load&hash="+encodeURIComponent(hash), this._response.bind(this));
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
	
	if (this._mode == RPG.SAVELOAD_LOAD && index != this.CLIPBOARD) {
		this._dom.saved.style.display = "";
		var s = this._dom.savedSelect;
		OZ.DOM.clear(s);
		var opts = this._savedNames[index];
		for (var name in opts) {
			var o = OZ.DOM.elm("option");
			o.value = opts[name];
			o.innerHTML = name;
			s.appendChild(o);
		}
	} else {
		this._dom.saved.style.display = "none";
	}
}

/**
 * Cancel the dialog
 */
RPG.UI.SaveLoad.prototype._close = function() {
	for (var i=0;i<this._buttons.length;i++) { this._buttons[i].disable(); }
	RPG.UI.hideDialog();
}

RPG.UI.saveload = new RPG.UI.SaveLoad();
