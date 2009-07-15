/**
 * @class Status display
 */
RPG.UI.Status = OZ.Class();

RPG.UI.Status.prototype.init = function(container) {
	this._dom = {};
	
	this._ctors = {
		"maxhp": RPG.Feats.MaxHP,
		"dv": RPG.Feats.DV,
		"pv": RPG.Feats.PV,
		"strength": RPG.Feats.Strength,
		"toughness": RPG.Feats.Toughness,
		"intelligence": RPG.Feats.Intelligence,
		"dexterity": RPG.Feats.Dexterity
	}
	
	this._build(container);
}

RPG.UI.Status.prototype.updateMap = function(str) {
	this._dom.map.innerHTML = str;
}

RPG.UI.Status.prototype.updateRounds = function(rounds) {
	this._dom.rounds.innerHTML = rounds;
}

RPG.UI.Status.prototype.updateFeat = function(ctor) {
	for (var p in this._ctors) {
		var c = this._ctors[p];
		var ok = (!ctor || c == ctor);
		if (ok) { 
			var value = RPG.World.getPC().getFeatValue(c);
			this._dom[p].innerHTML = value; 
		}
	}
}

RPG.UI.Status.prototype.updateHP = function() {
	this._dom.hp.innerHTML = RPG.World.getPC().getHP();
}

RPG.UI.Status.prototype._build = function(container) {
	var t = OZ.DOM.elm("table");
	var tb = OZ.DOM.elm("tbody");
	var tr = OZ.DOM.elm("tr");
	OZ.DOM.append([container, t], [t, tb], [tb, tr]);
	
	var td = OZ.DOM.elm("td");
	tr.appendChild(td);
	td.innerHTML = "Hitpoints: ";
	var s = OZ.DOM.elm("span");
	this._dom.hp = s;
	td.appendChild(s);
	td.appendChild(OZ.DOM.text("/"));
	var s = OZ.DOM.elm("span");
	this._dom.maxhp = s;
	td.appendChild(s);
	
	var td = OZ.DOM.elm("td");
	tr.appendChild(td);
	td.innerHTML = "DV/PV: ";
	var s = OZ.DOM.elm("span");
	this._dom.dv = s;
	td.appendChild(s);
	td.appendChild(OZ.DOM.text("/"));
	var s = OZ.DOM.elm("span");
	this._dom.pv = s;
	td.appendChild(s);
	
	var map = {
		"strength": "Strength",
		"toughness": "Toughness",
		"intelligence": "Intelligence",
		"dexterity": "Dexterity",
		"rounds": "Game rounds",
		"map": "Map"
	}
	
	for (var p in map) {
		var td = OZ.DOM.elm("td");
		tr.appendChild(td);
		td.innerHTML = map[p]+": ";
		var s = OZ.DOM.elm("span");
		this._dom[p] = s;
		td.appendChild(s);
	}
	
	this._dom.rounds.innerHTML = "0";
}
