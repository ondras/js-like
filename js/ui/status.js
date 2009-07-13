/**
 * @class Status display
 */
RPG.UI.Status = OZ.Class();

RPG.UI.Status.prototype.init = function(container) {
	OZ.Event.add(RPG.World, "action", this.bind(this._action));
	this._dom = {};

	this._build(container);
//	this._redraw();
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
		"rounds": "Game rounds"
	}
	
	for (var p in map) {
		var td = OZ.DOM.elm("td");
		tr.appendChild(td);
		td.innerHTML = map[p]+": ";
		var s = OZ.DOM.elm("span");
		this._dom[p] = s;
		td.appendChild(s);
	}
}

RPG.UI.Status.prototype._action = function(e) {
	var source = e.data.getSource();
	var target = e.data.getTarget();
	var pc = RPG.World.getPC();
	if (source == pc || target == pc) { this._redraw(); }
}

RPG.UI.Status.prototype._redraw = function() {
	var pc = RPG.World.getPC();
	this._dom.hp.innerHTML = pc.getHP();
	this._dom.maxhp.innerHTML = pc.getMaxHP();
	this._dom.dv.innerHTML = pc.getDV();
	this._dom.pv.innerHTML = pc.getPV();
	this._dom.strength.innerHTML = pc.getStrength();
	this._dom.toughness.innerHTML = pc.getToughness();
	this._dom.intelligence.innerHTML = pc.getIntelligence();
	this._dom.dexterity.innerHTML = pc.getDexterity();
	this._dom.rounds.innerHTML = RPG.World.getRounds();
}
