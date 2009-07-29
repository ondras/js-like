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
	this.flags |= RPG.CELL_SOLID;
	this.flags |= RPG.CELL_OBSTACLE;
}

/**
 * @class Fake wall
 * @augments RPG.Cells.Wall
 */
RPG.Cells.Wall.Fake = OZ.Class().extend(RPG.Cells.Wall);

RPG.Cells.Wall.Fake.prototype.init = function() {
	this.parent();
	this._cell = null;
}

RPG.Cells.Wall.Fake.prototype.setup = function(realCell) {
	this._cell = realCell;
}

RPG.Cells.Wall.Fake.prototype.getRealCell = function() {
	return this._cell;
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

RPG.Features.Door.prototype.setup = function(hp) {
	this._hp = hp;
}

RPG.Features.Door.prototype.lock = function() {
	this.close();
	this._locked = true;
}

RPG.Features.Door.prototype.close = function() {
	this._closed = true;
	this._locked = false;
	
	this.flags |= RPG.FEATURE_OBSTACLE;
	this.flags |= RPG.FEATURE_SOLID;
	
	this._description = "closed door";
	this._image = "door-closed";
	this._char = "+";
}

RPG.Features.Door.prototype.open = function() {
	this._closed = false;
	this._locked = false;
	this.flags &= !RPG.FEATURE_OBSTACLE;
	this.flags &= !RPG.FEATURE_SOLID;
	
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

RPG.Features.Trap.prototype.init = function() {
	this.parent();
	this._char = "^";
}

RPG.Features.Trap.prototype.knowsAbout = function(being) {
	return being.trapMemory().remembers(this);
}

RPG.Features.Trap.prototype.notify = function(being) {
	var a = new RPG.Actions.TrapEncounter(being, this);
	RPG.World.action(a);
}

RPG.Features.Trap.prototype.setOff = function() {
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
	var c = RPG.World.getMap().getFreeCoords();
	var a = new RPG.Actions.Teleport(this._cell.getBeing(), c);
	RPG.World.action(a);
}

/**
 * @class Pit trap
 * @augments RPG.Features.Trap
 */
RPG.Features.Trap.Pit = OZ.Class().extend(RPG.Features.Trap);

RPG.Features.Trap.Pit.prototype.init = function() {
	this.parent();
	
	this._color = "sienna";
	this._image = "trap-pit";
	this._description = "pit trap";
}

RPG.Features.Trap.Pit.prototype.setOff = function(e) {
	var a = new RPG.Actions.Pit(this._cell.getBeing(), this);
	RPG.World.action(a);
}

/**
 * @class Staircase leading up/down
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Staircase = OZ.Class().extend(RPG.Features.BaseFeature);

RPG.Features.Staircase.prototype.init = function() {
	this.parent();
	this._color = "silver";
	this._targetGenerator = null;
	this._targetMap = null;
	this._targetCoords = null;
}

RPG.Features.Staircase.prototype.setTargetGenerator = function(func) {
	this._targetGenerator = func;
}

RPG.Features.Staircase.prototype.setTargetMap = function(map) {
	this._targetMap = map;
}

RPG.Features.Staircase.prototype.setTargetCoords = function(coords) {
	this._targetCoords = coords.clone();
}

RPG.Features.Staircase.prototype.generateTarget = function() {
	if (!this._targetGenerator) { throw new Error("Cannot generate without a generator"); }
	this._targetGenerator(this);
	return this;
}

RPG.Features.Staircase.prototype.getTargetMap = function() {
	return this._targetMap;
}

RPG.Features.Staircase.prototype.getTargetCoords = function() {
	return this._targetCoords;
}

/**
 * Staircase down
 * @augments RPG.Features.Staircase
 */
RPG.Features.Staircase.Down = OZ.Class().extend(RPG.Features.Staircase);
RPG.Features.Staircase.Down.prototype.init = function() {
	this.parent();
	this._char = "&gt;";
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
	this._char = "&lt;";
	this._description = "staircase leading up";
	this._image = "staircase-up";
}

