/**
 * @class Anything that can be eaten
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Consumable = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Consumable.factory.ignore = true;
RPG.Items.Consumable.prototype.init = function() {
	this.parent();
	this.setVisual({ch:"%"});
}
RPG.Items.Consumable.prototype.eat = function(being) {
	var max = being.getFeat(RPG.FEAT_MAX_HP);
	var amount = Math.floor(max/4) || 1;
	being.heal(amount);
}

/**
 * @class Corpse, after being dies
 * @augments RPG.Items.Consumable
 */
RPG.Items.Corpse = OZ.Class().extend(RPG.Items.Consumable);
RPG.Items.Corpse.factory.ignore = true;
RPG.Items.Corpse.prototype.init = function() {
	this.parent();
	this.setVisual({image:"corpse"});
}

/**
 * @param {RPG.Beings.BaseBeing} being The one who died
 */
RPG.Items.Corpse.prototype.setBeing = function(being) {
	this._being = being;
	this.setVisual({
		color: being.getVisual().color,
		desc: being.getVisual().desc + " corpse"
	});
	return this;
}

RPG.Items.Corpse.prototype.getBeing = function() {
	return this._being;
}

RPG.Items.Corpse.prototype.isSameAs = function(item) {
	var same = this.parent(item);
	if (!same) { return false; }
	
	if (this._being.constructor != item.getBeing().constructor) { return false; }
	
	return true;
}

/**
 * @class Apple
 * @augments RPG.Items.Consumable
 */
RPG.Items.Apple = OZ.Class().extend(RPG.Items.Consumable);
RPG.Items.Apple.prototype.init = function() {
	this.parent();
	this.setVisual({
		image: "apple",
		desc: "apple",
		color: "#0f0"
	});
}

/**
 * @class Dwarven sausage
 * @augments RPG.Items.Consumable
 */
RPG.Items.DwarvenSausage = OZ.Class().extend(RPG.Items.Consumable);
RPG.Items.DwarvenSausage.prototype.init = function() {
	this.parent();
	this.setVisual({
		image: "dwarven-sausage",
		desc: "dwarven sausage",
		color: "#933"
	});
}

/**
 * @class Iron ration
 * @augments RPG.Items.Consumable
 */
RPG.Items.IronRation = OZ.Class().extend(RPG.Items.Consumable);
RPG.Items.IronRation.prototype.init = function() {
	this.parent();
	this.setVisual({
		image: "iron-ration",
		desc: "iron ration",
		color: "#630"
	});
}

/**
 * @class Gold, money
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Gold = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Gold.factory.method = function(danger) {
	var amount = 1 + Math.round(Math.random() * danger * 30);
	return new this(amount);
}

RPG.Items.Gold.prototype.init = function(amount) {
	this.parent();
	this.setVisual({
		image: "gold",
		desc: "piece of gold",
		ch: "$",
		color: "#fc0"
	});
	this._descPlural = "pieces";
	this._amount = amount;
}

RPG.Items.Gold.prototype.describe = function() {
	if (this._amount == 1) {
		return this._visual.desc;
	} else {
		return "heap of gold ("+this._amount + " " + this._descPlural + ")";
	}
}

/**
 * @class Valuable gem
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Gem = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Gem.factory.ignore = true;
RPG.Items.Gem.prototype.init = function() {
	this.parent();
	this.setVisual({ch:"*"});
}

/**
 * @class Diamond
 * @augments RPG.Items.Gem
 */
RPG.Items.Diamond = OZ.Class().extend(RPG.Items.Gem);
RPG.Items.Diamond.factory.frequency = 20;
RPG.Items.Diamond.prototype.init = function() {
	this.parent();
	this.setVisual({
		image: "diamond",
		desc: "diamond",
		color: "#fff"
	});
}

/**
 * @class Sapphire
 * @augments RPG.Items.Gem
 */
RPG.Items.Sapphire = OZ.Class().extend(RPG.Items.Gem);
RPG.Items.Sapphire.factory.frequency = 25;
RPG.Items.Sapphire.prototype.init = function() {
	this.parent();
	this.setVisual({
		image: "sapphire",
		desc: "sapphire",
		color: "#00f"
	});
}

/**
 * @class Ruby
 * @augments RPG.Items.Gem
 */
RPG.Items.Ruby = OZ.Class().extend(RPG.Items.Gem);
RPG.Items.Ruby.factory.frequency = 25;
RPG.Items.Ruby.prototype.init = function() {
	this.parent();
	this.setVisual({
		image: "ruby",
		desc: "ruby",
		color: "#f00"
	});
}

/**
 * @class Opal
 * @augments RPG.Items.Gem
 */
RPG.Items.Opal = OZ.Class().extend(RPG.Items.Gem);
RPG.Items.Opal.factory.frequency = 25;
RPG.Items.Opal.prototype.init = function() {
	this.parent();
	this.setVisual({
		image: "opal",
		desc: "opal",
		color: "#f0f"
	});
}

/**
 * @class Turquoise
 * @augments RPG.Items.Gem
 */
RPG.Items.Turquoise = OZ.Class().extend(RPG.Items.Gem);
RPG.Items.Turquoise.factory.frequency = 25;
RPG.Items.Turquoise.prototype.init = function() {
	this.parent();
	this.setVisual({
		image: "turquoise",
		desc: "turquoise",
		color: "#3cc"
	});
}

/**
 * @class Potion
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Potion = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Potion.factory.ignore = true;
RPG.Items.Potion.prototype.init = function() {
	this.parent();
	this.setVisual({ch:"!"});
}
RPG.Items.Potion.prototype.drink = function(being) {
}

/**
 * @class Health-regenerating potion
 * @augments RPG.Items.Potion
 */
RPG.Items.HealingPotion = OZ.Class().extend(RPG.Items.Potion);
RPG.Items.HealingPotion.prototype.init = function() {
	this.parent();
	this.setVisual({
		image: "potion-healing",
		desc: "healing potion",
		color: "#00f"
	});
}

RPG.Items.HealingPotion.prototype.drink = function(being) {
	var max = being.getFeat(RPG.FEAT_MAX_HP);
	var amount = Math.floor(max/2) || 1;
	being.heal(amount);
}

/**
 * @class Ring
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Ring = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Ring.factory.ignore = true;
RPG.Items.Ring.prototype.init = function() {
	this.parent();
	this.setVisual({ch:"="});
}

/**
 * @class Necklace
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Necklace = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Necklace.factory.ignore = true;
RPG.Items.Necklace.prototype.init = function() {
	this.parent();
	this.setVisual({ch:"'"});
}

/**
 * @class Brass ring
 * @augments RPG.Items.Ring
 */
RPG.Items.BrassRing = OZ.Class().extend(RPG.Items.Ring);
RPG.Items.BrassRing.prototype.init = function() {
	this.parent();
	this.setVisual({
		image: "brass-ring",
		desc: "brass ring",
		color: "#c66"
	});
}

/**
 * @class Ring modifying attribute
 * @augments RPG.Items.Ring
 */
RPG.Items.RingOfAttribute = OZ.Class().extend(RPG.Items.Ring);
RPG.Items.RingOfAttribute.factory.method = function(danger) {
	var att = RPG.ATTRIBUTES.random();
	var amount = 1 + (danger/8);
	return new this(att, amount);
}

RPG.Items.RingOfAttribute.prototype.init = function(attribute, amount) {
	this.parent();
	
	var rv = new RPG.Misc.RandomValue(amount, 2*amount/3);
	this._modifiers[attribute] = rv.roll();

	this._attribute = attribute;
	this.setVisual({
		image: "silver-ring",
		desc: "ring of " + RPG.Feats[attribute].label,
		color: "#ccc"
	});
	this._descPlural = "rings of " + RPG.Feats[attribute].label;
}

RPG.Items.RingOfAttribute.prototype.clone = function() {
	var clone = new this.constructor(this._attribute, 0);
	clone._modifiers[this._attribute] = this._modifiers[this._attribute];
	return clone;
}

/**
 * @class Anything that can be read
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Readable = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Readable.factory.ignore = true;
RPG.Items.Readable.prototype.read = function(being) {
}

/**
 * @class Scroll with a spells
 * @augments RPG.Items.Readable
 */
RPG.Items.Scroll = OZ.Class().extend(RPG.Items.Readable);
RPG.Items.Scroll.factory.method = function(danger) {
	var spell = RPG.Factories.spells.getClass(danger);
	return new this(spell);
}

RPG.Items.Scroll.prototype.init = function(spell) {
	this.parent();
	this._spell = spell;

	this.setVisual({
		ch: "?",
		color: "#fff",
		image: "scroll",
		desc: "scroll of " + spell.label.capitalize()
	});
}

RPG.Items.Scroll.prototype.clone = function() {
	return new this.constructor(this._spell);
}

RPG.Items.Scroll.prototype.isSameAs = function(item) {
	if (!this.parent(item)) { return false; }
	return (this._spell == item.getSpell());
}

RPG.Items.Scroll.prototype.getSpell = function() {
	return this._spell;
}

RPG.Items.Scroll.prototype.read = function(being) {
	var spells = being.getSpells();
	if (spells.indexOf(this._spell) != -1) {
		/* already knows this spell */
		if (being == RPG.Game.pc) { RPG.UI.buffer.message("You already know this spell."); }
		return;
	}
	
	being.addSpell(this._spell);
	being.removeItem(this);
	if (being == RPG.Game.pc) { 
		var s = RPG.Misc.format("You learn the '%S' spell.", this._spell.label);
		RPG.UI.buffer.message(s); 
	}
}
