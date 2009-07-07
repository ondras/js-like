/**
 * @class Itemlist
 */
RPG.UI.Itemlist = OZ.Class();

RPG.UI.Itemlist.prototype._groups = {
	"Weapons": RPG.Items.Weapon,
	"Consumables": RPG.Items.Edible,
	"Gold": RPG.Items.Gold,
	"Gems": RPG.Items.Gem
}

RPG.UI.Itemlist.prototype.init = function(data) {
	this._data = {
		items:[],
		label:"",
		pick: null /* -1/0/1 (-1 == unlimited) */
	}
	for (var p in data) { this._data[p] = data[p]; }
	
	/* sort items by groups */
	var orig = this._data.items;
	this._data.items = [];
	for (var p in this._groups) {
		for (var i=0;i<orig.length;i++) {
			var item = orig[i];
			if (item instanceof this._groups[p]) { this._data.items.push(item); }
		}
	}
	
	this._index = 0;
	this._eventsGlobal = [];
	this._eventsLocal = [];
	this._checked = [];
	this._checkboxes = [];
	this._pageSize = 15;
	this._page = 0;
	this._dom = {
		container: null,
		table: null,
		prev: null,
		next: null
	}
	
	/* pre-mark all as not checked */
	for (var i=0;i<this._data.items.length;i++) { this._checked.push(false); }
	
	this._eventsGlobal.push(OZ.Event.add(document, "keypress",this.bind(this._keyPress)));

	this._build();
	document.body.appendChild(this._dom.container);

	this._update(0);
}

RPG.UI.Itemlist.prototype.close = function() {
	this._eventsGlobal.forEach(OZ.Event.remove);
	this._eventsLocal.forEach(OZ.Event.remove);
	this._dom.container.parentNode.removeChild(this._dom.container);
}

RPG.UI.Itemlist.prototype._position = function() {
	var c = this._dom.container;
	var w = c.offsetWidth;
	var h = c.offsetHeight;
	var win = OZ.DOM.win();
	c.style.left = Math.round((win[0]-w)/2) + "px";
	c.style.top = Math.round((win[1]-h)/2) + "px";
}

RPG.UI.Itemlist.prototype._build = function() {
	this._dom.container = OZ.DOM.elm("div", {"class":"items", position:"absolute"});
	
	if (this._data.label) {
		var h = OZ.DOM.elm("h1");
		h.innerHTML = this._data.label;
		this._dom.container.appendChild(h);
	}
	
	var t = OZ.DOM.elm("table");
	this._dom.container.appendChild(t);
	this._dom.table = t;
	this._buildBottom();
}

RPG.UI.Itemlist.prototype._update = function(page) {
	if (page < 0 || page >= Math.ceil(this._data.items.length/this._pageSize)) { return; }
	
	this._page = page;
	this._index = this._page * this._pageSize;
	var data = [];
	var max = Math.min(this._index + this._pageSize, this._data.items.length);
	for (var i=this._index;i<max;i++) { data.push(this._data.items[i]); }
	
	OZ.DOM.clear(this._dom.table);
	this._checkboxes = [];
	this._eventsLocal.forEach(OZ.Event.remove);
	
	for (var p in this._groups) { this._buildGroup(p, data); }
	
	this._dom.prev.style.display = (page > 0 ? "" : "none");
	this._dom.next.style.display = (max < this._data.items.length ? "" : "none");
	this._position();
}

RPG.UI.Itemlist.prototype._buildBottom = function() {
	var b = OZ.DOM.elm("input", {type:"button"});
	b.value = "Done (z)";
	this._dom.container.appendChild(b);
	this._eventsGlobal.push(OZ.Event.add(b, "click", this.bind(this._done)));

	var b = OZ.DOM.elm("input", {type:"button"});
	b.value = "Previous page (-)";
	this._dom.container.appendChild(b);
	this._eventsGlobal.push(OZ.Event.add(b, "click", this.bind(function() {this._update(this._page-1);})));
	this._dom.prev = b;

	var b = OZ.DOM.elm("input", {type:"button"});
	b.value = "Next page (+)";
	this._dom.container.appendChild(b);
	this._eventsGlobal.push(OZ.Event.add(b, "click", this.bind(function() {this._update(this._page+1);})));
	this._dom.next = b;
}

RPG.UI.Itemlist.prototype._buildGroup = function(name, data) {
	var arr = [];
	var ctor = this._groups[name];
	for (var i=0;i<data.length;i++) {
		var item = data[i];
		if (item instanceof ctor) { arr.push(item); }
	}
	
	if (!arr.length) { return; }
	
	var th = OZ.DOM.elm("thead");
	var tr = OZ.DOM.elm("tr");
	var td = OZ.DOM.elm("td");
	td.colSpan = (this._data.pick ? 2 : 1);
	td.innerHTML = name;
	OZ.DOM.append([this._dom.table, th], [th, tr], [tr, td]);
	
	var tb = OZ.DOM.elm("tbody");
	this._dom.table.appendChild(tb);
	
	for (var i=0;i<arr.length;i++) {
		var item = this._buildItem(arr[i]);
		tb.appendChild(item);
	}
}

RPG.UI.Itemlist.prototype._buildItem = function(item) {
	var localIndex = this._index - this._pageSize * this._page;
	var tr = OZ.DOM.elm("tr");
	
	if (this._data.pick) {
		var td = OZ.DOM.elm("td");
		tr.appendChild(td);
		
		var btn = OZ.DOM.elm("input", {type:"button"});
		var code = "a".charCodeAt(0) + localIndex;
		var label = String.fromCharCode(code);
		btn.value = label;
		td.appendChild(btn);
		this._addButtonClick(btn, this._index);
		
		if (this._data.pick == -1) {
			td.appendChild(OZ.DOM.text(" "));
			var ch = OZ.DOM.elm("input", {type:"checkbox", id:"item_"+this._index});
			ch.checked = this._checked[this._index];
			this._checkboxes.push(ch);
			td.appendChild(ch);
			this._addCheckboxClick(ch, this._index);
		}
	}
	
	var td = OZ.DOM.elm("td");
	tr.appendChild(td);
	
	var l = OZ.DOM.elm("label", {htmlFor:"item_"+this._index});
	l.innerHTML = item.describe();
	td.appendChild(l);

	this._index++;
	return tr;
}

RPG.UI.Itemlist.prototype._addButtonClick = function(button, index) {
	var id = OZ.Event.add(button, "click", this.bind(function(e) {
		this._toggle(index);
	}));
	this._eventsLocal.push(id);
}

RPG.UI.Itemlist.prototype._addCheckboxClick = function(ch, index) {
	var id = OZ.Event.add(ch, "change", this.bind(function(e) {
		this._checked[index] = ch.checked;
	}));
	this._eventsLocal.push(id);
}

RPG.UI.Itemlist.prototype._toggle = function(index) {
	this._checked[index] = !this._checked[index];
	if (this._data.pick == 1) {
		/* only one to pick, finish */
		this._done();
	} else {
		var localIndex = index - this._page * this._pageSize;
		this._checkboxes[localIndex].checked = this._checked[index];
	}
}

RPG.UI.Itemlist.prototype._done = function() {
	var arr = [];
	for (var i=0;i<this._data.items.length;i++) {
		if (this._checked[i]) { arr.push(this._data.items[i]); }
	}
	this.close();
	RPG.UI.setMode(RPG.UI_DONE_ITEMS, false, arr);
}

RPG.UI.Itemlist.prototype._keyPress = function(e) {
	OZ.Event.prevent(e); /* only when necessary! */
	var ch = e.charCode;
	if (ch == "z".charCodeAt(0)) {
		this._done();
	} else if (ch == "+".charCodeAt(0)) {
		this._update(this._page+1);
	} else if (ch == "-".charCodeAt(0)) {
		this._update(this._page-1);
	} else {
		var index = ch - "a".charCodeAt(0);
		index += this._page * this._pageSize;
		if (index < this._data.items.length) {
			this._toggle(index); /* FIXME only in relevant mode! */
		}
	}
}
