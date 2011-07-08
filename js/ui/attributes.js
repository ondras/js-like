/**
 * @class Attributes window
 */
RPG.UI.Attributes = OZ.Class();

RPG.UI.Attributes.prototype.init = function(being) {
	this._being = being;

	this._dom = {
		container: null
	};
	this._buttons = [];
	
	this._build();
	this._buildBottom();

	RPG.UI.showDialog(this._dom.container, "Attributes");
}

RPG.UI.Attributes.prototype._build = function() {
	this._dom.container = OZ.DOM.elm("div");
	var table = OZ.DOM.elm("table", {"class":"attributes"});
	
	var th1 = OZ.DOM.elm("thead");
	var th2 = OZ.DOM.elm("thead");
	var tb1 = OZ.DOM.elm("tbody");
	var tb2 = OZ.DOM.elm("tbody");
	OZ.DOM.append([this._dom.container, table], [table, th1, tb1, th2, tb2]);
	
	OZ.DOM.append([th1, this._buildInfoRow("Primary attributes")]);
	
	for (var i=0;i<RPG.ATTRIBUTES.length;i++) {
		var a = RPG.ATTRIBUTES[i];
		var label = RPG.Feats[a].label.capitalize();
		var tr = this._buildFeatRow(label, a);
		tb1.appendChild(tr);
	}
	
	OZ.DOM.append([th2, this._buildInfoRow("Secondary attributes")]);
	
	var secondary = [RPG.FEAT_SPEED, RPG.FEAT_MAX_HP, RPG.FEAT_MAX_MANA, RPG.FEAT_DV, RPG.FEAT_PV];
	var labels = ["Speed", "Max HP", "Max mana", "DV", "PV"];
	for (var i=0;i<secondary.length;i++) {
		var tr = this._buildFeatRow(labels[i], secondary[i]);
		tb2.appendChild(tr);
	}
}

RPG.UI.Attributes.prototype._buildBottom = function() {
	var b = new RPG.UI.Button("Done", this._done.bind(this));
	b.setChar("z");
	this._dom.container.appendChild(b.getInput());
	this._buttons.push(b);
}

/**
 * Leaving the interface
 */
RPG.UI.Attributes.prototype._done = function() {
	for (var i=0;i<this._buttons.length;i++) {
		this._buttons[i].destroy();
	}
	this._buttons = [];
	RPG.UI.hideDialog();
}

RPG.UI.Attributes.prototype._buildFeatRow = function(label, feat) {
	var tr = OZ.DOM.elm("tr");
	var inst = this._being.getFeatInstance(feat);

	var name = OZ.DOM.elm("td", {innerHTML:label, "class":"left"});
	tr.appendChild(name);
	
	var base = OZ.DOM.elm("td", {innerHTML:inst.getBase()});
	tr.appendChild(base);

	var m = inst.getTotalModifier();
	if (m > 0) { m = "+" + m; }
	var modifier = OZ.DOM.elm("td", {innerHTML:m});
	tr.appendChild(modifier);

	var total = OZ.DOM.elm("td", {innerHTML:"<strong>"+inst.getValue()+"</strong>"});
	tr.appendChild(total);

	return tr;
}

RPG.UI.Attributes.prototype._buildInfoRow = function(name) {
	var tr = OZ.DOM.elm("tr");
	tr.innerHTML = "<td class='left'><strong>"+name+"</strong></td><td>Base</td><td>Modifier</td><td>Total</td>";
	return tr;
}
