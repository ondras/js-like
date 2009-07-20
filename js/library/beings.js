/**
 * @class Goblin
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.Goblin = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.Goblin.prototype.init = function() {
	this.parent();
	
	this._char = "g";
	this._color = "forestgreen";
	this._description = "goblin";
	this._image = "goblin";

	var dagger = new RPG.Items.Dagger();
	this.addItem(dagger);
	this.setWeapon(dagger);
}

/**
 * @class Troll
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.Troll = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.Troll.prototype.init = function() {
	this.parent();
	
	this._char = "T";
	this._color = "darkgray";
	this._description = "troll";
	this._image = "troll";
	
	this._default.strength = 18;
	this._default.toughness = 20;
	this._default.dexterity = 11;
	this._default.pv = 5;
	
	this.addModifier(RPG.Feats.Hit, RPG.MODIFIER_PLUS, 5);
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
