/**
 * @class Generic shield
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Shield = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Shield.factory.frequency = 0;
RPG.Items.Shield.visual = { ch:"[", color:"#999" };

/**
 * @class Small shield
 * @augments RPG.Items.BaseItem
 */
RPG.Items.SmallShield = OZ.Class().extend(RPG.Items.Shield);
RPG.Items.SmallShield.visual = { desc:"small shield", image:"small-shield" };
RPG.Items.SmallShield.prototype.init = function() {
	this.parent();
	this._modifiers[RPG.FEAT_DV] = 2;
}

/**
 * @class Medium shield
 * @augments RPG.Items.BaseItem
 */
RPG.Items.MediumShield = OZ.Class().extend(RPG.Items.Shield);
RPG.Items.MediumShield.visual = { desc:"medium shield", image:"medium-shield" };
RPG.Items.MediumShield.prototype.init = function() {
	this.parent();
	this._modifiers[RPG.FEAT_DV] = 3;
	this._modifiers[RPG.FEAT_PV] = 1;
}

/**
 * @class Large shield
 * @augments RPG.Items.BaseItem
 */
RPG.Items.LargeShield = OZ.Class().extend(RPG.Items.Shield);
RPG.Items.LargeShield.visual = { desc:"large shield", image:"large-shield" };
RPG.Items.LargeShield.prototype.init = function() {
	this.parent();
	this._modifiers[RPG.FEAT_DV] = 5;
	this._modifiers[RPG.FEAT_PV] = 1;
}

/**
 * @class Head gear
 * @augments RPG.Items.BaseItem
 */
RPG.Items.HeadGear = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.HeadGear.factory.frequency = 0;
RPG.Items.HeadGear.visual = { ch:"[", color:"#ccc" };

/**
 * @class Boots
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Boots = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Boots.factory.frequency = 0;
RPG.Items.Boots.visual = { ch:"[", color:"#960" };

/**
 * @class Armor
 * @augments RPG.Items.BaseItem
 */
RPG.Items.Armor = OZ.Class().extend(RPG.Items.BaseItem);
RPG.Items.Armor.factory.frequency = 0;
RPG.Items.Armor.visual = { ch:"]", color:"#960" };

/**
 * @class Metal cap
 * @augments RPG.Items.HeadGear
 */
RPG.Items.MetalCap = OZ.Class().extend(RPG.Items.HeadGear);
RPG.Items.MetalCap.visual = { desc:"metal cap", image:"metal-cap" };
RPG.Items.MetalCap.prototype.init = function() {
	this.parent();
	this._modifiers[RPG.FEAT_PV] = 1;
}

/**
 * @class Leather boots
 * @augments RPG.Items.Boots
 */
RPG.Items.LeatherBoots = OZ.Class().extend(RPG.Items.Boots);
RPG.Items.LeatherBoots.visual = { desc:"leather boots", image:"leather-boots", descPlural:"pairs of leather boots" };
RPG.Items.LeatherBoots.prototype._uncountable = true;
RPG.Items.LeatherBoots.prototype.init = function() {
	this.parent();
	this._modifiers[RPG.FEAT_DV] = 1;
}

/**
 * @class Clothes
 * @augments RPG.Items.Armor
 */
RPG.Items.Clothes = OZ.Class().extend(RPG.Items.Armor);
RPG.Items.Clothes.factory.frequency = 125;
RPG.Items.Clothes.visual = { desc:"clothes", image:"clothes", color:"#0f0" };
RPG.Items.Clothes.prototype._uncountable = true;
RPG.Items.Clothes.prototype.init = function() {
	this.parent();
	this._modifiers[RPG.FEAT_PV] = 1;
}

/**
 * @class Mage robe
 * @augments RPG.Items.Armor
 */
RPG.Items.MageRobe = OZ.Class().extend(RPG.Items.Armor);
RPG.Items.MageRobe.visual = { desc:"mage robe", image:"mage-robe", color:"#f00" };
RPG.Items.MageRobe.prototype.init = function() {
	this.parent();
	this._modifiers[RPG.FEAT_PV] = 1;
	this._modifiers[RPG.FEAT_MAGIC] = 1;
}

/**
 * @class Leather armor
 * @augments RPG.Items.Armor
 */
RPG.Items.LeatherArmor = OZ.Class().extend(RPG.Items.Armor);
RPG.Items.LeatherArmor.visual = { desc:"leather armor", image:"leather-armor" };
RPG.Items.LeatherArmor.prototype.init = function() {
	this.parent();
	this._modifiers[RPG.FEAT_DV] = 1;
	this._modifiers[RPG.FEAT_PV] = 1;
}

/**
 * @class Chain mail
 * @augments RPG.Items.Armor
 */
RPG.Items.ChainMail = OZ.Class().extend(RPG.Items.Armor);
RPG.Items.ChainMail.visual = { desc:"chain mail", image:"chain-mail", color:"#999" };
RPG.Items.ChainMail.prototype.init = function() {
	this.parent();
	this._modifiers[RPG.FEAT_PV] = 2;
}

/**
 * @class Scale mail
 * @augments RPG.Items.Armor
 */
RPG.Items.ScaleMail = OZ.Class().extend(RPG.Items.Armor);
RPG.Items.ScaleMail.visual = { desc:"scale mail", image:"scale-mail", color:"#999" };
RPG.Items.ScaleMail.prototype.init = function() {
	this.parent();
	this._modifiers[RPG.FEAT_DV] = -2;
	this._modifiers[RPG.FEAT_PV] = 4;
}
