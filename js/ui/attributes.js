/**
 * @class Attributes window
 */
RPG.UI.Attributes = OZ.Class();

RPG.UI.Attributes.prototype.init = function(being, allowUpgrade) {
	this._being = being;
	this._allowUpgrade = allowUpgrade;
	this._upgradable = [RPG.FEAT_MAX_HP, RPG.FEAT_MAX_MANA, RPG.FEAT_SPEED, RPG.FEAT_REGEN_HP, RPG.FEAT_REGEN_MANA].concat(RPG.ATTRIBUTES);

	this._ec = [];
	this._dom = {
		container: null
	};
	this._buttons = [];
	this._upgradableFeats = [];
	
	this._build();
	this._buildBottom();
	this._rebuild();
	this._addEvents();

	RPG.UI.showDialog(this._dom.container, "Attributes");
}

RPG.UI.Attributes.prototype._addEvents = function() {
	this._ec.push(OZ.Event.add(document, "keypress",this._keyPress.bind(this)));
	this._ec.push(OZ.Event.add(this._dom.container, "click", this._click.bind(this)));
}

RPG.UI.Attributes.prototype._keyPress = function(e) {
	var ch = e.charCode;
	var index = ch - "a".charCodeAt(0);
	if (index >= 0 && index < this._upgradableFeats.length) {
		this._upgrade(this._upgradableFeats[index]);
	}
}

RPG.UI.Attributes.prototype._click = function(e) {
	var inputs = this._dom.container.getElementsByTagName("table")[0].getElementsByTagName("input");
	var arr = [];
	for (var i=0;i<inputs.length;i++) { arr.push(inputs[i]); }
	
	var elm = OZ.Event.target(e);
	var index = arr.indexOf(elm);
	if (index >= 0 && index < this._upgradableFeats.length) {
		this._upgrade(this._upgradableFeats[index]);
	}
}

RPG.UI.Attributes.prototype._rebuild = function() {
	this._upgradableFeats = [];
	OZ.DOM.clear(this._dom.table);

	var th = OZ.DOM.elm("thead");
	var tr = OZ.DOM.elm("tr");
	var tb = OZ.DOM.elm("tbody");
	var str = "<td></td><td>Base</td><td>Modifier</td><td>Total</td>";
	if (this._allowUpgrade) { str += "<td class='right'>Upgrade</td>"; }
	tr.innerHTML = str;

	OZ.DOM.append([this._dom.table, th, tb], [th, tr]);
	
	var parents = [];
	var children = [];

	for (var i=0;i<RPG.Feats.length;i++) {
		var feat = RPG.Feats[i];
		var parent = -1;
		for (var p in feat.parentModifiers) { parent = parseInt(p); }
		
		if (parent != -1) {
			var index = parents.indexOf(parent);
			children[index].push(i);
		} else {
			parents.push(i);
			children.push([]);
		}
	}
	
	for (var i=0;i<parents.length;i++) {
		var line = this._buildFeatRow(i);
		OZ.DOM.addClass(line, "parent");
		tb.appendChild(line);
		if (!children[i].length) { continue; }
		
		for (var j=0;j<children[i].length;j++) {
			var line = this._buildFeatRow(children[i][j]);
			OZ.DOM.addClass(line, "child");
			tb.appendChild(line);
		}
	}
}

RPG.UI.Attributes.prototype._build = function() {
	this._dom.container = OZ.DOM.elm("div");
	this._dom.table = OZ.DOM.elm("table", {"class":"attributes"});
	this._dom.container.appendChild(this._dom.table);
}

RPG.UI.Attributes.prototype._buildBottom = function() {
	var b = new RPG.UI.Button("Done", this._done.bind(this));
	b.setChars("z\u001B");
	this._dom.container.appendChild(b.getInput());
	this._buttons.push(b);
}

/**
 * Leaving the interface
 */
RPG.UI.Attributes.prototype._done = function() {
	while (this._ec.length) { OZ.Event.remove(this._ec.pop()); }
	for (var i=0;i<this._buttons.length;i++) { this._buttons[i].destroy(); }
	this._buttons = [];
	RPG.UI.hideDialog();
}

RPG.UI.Attributes.prototype._buildFeatRow = function(id) {
	var tr = OZ.DOM.elm("tr");
	var pc = RPG.Game.pc;
	var feat = RPG.Feats[id];

	var name = OZ.DOM.elm("td", {innerHTML:feat.getName(), title:feat.getDescription(), "class":"left"});
	tr.appendChild(name);
	
	var base = OZ.DOM.elm("td", {innerHTML:pc.getFeatBase(id)});
	tr.appendChild(base);

	var m = pc.getFeatModifier(id);
	if (m > 0) { m = "+" + m; }
	var modifier = OZ.DOM.elm("td", {innerHTML:m});
	tr.appendChild(modifier);

	var total = OZ.DOM.elm("td", {innerHTML:pc.getFeat(id)});
	tr.appendChild(total);
	
	if (!this._allowUpgrade) { return tr; }
	
	if (this._upgradable.indexOf(id) != -1) {
		var str = "+"+feat.getUpgrade();
		var price = this._computeUpgradePrice(id);
		str += " for " + price + " gold";
		var upgrade = OZ.DOM.elm("td", {innerHTML:str, "class":"right"});
		
		var ch = String.fromCharCode("a".charCodeAt(0) + this._upgradableFeats.length);
		var button = OZ.DOM.elm("input", {type:"button", value:ch});
		button.disabled = pc.getGold() < price;
		upgrade.appendChild(button);
		
		tr.appendChild(upgrade);
		this._upgradableFeats.push(id);
	} else {
		tr.appendChild(OZ.DOM.elm("td"));
	}

	return tr;
}

/**
 * compute fibonacci rating 
 */
RPG.UI.Attributes.prototype._computeUpgradePrice = function(id) {
	var baseValue = RPG.Game.pc.getFeatBase(id);
	var feat = RPG.Feats[id];
	
	var phi = (1+Math.sqrt(5))/2;
	var newlevel = feat.normalize(baseValue) + 1;
	var val = (Math.pow(phi, newlevel) - Math.pow(-1/phi, newlevel)) / Math.sqrt(5);
	return Math.round(val);
}

RPG.UI.Attributes.prototype._upgrade = function(id) {
	if (!this._allowUpgrade) { return; }
	
	var price = this._computeUpgradePrice(id);
	var gold = RPG.Game.pc.getGold();
	if (gold < price) { return; }
	
	RPG.Game.pc.setGold(gold-price);
	var upgrade = RPG.Feats[id].getUpgrade();
	RPG.Game.pc.adjustFeat(id, upgrade);
	
	this._rebuild();
}
