/**
 * @class Save / Load dialog
 */
RPG.UI.SaveLoad = OZ.Class();

RPG.UI.SaveLoad.prototype.init = function(callback) {
	this._dom = {
		select: OZ.DOM.elm("select"),
		status: OZ.DOM.elm("textarea", {width:"80%", rows:"5", readOnly:true}),
		ta: OZ.DOM.elm("textarea", {width:"80%", rows:"5", readOnly:true, display:"none"})
	};
	
	this.CLIPBOARD	= "0";
	this.LOCAL		= "1";
	this.REMOTE		= "2";
	
	this._mode = -1;
	this._methods = {};
	this._methods[this.CLIPBOARD] = {
		short: "Clipboard",
		long: "Use clipboard to (manually) transfer saved game data to a file of your choice. " +
			"Game state will be stored on user's computer. "
	};
		
	this._methods[this.LOCAL] = {
		short: "Local storage",
		long: "Saved game data is stored inside a browser. Your browser must support the HTML5 'localStorage' feature. " +
			"Game state will be stored on user's computer. "
	};

	this._methods[this.REMOTE] = {
		short: "Remote database",
		long: "Saved game data is transferred to a remote database server via AJAX. " +
			"Game state will be stored on remote machine. "
	};
	
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
	go.setChar("S");
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
	RPG.UI.showDialog(this._dom.container, "Save a game");
}

/**
 * Check individual I/O method availability
 **/
RPG.UI.SaveLoad.prototype._testMethods = function() {
	if (!window.localStorage) { this._methods[this.LOCAL].enabled = false; }
	
	OZ.Request("ajax/?action=test", function(data, status, headers) {
		if (status != 200) { this._methods[this.REMOTE].enabled = false; }
		this._build();
	}.bind(this));
}

/**
 * User clicked the button, do what we must
 */
RPG.UI.SaveLoad.prototype._go = function() {
	this._mode = this._dom.select.value;
	this._dom.status.value = "";
	RPG.Game.save(this._readyStateChange.bind(this));
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
			this._dataAvailable(data);
		break;
	}
}

/**
 * Data for saving/loading available
 */
RPG.UI.SaveLoad.prototype._dataAvailable = function(data) {
	switch (this._mode) {
		case this.CLIPBOARD:
			this._dom.ta.style.display = "";
			this._dom.ta.value = btoa(data);
			this._log("SAVED, now copy the data from the textarea below and save it to a file.");
		break;
		
		case this.LOCAL:
			var name = "";
			var key = "";
			while (!key) {
				while (!name) { name = prompt("Please name your save game"); }
				key = "js-like-" + name;
				if (localStorage.getItem(key)) {
					if (!confirm("This name already exists, overwrite?")) { 
						key = ""; 
						name = "";
					}
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
