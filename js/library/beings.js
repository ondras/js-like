/**
 * @class Orc
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.Orc = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.Orc.prototype.setup = function() {
	return this.parent(new RPG.Races.Orc());
}

/**
 * @class Human
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.Human = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.Human.prototype.setup = function() {
	return this.parent(new RPG.Races.Human());
}

/**
 * @class God, useful for debugging.
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.God = OZ.Class().extend(RPG.Beings.PC);

RPG.Beings.God.prototype.getVisibleCoords = function() {
	var arr = [];
	var map = this._cell.getMap();
	var size = map.getSize();
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=0;i<size.x;i++) {
		for (var j=0;j<size.y;j++) {
			c.x = i;
			c.y = j;
			arr.push(c.clone());
		}
	}
	return arr;
}

RPG.Beings.God.prototype.updateVisibility = function() {
}

RPG.Beings.God.prototype.canSee = function(coords) {
	return true;
}
