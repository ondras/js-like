/**
 * @class Map switcher 
 */
RPG.UI.Mapswitch = OZ.Class();

RPG.UI.Mapswitch.prototype.init = function(ul) {
	OZ.$("map").style.fontFamily = RPG.UI.font;
	
	var def = (OZ.DOM.elm("canvas").getContext ? RPG.UI.CanvasMap : RPG.UI.ASCIIMap);
	this._map = {
		"ASCII": RPG.UI.ASCIIMap,
		"Graphics": RPG.UI.ImageMap,
		"Canvas": RPG.UI.CanvasMap
	}
	
	var li = OZ.DOM.elm("li", {id:"mapswitch", innerHTML: "Map style"});
	this._content = OZ.DOM.elm("div");
	OZ.DOM.append([ul, li], [li, this._content]);
	var link = false;

	for (var p in this._map) {
		var a = OZ.DOM.elm("a", {href:"#", innerHTML:p});
		this._content.appendChild(a);
		
		if (this._map[p] == def) { link = a; }
	}
	
	OZ.Event.add(this._content, "click", this.bind(this._click));
	this._use(link);
}

RPG.UI.Mapswitch.prototype._click = function(e) { 
	OZ.Event.prevent(e);
	var target = OZ.Event.target(e);
	target.blur();
	this._use(target);
}

RPG.UI.Mapswitch.prototype._use = function(target) { 
	var ctor = this._map[target.innerHTML];

	/* clear old */
	if (RPG.UI.map) { RPG.UI.map.destroy(); }
	
	/* create new */
	RPG.UI.map = new ctor(OZ.$("map"));

	/* adjust */
	if (RPG.Game.pc) { RPG.Game.pc.updateFromMemory(); }

	/* add class */
	var as = this._content.getElementsByTagName("a");
	for (var i=0;i<as.length;i++) { as[i].className = ""; }
	target.className = "active";
}
