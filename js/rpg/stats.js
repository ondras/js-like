RPG.Stats = {};
RPG.Stats.server = "";

RPG.Stats.NEW	= 0;
RPG.Stats.SAVE	= 1;
RPG.Stats.DEATH	= 2;
RPG.Stats.END	= 3;

RPG.Stats.send = function(event) {
	if (!this.server) { return; }
	
	var data = {
		score: RPG.Game.getStory().computeScore(),
		name: RPG.Game.pc.getName(),
		event: event
	}
	
	var arr = [];
	for (var p in data) { arr.push(encodeURIComponent(p)+"="+encodeURIComponent(data[p])); }
	var url = this.server + "/save?" + arr.join("&");
	var img = OZ.DOM.elm("img", {src:url});
	document.body.appendChild(img);
}
