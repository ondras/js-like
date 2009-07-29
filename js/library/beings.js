/**
 * @class Goblin
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.Goblin = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Goblin.prototype.init = function() {
	/* goblins are below-average humanoids */
	this.parent(new RPG.Races.Humanoid());
	this._defaults[RPG.FEAT_STRENGTH] = 9;
	this._defaults[RPG.FEAT_TOUGHNESS] = 9;
	this._defaults[RPG.FEAT_DEXTERITY] = 9;
	this._defaults[RPG.FEAT_INTELLIGENCE] = 9;
	
	this._char = "g";
	this._color = "mediumblue";
	this._description = "goblin";
	this._image = "goblin";

}
RPG.Beings.Goblin.prototype.setup = function() {
	this.parent();

	if (Math.randomPercentage() < 21) {
		var dagger = new RPG.Items.Dagger();
		this.getMeleeSlot().setItem(dagger);
	}
	
	if (Math.randomPercentage() < 21) {
		var cap = new RPG.Items.MetalCap();
		this.getHeadSlot().setItem(cap);
	}
	
	if (Math.randomPercentage() < 21) {
		var boots = new RPG.Items.LeatherBoots();
		this.getFeetSlot().setItem(boots);
	}

	return this;
}

/**
 * @class Hoboblin
 * @augments RPG.Beings.Goblin
 */
RPG.Beings.Hobgoblin = OZ.Class().extend(RPG.Beings.Goblin);
RPG.Beings.Hobgoblin.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());
	
	this._color = "yellowgreen";
	this._description = "hobgoblin";
	this._image = "hobgoblin";
	
	this._defaults.strength += 2;
	this._defaults.toughness += 2;
}

/**
 * @class Hobgoblin leader
 * @augments RPG.Beings.Hobgoblin
 */
RPG.Beings.HobgoblinLeader = OZ.Class().extend(RPG.Beings.Hobgoblin);
RPG.Beings.HobgoblinLeader.flags.frequency = 15;
RPG.Beings.HobgoblinLeader.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());
	
	this._color = "forestgreen";
	this._description = "hobgoblin leader";
	this._image = "hobgoblin-leader";
	
	this._defaults.strength += 2;
	this._defaults.toughness += 2;
}

/**
 * @class Troll
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.Troll = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Troll.flags.frequency = 10;
RPG.Beings.Troll.prototype.init = function() {
	/* trolls are above-average humanoids */
	this.parent(new RPG.Races.Humanoid());
	this._defaults[RPG.FEAT_STRENGTH] = 18;
	this._defaults[RPG.FEAT_TOUGHNESS] = 20;
	this._defaults[RPG.FEAT_DEXTERITY] = 11;
	this._defaults[RPG.FEAT_INTELLIGENCE] = 5;
	this._defaults[RPG.FEAT_PV] = 5;
	
	this._char = "T";
	this._color = "darkgray";
	this._description = "troll";
	this._image = "troll";

	this.addModifier(RPG.FEAT_HIT, 5);
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
