/**
 * Feat base class
 */
RPG.Feats.BaseFeat = OZ.Class();
RPG.Feats.BaseFeat.prototype.init = function(baseValue) {
	this._value = baseValue;
}
RPG.Feats.BaseFeat.prototype.baseValue = function() {
	return this._value;
};
RPG.Feats.BaseFeat.prototype.modifiedValue = function(modifierHolder) {
	var plus = modifierHolder.getModifier(this.constructor, RPG.MODIFIER_PLUS);
	var times = modifierHolder.getModifier(this.constructor, RPG.MODIFIER_TIMES);
	return (this._value + plus) * times;
};

RPG.Beings.BaseBeing = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Visual.DescriptionInterface)
						.implement(RPG.Misc.ModifierInterface)
						.implement(RPG.Engine.ActorInterface);
RPG.Beings.BaseBeing.prototype.init = function(r) {
	this._modifiers = [];
	this._world = null;
	this._race = r;
	this._items = [];
	this._hp = 0;
	this._char = this._race.getChar(null);
	this._maxhp = new RPG.Feats.HP(100);
}
RPG.Beings.BaseBeing.prototype.setWorld = function(world) {
	this._world = world;
}
RPG.Beings.BaseBeing.prototype.getWorld = function() {
	return this._world;
}
RPG.Beings.BaseBeing.prototype.getRace = function() {
	return this._race;
}
RPG.Beings.BaseBeing.prototype.getModifier = function(feat, type) {
	var modifierHolders = [];
	for (var i=0;i<this._items.length;i++) {
		modifierHolders.push(this._items[i]);
	}
	modifierHolders.push(this._race);
	
	var values = [];
	for (var i=0;i<modifierHolders.length;i++) {
		var mod = modifierHolders[i].getModifier(feat, type);
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
	return this._hp;
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

RPG.Items.BaseItem = OZ.Class()
						.implement(RPG.Visual.VisualInterface)
						.implement(RPG.Visual.DescriptionInterface)
						.implement(RPG.Misc.ModifierInterface);
RPG.Items.BaseItem.prototype.init = function() {
	this._modifiers = [];
	this._flags = RPG.ITEM_PICKABLE;
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
