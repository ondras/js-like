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

RPG.Cells.Wall.Fake.prototype.init = function(realCell) {
	this.parent();
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

RPG.Features.Door.prototype.init = function(coords, hp) {
	this.parent(coords);
	
	this._hp = hp || 4;
	this._closed = null;
	this._locked = null;
	this._color = "chocolate";
	this.open();
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
	
	this._description = "opened door";
	this._image = "door-opened";
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
 * @class Teleport
 * @augments RPG.Features.BaseFeature
 */
RPG.Features.Teleport = OZ.Class().extend(RPG.Features.BaseFeature);

RPG.Features.Teleport.prototype.init = function(coords) {
	this.parent(coords);
	
	this._char = "*";
	this._color = "fuchsia";
	this._image = "teleport";
	this._description = "teleport";
	
	OZ.Event.add(RPG.World, "action", this.bind(this._action));
}

RPG.Features.Teleport.prototype._action = function(e) {
	var action = e.data;
	if (!(action instanceof RPG.Actions.Move)) { return; }
	var target = action.getTarget();
	var map = RPG.World.getMap();
	
	if (map.at(target).getFeature() != this) { return; }
	
	var c = map.getFreeCoords();
	var a = new RPG.Actions.Teleport(action.getSource(), c);
	RPG.World.action(a);
}
