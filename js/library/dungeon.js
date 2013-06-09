/**
 * @class Floor
 * @augments RPG.Cells.BaseCell
 */
RPG.Cells.Corridor = OZ.Singleton().extend(RPG.Cells.BaseCell);
RPG.Cells.Corridor.visual = { desc:"floor section", ch:".", image:"corridor", color:"#ccc" };

/**
 * @class Road
 * @augments RPG.Cells.BaseCell
 */
RPG.Cells.Road = OZ.Singleton().extend(RPG.Cells.BaseCell);
RPG.Cells.Road.visual = { desc:"road", ch:".", image:"road", color:"#963" };

/**
 * @class Grass
 * @augments RPG.Cells.BaseCell
 */
RPG.Cells.Grass = OZ.Singleton().extend(RPG.Cells.BaseCell);
RPG.Cells.Grass.visual = { desc:"grass", ch:".", image:"grass", color:"#693" };

/**
 * @class Water
 * @augments RPG.Cells.BaseCell
 */
RPG.Cells.Water = OZ.Singleton().extend(RPG.Cells.BaseCell);
RPG.Cells.Water.visual = { desc:"water", ch:"=", image:"water", color:"#009" };
RPG.Cells.Water.prototype.init = function() {
	this.parent();
	this._water = true;
}

RPG.Cells.Water.prototype.entering = function(being) {
	var canSee = RPG.Game.pc.canSee(being.getCoords());
	if (canSee) {
		var verb = RPG.Misc.verb("wade", being);
		var s = RPG.Misc.format("Splash Splash! %A %s into the water.", being, verb);
		RPG.UI.buffer.message(s);	
	} else {
		RPG.UI.buffer.message("You hear some splashing.");
	}
}

/**
 * @class Deep Water
 * @augments RPG.Cells.BaseCell
 */
RPG.Cells.DeepWater = OZ.Singleton().extend(RPG.Cells.Water);
RPG.Cells.DeepWater.visual = { desc:"deep water", ch:"~", image:"deepwater", color:"#009" };
RPG.Cells.DeepWater.prototype._blocks = RPG.BLOCKS_MOVEMENT;


/**
 * @class Wall
 * @augments RPG.Cells.BaseCell
 */
RPG.Cells.Wall = OZ.Singleton().extend(RPG.Cells.BaseCell);
RPG.Cells.Wall.visual = { desc:"solid wall", ch:"#", image:"wall", color:"#666" };
RPG.Cells.Wall.prototype._blocks = RPG.BLOCKS_LIGHT;

/**
 * @class Fake wall
 * @augments RPG.Cells.Wall
 */
RPG.Cells.Wall.Fake = OZ.Singleton().extend(RPG.Cells.Wall);
RPG.Cells.Wall.Fake.prototype.init = function() {
	this.parent();
	this._fake = true;
}

/**
 * @class Tree
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Tree = OZ.Class().extend(RPG.Features.BaseFeature);
RPG.Features.Tree.visual = { desc:"tree", ch:"T", image:"tree", color:"#093" }
RPG.Features.Tree.prototype._blocks = RPG.BLOCKS_ITEMS;

/**
 * @class Altar feature
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Altar = OZ.Class().extend(RPG.Features.BaseFeature);
RPG.Features.Altar.visual = { desc:"altar", image:"altar", ch:"\u00B1", color:"#fff"};

/**
 * @class Bench feature
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Bench = OZ.Class().extend(RPG.Features.BaseFeature);
RPG.Features.Bench.visual = { desc:"bench", image:"bench", ch:"|", color:"#963"};
RPG.Features.Bench.prototype._blocks = RPG.BLOCKS_MOVEMENT;

/**
 * @class Signpost feature
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Signpost = OZ.Class().extend(RPG.Features.BaseFeature);
RPG.Features.Signpost.visual = { image:"signpost", ch:"\u2142", color:"#666"};
RPG.Features.Signpost.prototype.init = function(label) {
	this.parent();
	this._label = label;
}
RPG.Features.Signpost.prototype.describe = function() {
	return "signpost labeled '" + this._label + "'";
}

/**
 * @class Generic trap
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Trap = OZ.Class().extend(RPG.Features.BaseFeature);
RPG.Features.Trap.factory.frequency = 0;
RPG.Features.Trap.visual = { ch:"^" }
RPG.Features.Trap.prototype.init = function() {
	this.parent();
	this._damage = null;
}

RPG.Features.Trap.prototype.entering = function(being) {
	this.parent(being);
	being.trapEncounter(this);
}

RPG.Features.Trap.prototype.setOff = function(being) {
}

RPG.Features.Trap.prototype.getDamage = function() {
	return this._damage;
}

/**
 * @class Teleport trap
 * @augments RPG.Features.Trap
 */
RPG.Features.Trap.Teleport = OZ.Class().extend(RPG.Features.Trap);
RPG.Features.Trap.Teleport.visual = { desc:"teleport trap", image:"trap-teleport", color:"#3c3" }

RPG.Features.Trap.Teleport.prototype.setOff = function(being) {
	var c = this._map.getFreeCoords();
	being.teleport(c);
}

/**
 * @class Pit trap
 * @augments RPG.Features.Trap
 */
RPG.Features.Trap.Pit = OZ.Class().extend(RPG.Features.Trap);
RPG.Features.Trap.Pit.visual = { desc:"pit trap", image:"trap-pit", color:"#963" }

RPG.Features.Trap.Pit.prototype.init = function() {
	this.parent();
	this._damage = new RPG.RandomValue(3, 1);
}

RPG.Features.Trap.Pit.prototype.setOff = function(being) {
	var canSee = RPG.Game.pc.canSee(this._coords);

	if (canSee) {
		var verb = RPG.Misc.verb("fall", being);
		var s = RPG.Misc.format("%A %s into a pit!", being, verb);
		RPG.UI.buffer.message(s);
	}

	var dmg = RPG.Rules.getTrapDamage(being, this);
	being.adjustStat(RPG.STAT_HP, -dmg);
	
	if (!being.isAlive() && canSee && being != RPG.Game.pc) {
		var s = RPG.Misc.format("%The suddenly collapses!", being);
		RPG.UI.buffer.message(s);
	}

}

/**
 * @class Flash trap
 * @augments RPG.Features.Trap
 */
RPG.Features.Trap.Flash = OZ.Class().extend(RPG.Features.Trap);
RPG.Features.Trap.Flash.visual = { desc:"flash trap", image:"trap-flash", color:"#ff0" }

RPG.Features.Trap.Flash.prototype.setOff = function(being) {
	var canSee = RPG.Game.pc.canSee(this._coords);

	var blindness = new RPG.Effects.Blindness(5);
	being.addEffect(blindness);

	if (canSee) {
		var s = RPG.Misc.format("%A %is blinded by a light flash!", being);
		RPG.UI.buffer.message(s);
	}
}

/**
 * @class Abstract destroyable feature
 * @augments RPG.Features.BaseFeature
 * @augments RPG.Features.IDamageReceiver
 */
RPG.Features.Destroyable = OZ.Class().extend(RPG.Features.BaseFeature)
			 	     .implement(RPG.Misc.IDamageReceiver);

RPG.Features.Destroyable.factory.frequency = 0;
RPG.Features.Destroyable.prototype.damage = function(amount) {
	this._hp -= amount;
	if (!this.isAlive()) { this._destroy(); }
}
RPG.Features.Destroyable.prototype.isAlive = function() {
	return this._hp > 0;
}

/**
 * This being just destroyed this feature
 * @param {RPG.Beings.BaseBeing} being
 */
RPG.Features.Destroyable.prototype._destroy = function() {
	this._map.setFeature(null, this._coords); 
}

/**
 * @class Tombstone feature
 * @augments RPG.Features.Destroyable
 */
RPG.Features.Tombstone = OZ.Class().extend(RPG.Features.Destroyable);
RPG.Features.Tombstone.visual = { desc:"tombstone", image:"tombstone", ch:"\u2020", color:"#666"};
RPG.Features.Tombstone.prototype._blocks = RPG.BLOCKS_MOVEMENT;
RPG.Features.Tombstone.prototype.init = function() {
	this.parent();
	this._hp = 4;
}
RPG.Features.Tombstone.prototype._destroy = function() {
	this.parent();
	var undead = RPG.Factories.undead.getInstance(this._map.getDanger());
	RPG.Game.getEngine().addActor(undead);
	this._map.setBeing(undead, this._coords);
}

/**
 * @class Door
 * @augments RPG.Features.Destroyable
 */
RPG.Features.Door = OZ.Class().extend(RPG.Features.Destroyable);
RPG.Features.Door.visual = { color:"#963" }
RPG.Features.Door.prototype.init = function() {
	this.parent();
	this._hp = 4;
	this._closed = null;
	this._locked = null;
	this.open();
}

RPG.Features.Door.prototype.getVisualProperty = function(name) {
	var result = this.parent(name);
	if (this._closed) {
		var data = {
			ch: "+",
			desc: "closed door",
			image: "door-closed"
		};
	} else {
		var data = {
			ch: "/",
			desc: "open door",
			image: "door-open"
		};
	}
	return data[name] || this.parent(name);
}

RPG.Features.Door.prototype.lock = function() {
	this.close();
	this._locked = true;
	return this;
}

RPG.Features.Door.prototype.close = function() {
	this._closed = true;
	this._locked = false;
	this._blocks = RPG.BLOCKS_LIGHT;
	if (this._map && this._map.isActive() && RPG.Game.pc.canSee(this._coords)) { 
		RPG.Game.pc.coordsChanged(this._coords);
		RPG.Game.pc.updateVisibility(); 
	}
	return this;
}

RPG.Features.Door.prototype.open = function() {
	this._closed = false;
	this._locked = false;
	this._blocks = RPG.BLOCKS_NOTHING;
	if (this._map && this._map.isActive() && RPG.Game.pc.canSee(this._coords)) { 
		RPG.Game.pc.coordsChanged(this._coords);
		RPG.Game.pc.updateVisibility(); 
	}
	return this;
}

RPG.Features.Door.prototype.unlock = function() {
	this._locked = false;
	return this;
}

RPG.Features.Door.prototype.isClosed = function() {
	return this._closed;
}

RPG.Features.Door.prototype.isLocked = function() {
	return this._locked;
}
RPG.Features.Door.prototype._destroy = function() {
	this.parent();
	if (RPG.Game.pc.canSee(this._coords)) { RPG.Game.pc.updateVisibility(); }
}

/**
 * @class Stained glass window, random shiny color. When destroyed, damages stuff around.
 * @augments RPG.Features.Destroyable
 * @augments RPG.Features.IActor
 * @augments RPG.Features.IDamageDealer
 */
RPG.Features.StainedGlassWindow = OZ.Class().extend(RPG.Features.Destroyable)
					    .implement(RPG.IActor)
					    .implement(RPG.Misc.IDamageDealer);

RPG.Features.StainedGlassWindow.visual = { desc:"stained glass window", image:"stained-glass-window", ch:"=" };
RPG.Features.StainedGlassWindow.prototype._blocks = RPG.BLOCKS_MOVEMENT;
RPG.Features.StainedGlassWindow.prototype._hit = new RPG.RandomValue(8, 5);
RPG.Features.StainedGlassWindow.prototype._damage = new RPG.RandomValue(2, 1);
RPG.Features.StainedGlassWindow.prototype.init = function() { 
	this.parent();
	this._hp = 3;
	this._color = ["red","green","blue","yellow","magenta","cyan"].random(); 
}
RPG.Features.StainedGlassWindow.prototype.getColor = function() { 
	return this._color;
}
RPG.Features.StainedGlassWindow.prototype._destroy = function() {
	this.parent();
	RPG.Game.getEngine().addActor(this);
}
/**
 * @see RPG.IActor#getSpeed
 */
RPG.Features.StainedGlassWindow.prototype.getSpeed = function() {
	return 1/0;
}
/**
 * @see RPG.IActor#yourTurn
 * Damage surrounding beings
 */
RPG.Features.StainedGlassWindow.prototype.yourTurn = function() {
	var coords = this._map.getCoordsInCircle(this._coords, 1);
	for (var i=0;i<coords.length;i++) {
		var b = this._map.getBeing(coords[i]);
		if (!b) { continue; }
		var combat = new RPG.Combat(this, b).execute();
		
		if (!combat.wasHit()) {
			var verb = RPG.Misc.verb("evade", b);
			var s = RPG.Misc.format("%The %s the falling glass.", b, verb);
			RPG.UI.buffer.message(s);
			continue;
		}
		
		var verb = (combat.wasKill() ? "killed" : "wounded");
		var s = RPG.Misc.format("%The %is %s by the falling glass!", b, b, verb);
		RPG.UI.buffer.message(s);
	}

	RPG.Game.getEngine().removeActor(this);
	return RPG.ACTION_TIME;
}


/**
 * @class Basic level connector
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Connector = OZ.Class().extend(RPG.Features.BaseFeature);

RPG.Features.Connector.prototype.init = function() {
	this.parent();
	this._target = null;
}

RPG.Features.Connector.prototype.enter = function(being) {
	var target = this.getTarget();

	if (target) { /* move being to other map */
		var map = target.getMap();
		var coords = target.getCoords();
		map.setBeing(being, coords);
		return RPG.ACTION_TIME;
	} else {
		return RPG.ACTION_NO_TIME;
	}
}

/**
 * @param {RPG.Features.Connector} target
 */
RPG.Features.Connector.prototype.setTarget = function(target) {
	this._target = target;
	return this;
}

/**
 * @returns {RPG.Features.Connector || null}
 */
RPG.Features.Connector.prototype.getTarget = function() {
	if (!this._target) { RPG.Game.getStory().staircaseCallback(this); }/* ask story to generate some */
	return this._target;
}

/**
 * @class Connector in "down" direction
 * @augments RPG.Features.Connector
 */
RPG.Features.Connector.Entry = OZ.Class().extend(RPG.Features.Connector);
RPG.Features.Connector.Entry.visual = { ch:">" };

/**
 * @class Connector in "up" direction
 * @augments RPG.Features.Connector
 */
RPG.Features.Connector.Exit = OZ.Class().extend(RPG.Features.Connector);
RPG.Features.Connector.Exit.visual = { ch:"<" };

/**
 * @class Staircase down
 * @augments RPG.Features.Connector.Entry
 */
RPG.Features.StaircaseDown = OZ.Class().extend(RPG.Features.Connector.Entry);
RPG.Features.StaircaseDown.visual = { desc:"staircase leading down", image:"staircase-down", color:"#ccc" }

/**
 * @class Staircase up
 * @augments RPG.Features.Connector.Exit
 */
RPG.Features.StaircaseUp = OZ.Class().extend(RPG.Features.Connector.Exit);
RPG.Features.StaircaseUp.visual = { desc:"staircase leading up", image:"staircase-up", color:"#ccc" }

/**
 * @class Road in "up" direction
 * @augments RPG.Features.Connector
 */
RPG.Features.RoadExit = OZ.Class().extend(RPG.Features.Connector.Exit);
RPG.Features.RoadExit.visual = { desc:"road leading away", image:"road-away", color:"#963" };

/**
 * @class Road in "down" direction
 * @augments RPG.Features.Connector
 */
RPG.Features.RoadEntry = OZ.Class().extend(RPG.Features.Connector.Entry);
RPG.Features.RoadEntry.visual = { desc:"road leading further", image:"road-further", color:"#963" };

/**
 * @class Set of cells with tutorial messages
 * @augments RPG.Areas.BaseArea
 */
RPG.Areas.Tutorial = OZ.Class().extend(RPG.Areas.BaseArea);
RPG.Areas.Tutorial.prototype._messages = {};
RPG.Areas.Tutorial.prototype.init = function() {
	this.parent();
	this._visited = {};
}
RPG.Areas.Tutorial.prototype.getCoords = function() {
	var all = [];
	for (var p in this._messages) { 
		if (p in this._visited) { continue; }
		all.push(RPG.Coords.fromString(p)); 
	}
	return all;
}

RPG.Areas.Tutorial.prototype.entering = function(being) {
	this.parent(being);
	if (being != RPG.Game.pc) { return; }
	var id = being.getCoords().toString();
	
	if (id in this._visited) { return; } /* already seen */
	
	/* showing tutorial for the first time? */
	var first = true;
	for (var p in this._visited) { first = false; }
	
	if (first) {
		var text = this._messages[id];
		text += "<br/><br/>";
		text += "Do you want to continue seeing these tutorial tips?";
		
		var yes = function() { /* want to see */
			this._visited[id] = 1;
		}
		
		var no = function() { /* do not want to see, mark all as visited */
			for (var id in this._messages) { this._visited[id] = 1; }
		}
		
		RPG.UI.confirm(text, "Tutorial", yes.bind(this), no.bind(this));
		
	} else {
		this._visited[id] = 1;
		RPG.UI.alert(this._messages[id], "Tutorial");
	}
}

/**
 * @class Shop area
 * @augments RPG.Areas.Room
 */
RPG.Areas.Shop = OZ.Class().extend(RPG.Areas.Room);
RPG.Areas.Shop.prototype.init = function(corner1, corner2) {
	this.parent(corner1, corner2);
	this._modifiers[RPG.FEAT_MAX_MANA] = -1e6; /* in shops, there is no mana .) */
	this._door = null;
	this._welcome = "You entered a shop.";
}

RPG.Areas.Shop.prototype.setMap = function(map) {
	this.parent(map);

	var c = new RPG.Coords(0, 0);
	for (var i=this._corner1.x-1; i<=this._corner2.x+1; i++) {
		for (var j=this._corner1.y-1; j<=this._corner2.y+1; j++) {
			if (i >= this._corner1.x && i <= this._corner2.x && j >= this._corner1.y && j <= this._corner2.y) { continue; }
			c.x = i;
			c.y = j;
			if (this._map.blocks(RPG.BLOCKS_MOVEMENT, c)) { continue; }
			
			if (this._door) { throw new Error("Shop cannot have >1 doors"); }
			this._door = c.clone();
		}
	}
	
	if (!this._door) { throw new Error("Shop without doors"); }
}

RPG.Areas.Shop.prototype.getDoor = function() {
	return this._door;
}

RPG.Areas.Shop.prototype.setShopkeeper = function(being) {
	this._map.setBeing(being, this._door);
	var ai = new RPG.AI.Shopkeeper(being, this);
	being.setAI(ai);
}

