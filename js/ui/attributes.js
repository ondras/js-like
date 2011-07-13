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
	
	var th = OZ.DOM.elm("thead");
	var tr = OZ.DOM.elm("tr");
	var tb = OZ.DOM.elm("tbody");
	tr.innerHTML = "<td class='left'><strong>"+name+"</strong></td><td>Base</td><td>Modifier</td><td>Total</td>";

	OZ.DOM.append([this._dom.container, table], [table, th, tb], [th, tr]);
	
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

RPG.UI.Attributes.prototype._buildFeatRow = function(feat) {
	var tr = OZ.DOM.elm("tr");
	var pc = RPG.Game.pc;

	var name = OZ.DOM.elm("td", {innerHTML:RPG.Feats[feat].name, "class":"left"});
	tr.appendChild(name);
	
	var base = OZ.DOM.elm("td", {innerHTML:pc.getFeatBase(feat)});
	tr.appendChild(base);

	var m = pc.getFeatModifier(feat);
	if (m > 0) { m = "+" + m; }
	var modifier = OZ.DOM.elm("td", {innerHTML:m});
	tr.appendChild(modifier);

	var total = OZ.DOM.elm("td", {innerHTML:"<strong>"+pc.getFeat(feat)+"</strong>"});
	tr.appendChild(total);

	return tr;
}
