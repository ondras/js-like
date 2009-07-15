/**
 * @class Map switcher 
 */
RPG.UI.Mapswitch = OZ.Class();

RPG.UI.Mapswitch.prototype.init = function(ul) {
	this._ul = ul;
	this._map = {
		"ASCII": RPG.UI.ASCIIMap,
		"Graphics": RPG.UI.ImageMap
	}
	
	var def = false;
	for (var p in this._map) {
		var li = OZ.DOM.elm("li");
		var a = OZ.DOM.elm("a", {href:"#"});
		OZ.DOM.append([ul, li], [li, a]);
		a.innerHTML = p;
		
		if (this._map[p] == RPG.UI.ASCIIMap) { def = a; }
	}
	
	OZ.Event.add(ul, "click", this.bind(this._click));
	
	this._use(def);
}

RPG.UI.Mapswitch.prototype._click = function(e) { 
	OZ.Event.prevent(e);
	var target = OZ.Event.target(e);
	this._use(target);
}

RPG.UI.Mapswitch.prototype._use = function(target) { 
	var ctor = this._map[target.innerHTML];

	/* clear old */
	var c = OZ.$("map");
	OZ.DOM.clear(c);
	
	/* create new */
	var div = OZ.DOM.elm("div");
	c.appendChild(div);
	RPG.UI.map = new ctor(div);

	/* adjust */
	if (RPG.World.getMap()) { RPG.World.getPC().mapMemory().updateComplete(); }

	/* add class */
	var as = this._ul.getElementsByTagName("a");
	for (var i=0;i<as.length;i++) { as[i].className = ""; }
	target.className = "active";
}
