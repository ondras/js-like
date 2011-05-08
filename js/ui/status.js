/**
 * @class Status display
 */
RPG.UI.Status = OZ.Class();

RPG.UI.Status.prototype.init = function(container) {
	this._dom = {
		feats: {},
		stats: {},
		misc: {}
	};
	
	this._build(container);
}

RPG.UI.Status.prototype.toJSON = function(handler) {
	var data = {
		feats:{},
		stats:{},
		misc:{}
	};
	
	for (var p in this._dom.feats) { data.feats[p] = this._dom.feats[p].innerHTML; }
	for (var p in this._dom.stats) { data.stats[p] = this._dom.stats[p].innerHTML; }
	for (var p in this._dom.misc) { data.misc[p] = this._dom.misc[p].innerHTML; }

	return data;
}

RPG.UI.Status.prototype.fromJSON = function(data) {
	for (var p in data.feats) { this._dom.feats[p].innerHTML = data.feats[p]; }
	for (var p in data.stats) { this._dom.stats[p].innerHTML = data.stats[p]; }
	for (var p in data.misc) { this._dom.misc[p].innerHTML = data.misc[p]; }
}

RPG.UI.Status.prototype.updateMap = function(str) {
	this._dom.misc.map.innerHTML = str;
}

RPG.UI.Status.prototype.updateRounds = function(rounds) {
	this._dom.misc.rounds.innerHTML = rounds;
}

RPG.UI.Status.prototype.updateName = function(name) {
	this._dom.misc.name.innerHTML = name;
}

RPG.UI.Status.prototype.updateFeat = function(feat, value) {
	var elm = this._dom.feats[feat];
	if (!elm) { return; }
	elm.innerHTML = value; 
}

RPG.UI.Status.prototype.updateStat = function(stat, value) {
	var elm = this._dom.stats[stat];
	if (!elm) { return; }
	elm.innerHTML = value; 
}

RPG.UI.Status.prototype._build = function(container) {
	var t = OZ.DOM.elm("table");
	var tb = OZ.DOM.elm("tbody");
	var tr = OZ.DOM.elm("tr");
	OZ.DOM.append([container, t], [t, tb], [tb, tr]);
	
	/* name */
	var td = OZ.DOM.elm("td", {fontWeight:"bold"});
	tr.appendChild(td);
	this._dom.misc.name = td;
	
	/* hp */
	var td = OZ.DOM.elm("td");
	tr.appendChild(td);
	td.innerHTML = "HP: ";
	var s = OZ.DOM.elm("span");
	this._dom.stats[RPG.STAT_HP] = s;
	td.appendChild(s);
	td.appendChild(OZ.DOM.text("/"));
	var s = OZ.DOM.elm("span");
	this._dom.feats[RPG.FEAT_MAX_HP] = s;
	td.appendChild(s);
	
	/* mana */
	var td = OZ.DOM.elm("td");
	tr.appendChild(td);
	td.innerHTML = "Mana: ";
	var s = OZ.DOM.elm("span");
	this._dom.stats[RPG.STAT_MANA] = s;
	td.appendChild(s);
	td.appendChild(OZ.DOM.text("/"));
	var s = OZ.DOM.elm("span");
	this._dom.feats[RPG.FEAT_MAX_MANA] = s;
	td.appendChild(s);

	/* dv/pv */
	var td = OZ.DOM.elm("td");
	tr.appendChild(td);
	td.innerHTML = "DV/PV: ";
	var s = OZ.DOM.elm("span");
	this._dom.feats[RPG.FEAT_DV] = s;
	td.appendChild(s);
	td.appendChild(OZ.DOM.text("/"));
	var s = OZ.DOM.elm("span");
	this._dom.feats[RPG.FEAT_PV] = s;
	td.appendChild(s);

	/* attributes */
	for (var i=0;i<RPG.ATTRIBUTES.length;i++) {
		var c = RPG.ATTRIBUTES[i];
		var f = RPG.Feats[c];
		var td = OZ.DOM.elm("td");
		tr.appendChild(td);
		td.innerHTML = f.label.capitalize() + ": ";
		var s = OZ.DOM.elm("span");
		this._dom.feats[c] = s;
		td.appendChild(s);
	}
	
	/* rounds */
	var td = OZ.DOM.elm("td");
	tr.appendChild(td);
	td.innerHTML = "Round: ";
	var s = OZ.DOM.elm("span");
	this._dom.misc.rounds = s;
	td.appendChild(s);
	
	/* level */
	var td = OZ.DOM.elm("td");
	tr.appendChild(td);
	td.innerHTML = "Map: ";
	var s = OZ.DOM.elm("span");
	this._dom.misc.map = s;
	td.appendChild(s);

	this._dom.misc.rounds.innerHTML = "0";
}
