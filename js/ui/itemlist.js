/**
 * @class Itemlist
 */
RPG.UI.Itemlist = OZ.Class();

RPG.UI.Itemlist.prototype._groups = {
	"Head gear": RPG.Items.HeadGear,
	"Neck wear": RPG.Items.Necklace,
	"Weapons": RPG.Items.Weapon,
	"Armor": RPG.Items.Armor,
	"Shields": RPG.Items.Shield,
	"Boots": RPG.Items.Boots,
	"Rings": RPG.Items.Ring,
	"Potions": RPG.Items.Potion,
	"Readable": RPG.Items.Readable,
	"Consumables": RPG.Items.Consumable,
	"Gems": RPG.Items.Gem,
	"Gold": RPG.Items.Gold,
	"Tools": RPG.Items.Tool,
	"Spells": RPG.Spells.BaseSpell
}

/**
 * @param {object[]} data List of instances
 * @param {string} label Dialog label
 * @param {int} pick Pick mode: 1=pick one, 0=do not pick just show, -1=pick any number
 * @param {function} callback What to call when picking is done
 */
RPG.UI.Itemlist.prototype.init = function(data, label, pick, callback) {
	this._label = label;
	this._pick = pick;
	this._callback = callback;
	this._events = [];
	this._buttons = [];
	
	this._index = 0;
	this._pageSize = 10;
	this._page = 0;
	this._dom = {
		container: null,
		table: null,
		prev: null,
		next: null
	}
	
	this._prepare(data);
	this._build();
	this._addEvents();
	
	this._update(0);
}

RPG.UI.Itemlist.prototype._prepare = function(items) {
	/* sort items by groups */
	var arr = this._sortData(items);

	/* prepare data structure */
	this._data = [];
	for (var i=0;i<arr.length;i++) {
		var obj = {
			item: arr[i],
			checkbox:   OZ.DOM.elm("input", {type:"checkbox", id:"item_"+i}),
			buttonMax:  OZ.DOM.elm("input", {type:"button"}),
			buttonSome: OZ.DOM.elm("input", {type:"button"}),
			amount: 0,
			label: OZ.DOM.elm("label", {htmlFor:"item_"+i})
		}
		obj.label.innerHTML = "&nbsp;" + this._format(arr[i]) + "&nbsp;";
		this._data.push(obj);
	}
}

RPG.UI.Itemlist.prototype._sortData = function(items) {
	var arr = [];
	for (var p in this._groups) {
		for (var i=0;i<items.length;i++) {
			var item = items[i];
			if (item instanceof this._groups[p]) { arr.push(item); }
		}
	}
	return arr;
}

RPG.UI.Itemlist.prototype._addEvents = function() {
	this._events.push(OZ.Event.add(document, "keypress",this.bind(this._keyPress)));
	
	if (this._pick) {
		this._events.push(OZ.Event.add(this._dom.container, "click", this.bind(this._click)));
	}
	
	if (this._pick == -1) {
		this._events.push(OZ.Event.add(this._dom.container, "change", this.bind(this._change)));
	}
}

RPG.UI.Itemlist.prototype._click = function(e) {
	var elm = OZ.Event.target(e);
	for (var i=0;i<this._data.length;i++) {
		var obj = this._data[i];
		if (obj.buttonMax == elm)  { this._toggleMax(obj); }
		if (obj.buttonSome == elm) { this._toggle(obj); }
	}
}

RPG.UI.Itemlist.prototype._change = function(e) {
	var elm = OZ.Event.target(e);
	for (var i=0;i<this._data.length;i++) {
		var obj = this._data[i];
		if (obj.checkbox == elm) { 		
			if (elm.checked) {
				this._toggleOnMax(obj); 
			} else {
				this._toggleOff(obj);
			}
		}
	}
}

RPG.UI.Itemlist.prototype._build = function() {
	this._dom.container = OZ.DOM.elm("div");
	
	var t = OZ.DOM.elm("table");
	this._dom.container.appendChild(t);
	this._dom.table = t;
	this._buildBottom();
	
	RPG.UI.showDialog(this._dom.container, this._label);
}

RPG.UI.Itemlist.prototype._update = function(page) {
	if (page < 0 || page >= Math.ceil(this._data.length/this._pageSize)) { return; }
	
	this._page = page;
	this._index = this._page * this._pageSize;
	var data = [];
	var max = Math.min(this._index + this._pageSize, this._data.length);
	for (var i=this._index;i<max;i++) { data.push(this._data[i]); }
	
	OZ.DOM.clear(this._dom.table);
	for (var p in this._groups) { this._buildGroup(p, data); }
	
	this._dom.prev.getInput().style.display = (page > 0 ? "" : "none");
	this._dom.next.getInput().style.display = (max < this._data.length ? "" : "none");
	RPG.UI.syncDialog();
}


RPG.UI.Itemlist.prototype._buildBottom = function() {
	var b = new RPG.UI.Button("Done", this.bind(this._done));
	b.setChars("z\u001B");
	this._buttons.push(b);
	this._dom.container.appendChild(b.getInput());

	if( this._pick == -1) {
		var b = new RPG.UI.Button("All", this.bind(this._all));
		b.setChars(",");
		this._buttons.push(b);
		this._dom.container.appendChild(b.getInput());
	}

	var b = new RPG.UI.Button("Previous page", this.bind(this._prev));
	b.setChars("-_");
	this._buttons.push(b);
	this._dom.prev = b;
	this._dom.container.appendChild(b.getInput());

	var b = new RPG.UI.Button("Next page", this.bind(this._next));
	b.setChars("+=");
	this._buttons.push(b);
	this._dom.next = b;
	this._dom.container.appendChild(b.getInput());
}

RPG.UI.Itemlist.prototype._buildGroup = function(name, data) {
	var arr = this._filterByGroup(name, data);
	if (!arr.length) { return; }
	
	var th = OZ.DOM.elm("thead");
	var tr = OZ.DOM.elm("tr");
	var td = OZ.DOM.elm("td");
	
	var cs = 1;
	if (this._pick == 1) { cs = 2; }
	if (this._pick == -1) { cs = 3; }
	td.colSpan = cs;
	td.innerHTML = name;
	OZ.DOM.append([this._dom.table, th], [th, tr], [tr, td]);
	
	var tb = OZ.DOM.elm("tbody");
	this._dom.table.appendChild(tb);
	
	for (var i=0;i<arr.length;i++) {
		var item = this._buildItem(arr[i]);
		tb.appendChild(item);
	}
}

RPG.UI.Itemlist.prototype._filterByGroup = function(name, data) {
	var arr = [];
	var ctor = this._groups[name];
	for (var i=0;i<data.length;i++) {
		var item = data[i].item;
		if (item instanceof ctor) { arr.push(data[i]); }
	}
	return arr;
}

RPG.UI.Itemlist.prototype._buildItem = function(item) {
	var localIndex = this._index - this._pageSize * this._page;
	var tr = OZ.DOM.elm("tr");
	
	if (this._pick) {
		var td = OZ.DOM.elm("td");
		tr.appendChild(td);
		
		var btn = item.buttonMax;
		var code = "a".charCodeAt(0) + localIndex;
		var label = String.fromCharCode(code);
		btn.value = label;
		td.appendChild(btn);

		if (item.item.getAmount && item.item.getAmount() > 1) {
			var btn2 = item.buttonSome;
			btn2.value = label.toUpperCase();
			td.appendChild(btn2);
		}

		if (this._pick == -1) {
			var td = OZ.DOM.elm("td");
			tr.appendChild(td);			
			td.appendChild(item.checkbox);
		}
	}
	
	var td = OZ.DOM.elm("td");
	tr.appendChild(td);
	td.appendChild(item.label);

	this._index++;
	return tr;
}

RPG.UI.Itemlist.prototype._toggle = function(obj) {
	if (obj.checkbox.checked) {
		this._toggleOff(obj);
	} else {
		this._toggleOn(obj);
	}
}

RPG.UI.Itemlist.prototype._toggleMax = function(obj) {
	if (obj.checkbox.checked) {
		this._toggleOff(obj);
	} else {
		this._toggleOnMax(obj);
	}
}

RPG.UI.Itemlist.prototype._toggleOnMax = function(obj) {
	var max = (obj.item.getAmount ? obj.item.getAmount() : 1);
	obj.amount = max;
	obj.checkbox.checked = true;
	obj.checkbox.indeterminate = false;
	if (this._pick == 1) {
		/* only one to pick, finish */
		this._done();
	}
}

RPG.UI.Itemlist.prototype._toggleOn = function(obj) {
	var amount = 1;
	var max = (obj.item.getAmount ? obj.item.getAmount() : 1);
	if (!obj.checkbox.checked && this._pick == -1) {
		/* ask for amount */
		if (max > 1) {
			amount = prompt("How many?", obj.item.getAmount());
			if (amount == null || amount < 1 || amount > obj.item.getAmount()) { return; }
		} else { 
			amount = max;
		}
	}
	obj.amount = parseInt(amount, 10);	
	obj.checkbox.checked = true;

	if (amount!=max) obj.checkbox.indeterminate = true;
	
	if (this._pick == 1) {
		/* only one to pick, finish */
		this._done();
	}
}

RPG.UI.Itemlist.prototype._toggleOff = function(obj) {
	obj.checkbox.checked = false;
	obj.checkbox.indeterminate = false;
	obj.amount = 0;
}

RPG.UI.Itemlist.prototype._done = function() {
	var arr = [];
	for (var i=0;i<this._data.length;i++) {
		var obj = this._data[i];
		if (obj.amount > 0) { arr.push([obj.item, obj.amount]); }
	}

	this._events.forEach(OZ.Event.remove);
	this._events = [];
	
	for (var i=0;i<this._buttons.length;i++) {
		this._buttons[i].destroy();
	}
	this._buttons = [];
	RPG.UI.hideDialog();
	if (this._callback) { this._callback(arr); }
}

RPG.UI.Itemlist.prototype._all = function() {
	var arr = [];
	var uncheckedFound = false;
	for (var i=0;i<this._data.length;i++) {
		var obj = this._data[i];
		if(!obj.checkbox.checked || obj.checkbox.indeterminate) {
			uncheckedFound = true;
			break;
		}
	}
	if (uncheckedFound) {
		for (var i=0;i<this._data.length;i++) {
			var obj = this._data[i];
			this._toggleOnMax(obj);
		}
	}
	else {
		for (var i=0;i<this._data.length;i++) {
			var obj = this._data[i];
			this._toggleOff(obj);
		}
	}
}

RPG.UI.Itemlist.prototype._keyPress = function(e) {
	var ch = e.charCode;
	var index = ch - "a".charCodeAt(0);
	index += this._page * this._pageSize;
	if (index >= 0 && index < this._data.length) {
		OZ.Event.prevent(e);
		this._toggleMax(this._data[index]);
		return;
	}

	var index = ch - "A".charCodeAt(0);
	index += this._page * this._pageSize;
	if (index >= 0 && index < this._data.length) {
		OZ.Event.prevent(e);
		this._toggle(this._data[index]);
		return;
	}
}

RPG.UI.Itemlist.prototype._prev = function() {
	this._update(this._page-1);
}

RPG.UI.Itemlist.prototype._next = function() {
	this._update(this._page+1);
}

RPG.UI.Itemlist.prototype._format = function(item) {
	return item.describe();
}

/**
 * List of spells displays cost as well
 * @see RPG.UI.Itemlist
 * @augments RPG.UI.Itemlist
 */
RPG.UI.Spelllist = OZ.Class().extend(RPG.UI.Itemlist);
RPG.UI.Spelllist.prototype.init = function(data, label, callback) {
	this.parent(data, label, 1, callback);
}

RPG.UI.Spelllist.prototype._format = function(item) {
	var str = "(" + item.cost + ") ";
	
	var spell = new item();
	str += spell.describe().capitalize();
	
	if (spell instanceof RPG.Spells.Attack) {
		str += " (" + spell.getDamage().toString() + ")";
	}
	return str;
}

RPG.UI.Spelllist.prototype._sortData = function(items) {
	var arr = items.clone();
	arr.sort(function(a,b) { 
		return new a().describe().localeCompare(new b().describe()); 
	});
	return arr;
}

RPG.UI.Spelllist.prototype._filterByGroup = function(name, data) {
	var arr = [];
	var ctor = this._groups[name];
	for (var i=0;i<data.length;i++) {
		var item = data[i].item;
		if (item == ctor || item["extends"](ctor)) { arr.push(data[i]); }
	}
	return arr;
}
