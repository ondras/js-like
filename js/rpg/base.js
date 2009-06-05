/**
 * Basic Feat. Implements ModifierInterface, since a feat can influent other feat (Strength influences MaxHP...).
 * However, feats modify other feats byt adding/multiplying their own (modified) value.
 */
RPG.Feats.BaseFeat = OZ.Class().implement(RPG.Misc.ModifierInterface);
RPG.Feats.BaseFeat.prototype.init = function(baseValue) {
	this._value = baseValue;
	this._modifiers = [];
}
RPG.Feats.BaseFeat.prototype.baseValue = function() {
	return this._value;
};
RPG.Feats.BaseFeat.prototype.modifiedValue = function(modifierHolder) {
	var plus = modifierHolder.getModifier(this.constructor, RPG.MODIFIER_PLUS, modifierHolder);
	var times = modifierHolder.getModifier(this.constructor, RPG.MODIFIER_TIMES, modifierHolder);
	var value = this._value;
	if (value instanceof RPG.Misc.Dice) { value = value.roll(); }
	return (value + plus) * times;
};
RPG.Feats.BaseFeat.prototype.getModifier = function(feat, type, modifierHolder) {
	for (var i=0;i<this._modifiers.length;i++) {
		var item = this._modifiers[i];
		if (item[0] == feat && item[1] == type) { return item[2] * this.modifiedValue(modifierHolder); }
	}
	return null;
}

RPG.Beings.BaseBeing = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Visual.DescriptionInterface)
						.implement(RPG.Misc.ModifierInterface);
RPG.Beings.BaseBeing.prototype.init = function(r) {
	this._modifiers = [];
	this._coords = null;
	this._level = null;
	this._brain = null;
	this._race = r;
	this._items = [];
	this._stats = {
		hp: 0
	}
	this._feats = {
		maxhp: new RPG.Feats.MaxHP(100),
		dv: new RPG.Feats.DV(10),
		pv: new RPG.Feats.PV(10)
	}

	this._char = this._race.getChar(null);
}
/**
 * @param {SMap.Misc.Coords}
 */
RPG.Beings.BaseBeing.prototype.setCoords = function(coords) {
	this._coords = coords;
}
RPG.Beings.BaseBeing.prototype.getCoords = function() {
	return this._coords;
}
RPG.Beings.BaseBeing.prototype.setLevel = function(level) {
	this._level = level;
}
RPG.Beings.BaseBeing.prototype.getLevel = function() {
	return this._level;
}
RPG.Beings.BaseBeing.prototype.setBrain = function(brain) {
	this._brain = brain;
}
RPG.Beings.BaseBeing.prototype.getBrain = function() {
	return this._brain;
}
RPG.Beings.BaseBeing.prototype.getRace = function() {
	return this._race;
}
RPG.Beings.BaseBeing.prototype.getModifier = function(feat, type, modifierHolder) {
	var modifierHolders = [];
	for (var i=0;i<this._items.length;i++) {
		modifierHolders.push(this._items[i]);
	}
	for (var p in this._feats) {
		modifierHolders.push(this._feats[p]);
	}
	modifierHolders.push(this._race);
	
	var values = [];
	for (var i=0;i<modifierHolders.length;i++) {
		var mod = modifierHolders[i].getModifier(feat, type, modifierHolder);
		if (mod !== null) { values.push(mod); }
	}
	
	var total = (type == RPG.MODIFIER_PLUS ? 0 : 1);
	for (var i=0;i<values.length;i++) {
		if (type == RPG.MODIFIER_PLUS) {
			total += values[i];
		} else {
			total *= values[i];
		}
	}
	return total;
}
RPG.Beings.BaseBeing.prototype.getHP = function() {
	return this._stats.hp;
}
RPG.Beings.BaseBeing.prototype.getMaxHP = function() {
	return this._feats.maxhp.modifiedValue(this);
}
RPG.Beings.BaseBeing.prototype.getDV = function() {
	return this._feats.dv.modifiedValue(this);
}
RPG.Beings.BaseBeing.prototype.getPV = function() {
	return this._feats.pv.modifiedValue(this);
}
RPG.Beings.BaseBeing.prototype.getChar = function(who) {
	var ch = this._char.clone();
	if (who == this) { ch.setChar("@"); }
	return ch;
}
RPG.Beings.BaseBeing.prototype.getImage = function(who) {
	return this._race.getImage(who);
}
RPG.Beings.BaseBeing.prototype.describe = function(who) {
	if (who == this) { return "you"; }
	return this._race.describe(who);
}
RPG.Beings.BaseBeing.prototype.describeA = function(who) {
	if (who == this) { 
		return this.describe(who); 
	} else {
		return this._race.describeA(who);
	}
}
RPG.Beings.BaseBeing.prototype.describeThe = function(who) {
	if (who == this) { 
		return this.describe(who); 
	} else {
		return this._race.describeThe(who);
	}
}
/**
 * Can this being see target coords?
 * @param {RPG.Misc.Coords} target
 * @returns {bool}
 */
RPG.Beings.BaseBeing.prototype.canSee = function(target) {
	var source = this._coords;
	if (source.distance(target) <= 1) { return true; } /* optimalization: can see self & surroundings */
	if (source.distance(target) > 5) { return false; } /* FIXME this should depend on perception or so */

	var offsets = [
		[0, 0],
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1]
	];
	var c = source.clone();
	for (var i=0;i<offsets.length;i++) {
		c.x = source.x + offsets[i][0];
		c.y = source.y + offsets[i][1];
		if (!this._level.valid(c) || this._level.isBlocked(c)) { continue; }
		var tmp = this._level.lineOfSight(c, target);
		if (tmp == true) { return true; }
	}
	return false;
}
/**
 * Being requests info about a cell
 * @param {RPG.Misc.Coords} coords
 */
RPG.Beings.BaseBeing.prototype.cellInfo = function(coords) {
	return this._level.at(coords);
}

RPG.Items.BaseItem = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Visual.DescriptionInterface)
						.implement(RPG.Misc.ModifierInterface);
RPG.Items.BaseItem.prototype.init = function() {
	this._modifiers = [];
	this.flags = RPG.ITEM_PICKABLE;
}
RPG.Items.BaseItem.prototype.getChar = function(who) {
	var ch = new RPG.Visual.Char();
	ch.setChar("?");
	ch.setColor("#a9a9a9");
	return ch;
}
RPG.Items.BaseItem.prototype.getImage = function(who) {
	return "item";
}
RPG.Items.BaseItem.prototype.describe = function(who) {
	return "item";
}

RPG.Races.BaseRace = OZ.Class()
							.implement(RPG.Misc.ModifierInterface)
							.implement(RPG.Visual.VisualInterface)
							.implement(RPG.Visual.DescriptionInterface);
RPG.Races.BaseRace.prototype.init = function() {
	this._modifiers = [];
}
