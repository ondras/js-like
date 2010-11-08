/**
 * @class Generic shield
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Shield = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Shield.factory.ignore = true;
RPG.Items.Shield.prototype.init = function() {
	this.parent();
	this.setVisual({
		ch: "[",
		color: "darkgray"
	});
}

/**
 * @class Small shield
 * @augments RPG.Items.BaseItem
 */
RPG.Items.SmallShield = OZ.Class().extend(RPG.Items.Shield);
RPG.Items.SmallShield.prototype.init = function() {
	this.parent();
	this.setVisual({
		desc: "small shield",
		image: "small-shield"
	});
	this._modifiers[RPG.FEAT_DV] = 2;
}

/**
 * @class Medium shield
 * @augments RPG.Items.BaseItem
 */
RPG.Items.MediumShield = OZ.Class().extend(RPG.Items.Shield);
RPG.Items.MediumShield.prototype.init = function() {
	this.parent();
	this.setVisual({
		desc: "medium shield",
		image: "medium-shield"
	});
	this._modifiers[RPG.FEAT_DV] = 3;
	this._modifiers[RPG.FEAT_PV] = 1;
}

/**
 * @class Large shield
 * @augments RPG.Items.BaseItem
 */
RPG.Items.LargeShield = OZ.Class().extend(RPG.Items.Shield);
RPG.Items.LargeShield.prototype.init = function() {
	this.parent();
	this.setVisual({
		desc: "large shield",
		image: "large-shield"
	});
	this._modifiers[RPG.FEAT_DV] = 5;
	this._modifiers[RPG.FEAT_PV] = 1;
}

/**
 * @class Head gear
 * @augments RPG.Items.BaseItem
 */
RPG.Items.HeadGear = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.HeadGear.factory.ignore = true;
RPG.Items.HeadGear.prototype.init = function() {
	this.parent();
	this.setVisual({
		ch: "[",
		color: "lightgray"
	});
}

/**
 * @class Boots
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Boots = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Boots.factory.ignore = true;
RPG.Items.Boots.prototype.init = function() {
	this.parent();
	this.setVisual({
		ch: "[",
		color: "brown"
	});
}

/**
 * @class Armor
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Armor = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Armor.factory.ignore = true;
RPG.Items.Armor.prototype.init = function() {
	this.parent();
	this.setVisual({
		ch: "]",
		color: "brown"
	});
}

/**
 * @class Metal cap
 * @augments RPG.Items.HeadGear
 */
RPG.Items.MetalCap = OZ.Class().extend(RPG.Items.HeadGear);
RPG.Items.MetalCap.prototype.init = function() {
	this.parent();
	this.setVisual({
		desc: "metal cap",
		image: "metal-cap"
	});
	this._modifiers[RPG.FEAT_PV] = 1;
}

/**
 * @class Leather boots
 * @augments RPG.Items.Boots
 */
RPG.Items.LeatherBoots = OZ.Class().extend(RPG.Items.Boots);
RPG.Items.LeatherBoots.prototype.init = function() {
	this.parent();
	this._uncountable = true;
	this.setVisual({
		desc: "leather boots",
		image: "leather-boots"
	});
	this._descPlural = "pairs of leather boots";
	this._modifiers[RPG.FEAT_DV] = 1;
}

/**
 * @class Clothes
 * @augments RPG.Items.Armor
 */
RPG.Items.Clothes = OZ.Class().extend(RPG.Items.Armor);
RPG.Items.Clothes.factory.frequency = 125;
RPG.Items.Clothes.prototype.init = function() {
	this.parent();
	this._uncountable = true;
	this.setVisual({
		color: "lime",
		desc: "clothes",
		image: "clothes"
	});
	this._modifiers[RPG.FEAT_PV] = 1;
}

/**
 * @class Mage robe
 * @augments RPG.Items.Armor
 */
RPG.Items.MageRobe = OZ.Class().extend(RPG.Items.Armor);
RPG.Items.MageRobe.prototype.init = function() {
	this.parent();
	this.setVisual({
		color: "red",
		desc: "mage-robe",
		image: "mage-robe"
	});
	this._modifiers[RPG.FEAT_PV] = 1;
	this._modifiers[RPG.FEAT_MAGIC] = 1;
}

/**
 * @class Leather armor
 * @augments RPG.Items.Armor
 */
RPG.Items.LeatherArmor = OZ.Class().extend(RPG.Items.Armor);
RPG.Items.LeatherArmor.prototype.init = function() {
	this.parent();
	this.setVisual({
		desc: "leather armor",
		image: "leather-armor"
	});
	this._modifiers[RPG.FEAT_DV] = 1;
	this._modifiers[RPG.FEAT_PV] = 1;
}

/**
 * @class Chain mail
 * @augments RPG.Items.Armor
 */
RPG.Items.ChainMail = OZ.Class().extend(RPG.Items.Armor);
RPG.Items.ChainMail.prototype.init = function() {
	this.parent();
	this.setVisual({
		color: "darkgray",
		desc: "chain mail",
		image: "chain-mail"
	});
	this._modifiers[RPG.FEAT_PV] = 2;
}

/**
 * @class Scale mail
 * @augments RPG.Items.Armor
 */
RPG.Items.ScaleMail = OZ.Class().extend(RPG.Items.Armor);
RPG.Items.ScaleMail.prototype.init = function() {
	this.parent();
	this.setVisual({
		color: "darkgray",
		desc: "scale mail",
		image: "scale-mail"
	});
	this._modifiers[RPG.FEAT_DV] = -2;
	this._modifiers[RPG.FEAT_PV] = 4;
}

