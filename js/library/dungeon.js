/**
 * @class Floor
 * @augments RPG.Cells.BaseCell
 */
RPG.Cells.Corridor = OZ.Singleton().extend(RPG.Cells.BaseCell);
RPG.Cells.Corridor.visual = { desc:"floor section", ch:".", image:"corridor", color:"#ccc" };

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

/**
 * @class Wall
 * @augments RPG.Cells.BaseCell
 */
RPG.Cells.Wall = OZ.Singleton().extend(RPG.Cells.BaseCell);
RPG.Cells.Wall.visual = { desc:"solid wall", ch:"#", image:"wall", color:"#666" };
RPG.Cells.Wall.prototype.init = function() {
	this.parent();
	this._blocks = RPG.BLOCKS_LIGHT;
}

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
RPG.Features.Tree.prototype.init = function() {
	this.parent();
	this._blocks = RPG.BLOCKS_MOVEMENT;
}

/**
 * @class Door
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Door = OZ.Class().extend(RPG.Features.BaseFeature);
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

/**
 * Do a damage to this door. 
 * @param {int} amount
 * @returns {bool} Whether this door still stands
 */
RPG.Features.Door.prototype.damage = function(amount) {
	this._hp -= amount;
	if (this._hp <= 0) { 
		this._map.setFeature(null, this._coords); 
		if (this._map.isActive() && RPG.Game.pc.canSee(this._coords)) { RPG.Game.pc.updateVisibility(); }
	}
	return (this._hp > 0);
}

/**
 * @class Generic trap
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Trap = OZ.Class().extend(RPG.Features.BaseFeature);
RPG.Features.Trap.factory.ignore = true;
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
RPG.Features.Trap.Teleport.visual = { desc:"pit trap", image:"trap-pit", color:"#963" }

RPG.Features.Trap.Pit.prototype.init = function() {
	this.parent();
	this._damage = new RPG.Misc.RandomValue(3, 1);
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
 * @class Staircase leading up/down
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Staircase = OZ.Class().extend(RPG.Features.BaseFeature);
RPG.Features.Staircase.visual = { color:"#ccc" }
RPG.Features.Staircase.prototype.init = function() {
	this.parent();
	this._target = null;
}

RPG.Features.Staircase.prototype.enter = function(being) {
	var target = this.getTarget();

	if (target) { /* switch maps */
		var map = target.getMap();
		var coords = target.getCoords();
		map.setBeing(being, coords);
		return RPG.ACTION_TIME;
	} else {
		return being.wait();
	}
}

/**
 * @param {RPG.Features.Staircase} target
 */
RPG.Features.Staircase.prototype.setTarget = function(target) {
	this._target = target;
	return this;
}

/**
 * @returns {RPG.Features.Staircase || null}
 */
RPG.Features.Staircase.prototype.getTarget = function() {
	if (!this._target) { RPG.Game.getStory().staircaseCallback(this); }/* ask story to generate some */
	return this._target;
}

/**
 * Staircase down
 * @augments RPG.Features.Staircase
 */
RPG.Features.Staircase.Down = OZ.Class().extend(RPG.Features.Staircase);
RPG.Features.Staircase.Down.visual = { desc:"staircase leading down", image:"staircase-down", ch:">" }

/**
 * Staircase up
 * @augments RPG.Features.Staircase
 */
RPG.Features.Staircase.Up = OZ.Class().extend(RPG.Features.Staircase);
RPG.Features.Staircase.Up.visual = { desc:"staircase leading up", image:"staircase-up", ch:"<" }

/**
 * @class Set of cells with tutorial messages
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
		all.push(RPG.Misc.Coords.fromString(p)); 
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
		text += "\n\n";
		text += "Do you want to continue seeing these tutorial tips?\n\n";
		var result = RPG.UI.confirm(text);
		if (result) { /* want to see */
			this._visited[id] = 1;
		} else { /* do not want to see, mark all as visited */
			for (var id in this._messages) { this._visited[id] = 1; }
		}
		
	} else {
		RPG.UI.alert(this._messages[id] + "\n\n");
		this._visited[id] = 1;
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

	var c = new RPG.Misc.Coords(0, 0);
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

