/**
 * @class Character generator
 */
RPG.CharGen = OZ.Class();

RPG.CharGen.prototype.races = {
	"Human": RPG.Races.Human, 
	"Orc": RPG.Races.Orc, 
	"Elf": RPG.Races.Elf, 
	"Dwarf": RPG.Races.Dwarf
};

RPG.CharGen.prototype.professions = [
	RPG.Professions.Warrior,
	RPG.Professions.Ranger,
	RPG.Professions.Wizard
];

RPG.CharGen.prototype.init = function() {
	this._list = [];
}

RPG.CharGen.prototype.build = function() {
	var t = OZ.DOM.elm("table", {className:"chargen"});
	var tb = OZ.DOM.elm("tbody");
	t.appendChild(tb);
	
	var numRaces = 0;
	var numProfessions = 0;
	for (var p in RPG.CharGen.races) { numRaces++; }
	for (var p in RPG.Professions) { numProfessions++; }
	
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
	for (var p in this.races) {
		var td = OZ.DOM.elm("td");
		td.innerHTML = p;
		tr.appendChild(td);
	}
	
	for (var i=0;i<this.professions.length;i++) {
		var prof = new this.professions[i]();
		tr = OZ.DOM.elm("tr");
		tb.appendChild(tr);
		
		/* profession label */
		var td = OZ.DOM.elm("td");
		td.innerHTML = prof.getName();
		tr.appendChild(td);
		
		for (var q in this.races) {
			/* cell */
			var td = OZ.DOM.elm("td");
			tr.appendChild(td);

			var ctor = this.races[q];
			var tmp = new ctor();
			var img = OZ.DOM.elm("img");
			img.src = "img/pc/" + tmp.getImage() + "-" + prof.getImage() + ".png";
			td.appendChild(img);
			
			this._list.push([img, ctor, prof]);
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
