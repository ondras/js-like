/**
 * @class Questlist
 */
RPG.UI.Questlist = OZ.Class();
RPG.UI.Questlist.prototype.init = function(quests, callback) {
	this._dom = {
		container: null
	}
	this._button = null;
	this._callback = callback;
	
	this._build(quests);
}

RPG.UI.Questlist.prototype._build = function(quests) {
	this._dom.container = OZ.DOM.elm("div");
	
	if (quests.length) {
		var t = OZ.DOM.elm("table", {className:"quests"});
		this._dom.container.appendChild(t);
		var head = this._buildHead();
		var body = this._buildBody(quests);
		t.appendChild(head);
		t.appendChild(body);
	} else {
		var p = OZ.DOM.elm("p");
		p.innerHTML = "You do not participate in any quests.";
		this._dom.container.appendChild(p);
	}
	
	var b = new RPG.UI.Button("Done", this.bind(this._done));
	b.setChars("z\u001B");
	this._button = b;
	this._dom.container.appendChild(b.getInput());
	
	RPG.UI.showDialog(this._dom.container, "Active quests");
}

RPG.UI.Questlist.prototype._buildHead = function() {
	var thead = OZ.DOM.elm("thead");
	var tr = OZ.DOM.elm("tr");
	thead.appendChild(tr);
	var list = ["Task", "Given by", "Status"];
	for (var i=0;i<list.length;i++) {
		var td = OZ.DOM.elm("td");
		tr.appendChild(td);
		td.innerHTML = list[i];
	}
	
	return thead;
}

RPG.UI.Questlist.prototype._buildBody = function(quests) {
	var phases = {};
	phases[RPG.QUEST_GIVEN] = "In progress";
	phases[RPG.QUEST_DONE] = "Done";
	
	var tbody = OZ.DOM.elm("tbody");
	
	for (var i=0;i<quests.length;i++) {
		var q = quests[i];
		var phase = q.getPhase();
		
		var tr = OZ.DOM.elm("tr");
		tbody.appendChild(tr);

		var td = OZ.DOM.elm("td");
		if (phase == RPG.QUEST_GIVEN) { OZ.DOM.addClass(td, "active"); }
		tr.appendChild(td);
		td.innerHTML = q.getTask();

		var td = OZ.DOM.elm("td");
		if (phase == RPG.QUEST_DONE) { OZ.DOM.addClass(td, "active"); }
		tr.appendChild(td);
		td.innerHTML = RPG.Misc.format("%D", q.getGiver());

		var td = OZ.DOM.elm("td");
		tr.appendChild(td);
		td.innerHTML = phases[phase];
	}
	
	return tbody;
}

RPG.UI.Questlist.prototype._done = function() {
	this._button.destroy();
	RPG.UI.hideDialog();
	if (this._callback) { this._callback(); }
}
