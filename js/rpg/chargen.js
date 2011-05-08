/**
 * @class Character generator
 */
RPG.CharGen = OZ.Class();

RPG.CharGen.prototype.init = function() {
	this._name = OZ.DOM.elm("input", {type:"text", size:"15", font:"inherit", value: "Hero"});
	this._list = [];

	this.races = [
		RPG.Races.Human, 
		RPG.Races.Orc, 
		RPG.Races.Elf, 
		RPG.Races.Dwarf
	];
	
	this.professions = [
		RPG.Professions.Adventurer,
		RPG.Professions.Warrior,
		RPG.Professions.Archer,
		RPG.Professions.Wizard
	];
}

RPG.CharGen.prototype.build = function() {
	var w = OZ.DOM.win()[0];
	var d = OZ.DOM.elm("div", {width:Math.round(w/2) + "px"});
	var p1 = OZ.DOM.elm("p");
	p1.innerHTML = "Who do you want to play in this game?";
	var p2 = OZ.DOM.elm("p", {className: "name"});
	p2.innerHTML = "Your name: ";
	p2.appendChild(this._name);



	var t = OZ.DOM.elm("table", {className:"chargen"});
	var tb = OZ.DOM.elm("tbody");
	t.appendChild(tb);
	
	/* right part with race/profession selection */
	this._buildMatrix(tb);
	
	OZ.Event.add(t, "click", this.bind(this._click));
	
	OZ.DOM.append([d, p1, p2, t]);
	return d;
}

RPG.CharGen.prototype._buildMatrix = function(tb) {
	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);
	var empty = OZ.DOM.elm("td");
	tr.appendChild(empty);
	
	/* race labels */
	for (var i=0;i<this.races.length;i++) {
		var td = OZ.DOM.elm("td");
		td.innerHTML = this.races[i].label.capitalize();
		tr.appendChild(td);
	}
	
	for (var i=0;i<this.professions.length;i++) {
		var profCtor = this.professions[i];
		
		tr = OZ.DOM.elm("tr");
		tb.appendChild(tr);
		
		/* profession label */
		var td = OZ.DOM.elm("td");
		td.innerHTML = profCtor.label.capitalize();
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
	if (!this._name.value) {
		this._name.focus();
		return;
	}

	var t = OZ.Event.target(e);
	if (t.nodeName.toLowerCase() != "img") { return; }
	for (var i=0;i<this._list.length;i++) {
		var item = this._list[i];
		if (item[0] == t) {
			this.dispatch("chargen", {race: item[1], profession: item[2], name:this._name.value});
		}
	}
}
