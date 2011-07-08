/**
 * @class Status display
 */
RPG.UI.Status = OZ.Class();

RPG.UI.Status.prototype.init = function(ul) {
	this._dom = {
		feats: {},
		stats: {},
		misc: {}
	};
	
	this._build(ul);
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

RPG.UI.Status.prototype._build = function(ul) {
	/* name */
	var li = OZ.DOM.elm("li", {fontWeight:"bold"});
	ul.appendChild(li);
	this._dom.misc.name = li;
	
	/* hp */
	var li = OZ.DOM.elm("li");
	ul.appendChild(li);
	li.innerHTML = "HP: ";
	var s = OZ.DOM.elm("span");
	this._dom.stats[RPG.STAT_HP] = s;
	li.appendChild(s);
	li.appendChild(OZ.DOM.text("/"));
	var s = OZ.DOM.elm("span");
	this._dom.feats[RPG.FEAT_MAX_HP] = s;
	li.appendChild(s);
	
	/* mana */
	var li = OZ.DOM.elm("li");
	ul.appendChild(li);
	li.innerHTML = "Mana: ";
	var s = OZ.DOM.elm("span");
	this._dom.stats[RPG.STAT_MANA] = s;
	li.appendChild(s);
	li.appendChild(OZ.DOM.text("/"));
	var s = OZ.DOM.elm("span");
	this._dom.feats[RPG.FEAT_MAX_MANA] = s;
	li.appendChild(s);

	/* rounds */
	var li = OZ.DOM.elm("li");
	ul.appendChild(li);
	li.innerHTML = "Round: ";
	var s = OZ.DOM.elm("span", {innerHTML:"0"});
	this._dom.misc.rounds = s;
	li.appendChild(s);
	
	/* level */
	var li = OZ.DOM.elm("li");
	ul.appendChild(li);
	li.innerHTML = "Map: ";
	var s = OZ.DOM.elm("span");
	this._dom.misc.map = s;
	li.appendChild(s);
}
