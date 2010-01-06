/**
 * @class Character generator
 */
RPG.CharGen = OZ.Class();

RPG.CharGen.prototype.races = [
	RPG.Races.Human, 
	RPG.Races.Orc, 
	RPG.Races.Elf, 
	RPG.Races.Dwarf
];

RPG.CharGen.prototype.professions = [
	RPG.Professions.Adventurer,
	RPG.Professions.Warrior,
	RPG.Professions.Archer,
	RPG.Professions.Wizard
];

RPG.CharGen.prototype.init = function() {
	this._list = [];
}

RPG.CharGen.prototype.build = function() {
	var t = OZ.DOM.elm("table", {className:"chargen"});
	var tb = OZ.DOM.elm("tbody");
	t.appendChild(tb);
	
	/* right part with race/profession selection */
	this._buildMatrix(tb);
	
	OZ.Event.add(t, "click", this.bind(this._click));
	
	return t;
}

RPG.CharGen.prototype._buildMatrix = function(tb) {
	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);
	var empty = OZ.DOM.elm("td");
	tr.appendChild(empty);
	
	/* race labels */
	for (var i=0;i<this.races.length;i++) {
		var td = OZ.DOM.elm("td");
		td.innerHTML = this.races[i].name.capitalize();
		tr.appendChild(td);
	}
	
	for (var i=0;i<this.professions.length;i++) {
		var profCtor = this.professions[i];
		
		tr = OZ.DOM.elm("tr");
		tb.appendChild(tr);
		
		/* profession label */
		var td = OZ.DOM.elm("td");
		td.innerHTML = profCtor.name.capitalize();
		tr.appendChild(td);
		
		for (var j=0;j<this.races.length;j++) {
			var raceCtor = this.races[j];
			
			/* cell */
			var td = OZ.DOM.elm("td");
			tr.appendChild(td);

			var img = OZ.DOM.elm("img");
			img.src = "img/pc/" + raceCtor.image + "-" + profCtor.image + ".png";
			td.appendChild(img);
			
			this._list.push([img, raceCtor, profCtor]);
		}
	}
}

RPG.CharGen.prototype._click = function(e) {
	var t = OZ.Event.target(e);
	if (t.nodeName.toLowerCase() != "img") { return; }
	for (var i=0;i<this._list.length;i++) {
		var item = this._list[i];
		if (item[0] == t) {
			this.dispatch("chargen", {race: item[1], profession: item[2]});
		}
	}
}
