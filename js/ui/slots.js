/**
 * @class Slots and their items
 */
RPG.UI.Slots = OZ.Class();

RPG.UI.Slots.prototype.init = function(being, callback) {
	this._being = being;
	this._callback = callback;
	this._dom = {
		container: null,
		items: {}
	};
	this._buttons = [];
	this._slots = {};
	this._slotIds = [];
	
	this._somethingDone = false;

	this._build();
	this._buildBottom();

	this._show();
}

RPG.UI.Slots.prototype._build = function() {
	this._dom.container = OZ.DOM.elm("div");
	var table = OZ.DOM.elm("table");
	var tb = OZ.DOM.elm("tbody");
	OZ.DOM.append([this._dom.container, table], [table, tb]);
	
	var index = 0;
	var order = [RPG.SLOT_HEAD, RPG.SLOT_NECK, RPG.SLOT_ARMOR, RPG.SLOT_WEAPON, RPG.SLOT_SHIELD, 
				RPG.SLOT_LRING, RPG.SLOT_RRING, RPG.SLOT_FEET, RPG.SLOT_PROJECTILE];
	
	for (var i=0;i<order.length;i++) {
		var slotId = order[i];
		var slot = this._being.getSlot(slotId);
		if (!slot) { continue; }
		
		this._slotIds.push(slotId);
		this._slots[slotId] = slot;
	
		var row = OZ.DOM.elm("tr");
		tb.appendChild(row);

		var ch = String.fromCharCode("a".charCodeAt(0) + index);
		var b = new RPG.UI.Button("", this.bind(this._buttonActivated));
		this._buttons.push(b);
		b.setChar(ch);
		var td = OZ.DOM.elm("td");
		td.appendChild(b.getInput());
		row.appendChild(td);
	
		var td = OZ.DOM.elm("td", {fontWeight:"bold"});
		td.innerHTML = slot.getName();
		row.appendChild(td);
		
		var td = OZ.DOM.elm("td");
		this._dom.items[slotId] = td;
		this._redrawSlot(slotId);
		row.appendChild(td);
		
		index++;
	}
	
}

RPG.UI.Slots.prototype._buildBottom = function() {
	var b = new RPG.UI.Button("Done", this.bind(this._done));
	b.setChars("z\u001B");
	this._dom.container.appendChild(b.getInput());
	this._buttons.push(b);
	
	var b = new RPG.UI.Button("View items", this.bind(this._showItems));
	b.setChar("v");
	this._dom.container.appendChild(b.getInput());
	this._buttons.push(b);
}

/**
 * Show the dialog
 */
RPG.UI.Slots.prototype._show = function() {
	RPG.UI.showDialog(this._dom.container, "Your equipment");
	this._enableButtons();
}

/**
 * Leaving the interface
 */
RPG.UI.Slots.prototype._done = function() {
	for (var i=0;i<this._buttons.length;i++) {
		this._buttons[i].destroy();
	}
	this._buttons = [];
	RPG.UI.hideDialog();
	this._callback(this._somethingDone);
}

/**
 * Button activated
 */
RPG.UI.Slots.prototype._buttonActivated = function(b) {
	var index = this._buttons.indexOf(b);
	this._toggle(this._slotIds[index]);
}

/**
 * Switch slot state
 */
RPG.UI.Slots.prototype._toggle = function(slotId) {
	var slot = this._slots[slotId];
	var item = slot.getItem();
	if (item) {
		this._being.unequip(slotId);
		this._somethingDone = true;
		this._redrawSlot(slotId);
	} else {
		this._disableButtons();
		var all = this._being.getItems();
		var filtered = slot.filterAllowed(all);
		var label = "Select item for '" + slot.getName() + "'";
		var cb = function(items) { this._item(slotId, items); }
		new RPG.UI.Itemlist(filtered, label, 1, this.bind(cb));
	}
}

/**
 * Put item to a given slot. To be called as a callback from Itemlist
 * @param {int} slotId Slot ID
 * @param {array} items [[item, amount]]
 */
RPG.UI.Slots.prototype._item = function(slotId, items) {
	this._show();
	if (!items.length) { return; }	

	this._somethingDone = true;
	var item = items[0][0]; 
	this._being.equip(slotId, item);
	this._redrawSlots();
}

/**
 * Redraw all slots
 */
RPG.UI.Slots.prototype._redrawSlots = function() {
	for (var p in this._slots) { this._redrawSlot(p); }
}

/**
 * Redraw one slot item
 */
RPG.UI.Slots.prototype._redrawSlot = function(slotId) {
	var slot = this._slots[slotId];
	var td = this._dom.items[slotId];
	var item = slot.getItem();
	if (item) {
		td.innerHTML = "&nbsp;" + item.describe() + "&nbsp;";
	} else {
		td.innerHTML = "-nothing-";
	}
}

/**
 * Just show all items
 */
RPG.UI.Slots.prototype._showItems = function() {
	for (var i=0;i<this._buttons.length;i++) {
		this._buttons[i].disable();
	}
	var items = this._being.getItems();
	new RPG.UI.Itemlist(items, "Items in your backpack", 0, this.bind(this._show));
}

RPG.UI.Slots.prototype._enableButtons = function() {
	for (var i=0;i<this._buttons.length;i++) {
		this._buttons[i].enable();
	}
}

RPG.UI.Slots.prototype._disableButtons = function() {
	for (var i=0;i<this._buttons.length;i++) {
		this._buttons[i].disable();
	}
}
