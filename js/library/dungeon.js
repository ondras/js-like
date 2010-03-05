/**
 * @class Floor
 * @augments RPG.Cells.BaseCell
 */
RPG.Cells.Corridor = OZ.Class().extend(RPG.Cells.BaseCell);
RPG.Cells.Corridor.prototype.init = function() {
	this.parent();
	this._description = "floor section";
	this._char = ".";
	this._image = "corridor";
	this._color = "silver";
}

/**
 * @class Grass
 * @augments RPG.Cells.BaseCell
 */
RPG.Cells.Grass = OZ.Class().extend(RPG.Cells.BaseCell);
RPG.Cells.Grass.prototype.init = function() {
	this.parent();
	this._description = "grass";
	this._char = ".";
	this._image = "grass";
	this._color = "OliveDrab";
}

/**
 * @class Water
 * @augments RPG.Cells.BaseCell
 */
RPG.Cells.Water = OZ.Class().extend(RPG.Cells.BaseCell);
RPG.Cells.Water.prototype.init = function() {
	this.parent();
	this._description = "water";
	this._char = "=";
	this._image = "water";
	this._color = "darkblue";
}

/**
 * @class Wall
 * @augments RPG.Cells.BaseCell
 */
RPG.Cells.Wall = OZ.Class().extend(RPG.Cells.BaseCell);
RPG.Cells.Wall.prototype.init = function() {
	this.parent();
	this._description = "solid wall";
	this._char = "#";
	this._image = "wall";
	this._color = "dimgray";
	this._type = RPG.BLOCKS_LIGHT;
}

/**
 * @class Fake wall
 * @augments RPG.Cells.Wall
 */
RPG.Cells.Wall.Fake = OZ.Class().extend(RPG.Cells.Wall);

RPG.Cells.Wall.Fake.prototype.init = function(cell) {
	this.parent();
	this._cell = cell;
}

RPG.Cells.Wall.Fake.prototype.getRealCell = function() {
	return this._cell;
}

/**
 * @class Tree
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Tree = OZ.Class().extend(RPG.Features.BaseFeature);
RPG.Features.Tree.prototype.init = function() {
	this.parent();
	this._image = "tree";
	this._char = "T";
	this._color = "green";
	this._description = "tree";
	this._type = RPG.BLOCKS_MOVEMENT;
}

/**
 * @class Door
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Door = OZ.Class().extend(RPG.Features.BaseFeature);
RPG.Features.Door.prototype.init = function() {
	this.parent();
	this._hp = 4;
	this._closed = null;
	this._locked = null;
	this._color = "sienna";
	this.open();
}

RPG.Features.Door.prototype.lock = function() {
	this.close();
	this._locked = true;
}

RPG.Features.Door.prototype.close = function() {
	this._closed = true;
	this._locked = false;
	
	this._type = RPG.BLOCKS_LIGHT;
	
	this._description = "closed door";
	this._image = "door-closed";
	this._char = "+";
}

RPG.Features.Door.prototype.open = function() {
	this._closed = false;
	this._locked = false;
	
	this._type = RPG.BLOCKS_NOTHING;
	
	this._description = "open door";
	this._image = "door-open";
	this._char = "/";
}

RPG.Features.Door.prototype.unlock = function() {
	this._locked = false;
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
	if (this._hp <= 0) { this._cell.setFeature(null); }
	return (this._hp > 0);
}

/**
 * @class Generic trap
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Trap = OZ.Class().extend(RPG.Features.BaseFeature);
RPG.Features.Trap.factory.ignore = true;
RPG.Features.Trap.prototype.init = function() {
	this.parent();
	this._char = "^";
	this._damage = null;
}

RPG.Features.Trap.prototype.knowsAbout = function(being) {
	return being.knowsTrap(this);
}

RPG.Features.Trap.prototype.entered = function(being) {
	being.trapEncounter(this);
}

RPG.Features.Trap.prototype.setOff = function() {
}

RPG.Features.Trap.prototype.getDamage = function() {
	return this._damage;
}

/**
 * @class Teleport trap
 * @augments RPG.Features.Trap
 */
RPG.Features.Trap.Teleport = OZ.Class().extend(RPG.Features.Trap);

RPG.Features.Trap.Teleport.prototype.init = function() {
	this.parent();
	
	this._color = "limegreen";
	this._image = "trap-teleport";
	this._description = "teleport trap";
}

RPG.Features.Trap.Teleport.prototype.setOff = function(e) {
	var c = this._cell.getMap().getFreeCell();
	this._cell.getBeing().teleport(c);
}

/**
 * @class Pit trap
 * @augments RPG.Features.Trap
 */
RPG.Features.Trap.Pit = OZ.Class().extend(RPG.Features.Trap);

RPG.Features.Trap.Pit.prototype.init = function() {
	this.parent();
	
	this._damage = new RPG.Misc.RandomValue(3, 1);

	this._color = "sienna";
	this._image = "trap-pit";
	this._description = "pit trap";
}

RPG.Features.Trap.Pit.prototype.setOff = function() {
	var canSee = RPG.Game.pc.canSee(this._cell);
	var being = this._cell.getBeing();

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
 * @class Staircase leading up/down
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Staircase = OZ.Class().extend(RPG.Features.BaseFeature);

RPG.Features.Staircase.prototype.init = function() {
	this.parent();
	this._color = "silver";
	this._target = null;
}

RPG.Features.Staircase.prototype.enter = function(being) {
	var cell = this.getTarget();

	if (cell) {	
		/* switch maps */
		var map = cell.getMap();
		return RPG.Game.setMap(map, cell);
	} else {
		return being.wait();
	}
}

RPG.Features.Staircase.prototype.setTarget = function(cell) {
	this._target = cell;
}

/**
 * @returns {RPG.Cells.BaseCell}
 */
RPG.Features.Staircase.prototype.getTarget = function() {
	if (!this._target) { 
		this._target = RPG.Game.getStory().staircaseCallback(this);
	}
	return this._target;
}

/**
 * Staircase down
 * @augments RPG.Features.Staircase
 */
RPG.Features.Staircase.Down = OZ.Class().extend(RPG.Features.Staircase);
RPG.Features.Staircase.Down.prototype.init = function() {
	this.parent();
	this._char = ">";
	this._description = "staircase leading down";
	this._image = "staircase-down";
}

/**
 * Staircase up
 * @augments RPG.Features.Staircase
 */
RPG.Features.Staircase.Up = OZ.Class().extend(RPG.Features.Staircase);
RPG.Features.Staircase.Up.prototype.init = function() {
	this.parent();
	this._char = "<";
	this._description = "staircase leading up";
	this._image = "staircase-up";
}
