RPG.UI.status = {
	updateFeat: function() {},
	updateStat: function() {},
	updateMap:  function() {}
}
RPG.UI.refocus = function() {};
RPG.UI.map = {
	resize: function() {},
	drawAtCoords: function() {}
}
RPG.Game = {
	pc: {
		coordsChanged:function(){}
	},
	getEngine: function() { return {useMap:function(){}}; }
}

var Dungeon = OZ.Class();

Dungeon.prototype.init = function(generator, container, link) {
	this._generator = generator;
	this._container = container;
	OZ.Event.add(link, "click", this._refresh.bind(this));
	OZ.Event.add(container, "click", this._click.bind(this));
	this._generate();
}

Dungeon.prototype._generate = function() {
	var size = new RPG.Coords(79, 25);
	this._current = null;
	this._map = this._generator.getInstance().generate("", size, 1);
	this._addDoors();
	this._redraw();
}

Dungeon.prototype._refresh = function(e) {
	OZ.Event.prevent(e);
	this._generate();
}

Dungeon.prototype._click = function(e) {
	var t = OZ.Event.target(e);
	if (t.nodeName.toLowerCase() != "span") { return; }
	
	var x = parseInt(t.getAttribute("data-x"));
	var y = parseInt(t.getAttribute("data-y"));
	this._current = new RPG.Coords(x, y);
	this._redraw();
}

Dungeon.prototype._redraw = function() {
	var visible = {};
	if (this._current) {
		var pc = new RPG.Beings.PC(RPG.Races.BaseRace, RPG.Professions.BaseProfession);
		this._map.setBeing(pc, this._current);
		pc.updateVisibility();
		visible = pc.getVisibleCoords();
	}
	
	var span = OZ.DOM.elm("span", {innerHTML:"&nbsp;"});
	this._container.appendChild(span);
	var width = span.offsetWidth;
	var height = span.offsetHeight;
	OZ.DOM.clear(this._container);
	
	var size = this._map.getSize();
	var tmp = size.clone();
	this._container.style.width = (size.x*width)+"px";
	this._container.style.height = (size.y*height)+"px";
	
	for (var i=0;i<size.x;i++) {
		for (var j=0;j<size.y;j++) {
			tmp.x = i;
			tmp.y = j;
			var cell = this._map.getFeature(tmp) || this._map.getCell(tmp);
			if (!cell) { continue; }
			
			var left = width * i;
			var top = height * j;
			span = OZ.DOM.elm("span", {position:"absolute", left:left+"px", top:top+"px"});
			span.setAttribute("data-x", i);
			span.setAttribute("data-y", j);
			var visual = RPG.Visual.getVisual(cell);

			span.innerHTML = visual.ch;
			span.style.color = visual.color;
			if (tmp.x+","+tmp.y in visible) { span.className = "visible"; }
			if (this._current && this._current.x == tmp.x && this._current.y == tmp.y) { span.className = "current"; }
			
			this._container.appendChild(span);
		}
	}
}
	
Dungeon.prototype._addDoors = function() {
	var rooms = this._map.getRooms();
	var o = {
		closed: 0,
		fakeDoors: 0,
		fakeCorridors: 0
	}
	for (var i=0;i<rooms.length;i++) {
		RPG.Decorators.Doors.getInstance().decorate(this._map, rooms[i], o);
	}
}

var Scheduler = OZ.Class();
Scheduler.prototype.init = function(container, link) {
	this._container = container;
	this._scheduler = new RPG.Scheduler();
	OZ.Event.add(link, "click", this._refresh.bind(this));
	this._generate();

	setInterval(this._tick.bind(this), 150);
}

Scheduler.prototype._refresh = function(e) {
	OZ.Event.prevent(e);
	this._generate();
}

Scheduler.prototype._generate = function() {
	OZ.DOM.clear(this._container);
	this._scheduler.clearActors();
	
	for (var i=0;i<5;i++) {
		var speed = 20 + Math.round(Math.random()*250);
		this._addActor(i, speed);
	}
}

Scheduler.prototype._addActor = function(index, speed) {
	var node = OZ.DOM.elm("div", {className:"actor"});
	node.innerHTML = "<span class='label'>Actor #" + (index+1) + " (speed " + speed + ")</span>";
	var obj = {
		getSpeed: function() { return speed; },
		node: node
	}
	this._container.appendChild(node);
	this._scheduler.addActor(obj);
}

Scheduler.prototype._tick = function() {
	var actor = this._scheduler.scheduleActor();
	this._act(actor);
}

Scheduler.prototype._act = function(actor) {
	var node = actor.node;
	var step = OZ.DOM.elm("span", {className:"step"});
	var limit = 51;
	if (node.childNodes.length > limit) { 
		while (node.childNodes.length > 1) { node.removeChild(node.childNodes[1]); }
	}
	node.appendChild(step);
}


new Dungeon(RPG.Generators.Uniform, OZ.$("uniform"), OZ.$("uniform-refresh"));
new Dungeon(RPG.Generators.Digger, OZ.$("digger"), OZ.$("digger-refresh"));
new Dungeon(RPG.Generators.DividedMaze, OZ.$("divided"), OZ.$("divided-refresh"));
new Dungeon(RPG.Generators.IceyMaze, OZ.$("icey"), OZ.$("icey-refresh"));
new Dungeon(RPG.Generators.Maze, OZ.$("maze"), OZ.$("maze-refresh"));
var s = new Scheduler(OZ.$("scheduler"), OZ.$("scheduler-refresh"));
