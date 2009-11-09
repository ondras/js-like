/**
 * @class Status display
 */
RPG.UI.Status = OZ.Class();

RPG.UI.Status.prototype.init = function(container) {
	this._dom = {};
	
	this._feats = [
		RPG.FEAT_MAXHP,
		RPG.FEAT_DV,
		RPG.FEAT_PV
	];
	
	for (var i=0;i<RPG.ATTRIBUTES.length;i++) {
		this._feats.push(RPG.ATTRIBUTES[i]);
	}
	
	this._build(container);
}

RPG.UI.Status.prototype.updateMap = function(str) {
	this._dom.map.innerHTML = str;
}

RPG.UI.Status.prototype.updateRounds = function(rounds) {
	this._dom.rounds.innerHTML = rounds;
}

RPG.UI.Status.prototype.updateFeats = function() {
	var pc = RPG.World.getPC();
	for (var i=0;i<this._feats.length;i++) {
		var f = this._feats[i];
		var value = pc.getFeat(f);
		this._dom[f].innerHTML = value; 
	}
}

RPG.UI.Status.prototype.updateHP = function() {
	this._dom.hp.innerHTML = RPG.World.getPC().getHP();
}

RPG.UI.Status.prototype.updateName = function() {
	this._dom.name.innerHTML = RPG.World.getPC().getName();
}

RPG.UI.Status.prototype._build = function(container) {
	var t = OZ.DOM.elm("table");
	var tb = OZ.DOM.elm("tbody");
	var tr = OZ.DOM.elm("tr");
	OZ.DOM.append([container, t], [t, tb], [tb, tr]);
	
	var td = OZ.DOM.elm("td", {fontWeight:"bold"});
	tr.appendChild(td);
	this._dom.name = td;
	var td = OZ.DOM.elm("td");
	tr.appendChild(td);
	td.innerHTML = "Hitpoints: ";
	var s = OZ.DOM.elm("span");
	this._dom.hp = s;
	td.appendChild(s);
	td.appendChild(OZ.DOM.text("/"));
	var s = OZ.DOM.elm("span");
	this._dom[RPG.FEAT_MAXHP] = s;
	td.appendChild(s);
	
	var td = OZ.DOM.elm("td");
	tr.appendChild(td);
	td.innerHTML = "DV/PV: ";
	var s = OZ.DOM.elm("span");
	this._dom[RPG.FEAT_DV] = s;
	td.appendChild(s);
	td.appendChild(OZ.DOM.text("/"));
	var s = OZ.DOM.elm("span");
	this._dom[RPG.FEAT_PV] = s;
	td.appendChild(s);
	
	for (var i=0;i<RPG.ATTRIBUTES.length;i++) {
		var a = RPG.ATTRIBUTES[i];
		var f = new RPG.Feats[a](0);
		var td = OZ.DOM.elm("td");
		tr.appendChild(td);
		td.innerHTML = f.getName() + ": ";
		var s = OZ.DOM.elm("span");
		this._dom[a] = s;
		td.appendChild(s);
	}
	
	var td = OZ.DOM.elm("td");
	tr.appendChild(td);
	td.innerHTML = "Game rounds: ";
	var s = OZ.DOM.elm("span");
	this._dom.rounds = s;
	td.appendChild(s);
	
	var td = OZ.DOM.elm("td");
	tr.appendChild(td);
	td.innerHTML = "Map: ";
	var s = OZ.DOM.elm("span");
	this._dom.map = s;
	td.appendChild(s);

	this._dom.rounds.innerHTML = "0";
}
