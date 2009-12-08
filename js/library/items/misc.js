/**
 * @class Anything that can be eaten
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Consumable = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Consumable.factory.ignore = true;
RPG.Items.Consumable.prototype.init = function() {
	this.parent();
	this._char = "%";
}
RPG.Items.Consumable.prototype.eat = function(being) {
	var max = being.getFeat(RPG.FEAT_MAX_HP);
	var amount = Math.floor(max/4) || 1;
	var a = new RPG.Actions.Heal(being, amount);
	RPG.World.action(a);
}

/**
 * @class Corpse, after being dies
 * @augments RPG.Items.Consumable
 */
RPG.Items.Corpse = OZ.Class().extend(RPG.Items.Consumable);
RPG.Items.Corpse.factory.ignore = true;
RPG.Items.Corpse.prototype.init = function() {
	this.parent();
	this._image = "corpse";
}

/**
 * @param {RPG.Beings.BaseBeing} being The one who died
 */
RPG.Items.Corpse.prototype.setBeing = function(being) {
	this._being = being;
	this._color = being.getColor();
	this._description = being._description + " corpse";
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
	this._image = "apple";
	this._description = "apple";
	this._color = "lime";
}

/**
 * @class Dwarven sausage
 * @augments RPG.Items.Consumable
 */
RPG.Items.DwarvenSausage = OZ.Class().extend(RPG.Items.Consumable);
RPG.Items.DwarvenSausage.prototype.init = function() {
	this.parent();
	this._image = "dwarven-sausage";
	this._description = "dwarven sausage";
	this._color = "firebrick";
}

/**
 * @class Iron ration
 * @augments RPG.Items.Consumable
 */
RPG.Items.IronRation = OZ.Class().extend(RPG.Items.Consumable);
RPG.Items.IronRation.prototype.init = function() {
	this.parent();
	this._image = "iron-ration";
	this._description = "iron ration";
	this._color = "brown";
}

/**
 * @class Gold, money
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Gold = OZ.Class().extend(RPG.Items.BaseItem);

RPG.Items.Gold.prototype.init = function() {
	this.parent();
	this._image = "gold";
	this._color = "gold";
	this._char = "$";
	this._description = "piece of gold";
	this._descriptionPlural = "pieces";
	this._amount = Math.randomPercentage(); /* FIXME */
}

RPG.Items.Gold.prototype.describe = function() {
	if (this._amount == 1) {
		return this._description;
	} else {
		return "heap of gold ("+this._amount + " " + this._descriptionPlural + ")";
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
	this._char = "*";
}

/**
 * @class Diamond
 * @augments RPG.Items.Gem
 */
RPG.Items.Diamond = OZ.Class().extend(RPG.Items.Gem);
RPG.Items.Diamond.factory.frequency = 20;
RPG.Items.Diamond.prototype.init = function() {
	this.parent();
	this._color = "white";
	this._image = "diamond";
	this._description = "diamond";
}

/**
 * @class Sapphire
 * @augments RPG.Items.Gem
 */
RPG.Items.Sapphire = OZ.Class().extend(RPG.Items.Gem);
RPG.Items.Sapphire.factory.frequency = 25;
RPG.Items.Sapphire.prototype.init = function() {
	this.parent();
	this._color = "blue";
	this._image = "sapphire";
	this._description = "sapphire";
}

/**
 * @class Ruby
 * @augments RPG.Items.Gem
 */
RPG.Items.Ruby = OZ.Class().extend(RPG.Items.Gem);
RPG.Items.Ruby.factory.frequency = 25;
RPG.Items.Ruby.prototype.init = function() {
	this.parent();
	this._color = "red";
	this._image = "ruby";
	this._description = "ruby";
}

/**
 * @class Opal
 * @augments RPG.Items.Gem
 */
RPG.Items.Opal = OZ.Class().extend(RPG.Items.Gem);
RPG.Items.Opal.factory.frequency = 25;
RPG.Items.Opal.prototype.init = function() {
	this.parent();
	this._color = "magenta";
	this._image = "opal";
	this._description = "opal";
}

/**
 * @class Turquoise
 * @augments RPG.Items.Gem
 */
RPG.Items.Turquoise = OZ.Class().extend(RPG.Items.Gem);
RPG.Items.Turquoise.factory.frequency = 25;
RPG.Items.Turquoise.prototype.init = function() {
	this.parent();
	this._color = "turquoise";
	this._image = "turquoise";
	this._description = "turquoise";
}

/**
 * @class Potion
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Potion = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Potion.factory.ignore = true;
RPG.Items.Potion.prototype.init = function() {
	this.parent();
	this._char = "!";
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
	this._color = "blue";
	this._image = "potion-healing";
	this._description = "healing potion";
}

RPG.Items.HealingPotion.prototype.drink = function(being) {
	var max = being.getFeat(RPG.FEAT_MAX_HP);
	var amount = Math.floor(max/2) || 1;
	var a = new RPG.Actions.Heal(being, amount);
	RPG.World.action(a);
}

/**
 * @class Ring
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Ring = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Ring.factory.ignore = true;
RPG.Items.Ring.prototype.init = function() {
	this.parent();
	this._char = "=";
}

/**
 * @class Brass ring
 * @augments RPG.Items.Ring
 */
RPG.Items.BrassRing = OZ.Class().extend(RPG.Items.Ring);
RPG.Items.BrassRing.prototype.init = function() {
	this.parent();
	this._image= "brass-ring";
	this._color = "burlywood";
	this._description = "brass ring";
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
	this._image = "silver-ring";
	this._color = "silver";
	this._description = "ring of " + RPG.Feats[attribute].name;
	this._descriptionPlural = "rings of " + RPG.Feats[attribute].name;
}
RPG.Items.RingOfAttribute.prototype.clone = function() {
	var clone = new this.constructor(this._attribute, 0);
	clone._modifiers[this._attribute] = this._modifiers[this._attribute];
	return clone;
}
