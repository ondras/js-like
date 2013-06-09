/**
 * @class Villager
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Villager = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Villager.factory.frequency = 0;
RPG.Beings.Villager.visual = { desc:"villager", color:"#c93", image:"villager" };
RPG.Beings.Villager.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);
	this.randomGender();
	this.setConfirm(RPG.CONFIRM_ASK);
	this.setAlignment(RPG.ALIGNMENT_LAWFUL);
	
	this.fullStats();
}


/**
 * @class Village healer
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageHealer = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageHealer.factory.frequency = 0;
RPG.Beings.VillageHealer.visual = { desc:"village healer", color:"#f00", image:"village-healer" };
RPG.Beings.VillageHealer.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);

	this.setGender(RPG.GENDER_MALE);
	this.setConfirm(RPG.CONFIRM_ASK);
	this.setAlignment(RPG.ALIGNMENT_LAWFUL);
	this.setFeat(RPG.FEAT_DEXTERITY, 15);
	this.setFeat(RPG.FEAT_MAGIC, 20);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 20);
	
	this.fullStats();
}

/**
 * @class Village shopkeeper
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageShopkeeper = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageShopkeeper.factory.frequency = 0;
RPG.Beings.VillageShopkeeper.visual = { desc:"shopkeeper", color:"#f00", image:"village-shopkeeper" };
RPG.Beings.VillageShopkeeper.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);

	this.setGender(RPG.GENDER_FEMALE);
	this.setConfirm(RPG.CONFIRM_ASK);
	this.setAlignment(RPG.ALIGNMENT_LAWFUL);
	this.setFeat(RPG.FEAT_SPEED, 200);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_STRENGTH, 20);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);

	this.fullStats();
}

/**
 * @class Village witch
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageWitch = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageWitch.factory.frequency = 0;
RPG.Beings.VillageWitch.visual = { desc:"witch", color:"#00f", image:"village-witch" };
RPG.Beings.VillageWitch.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);

	this.setConfirm(RPG.CONFIRM_ASK);
	this.setGender(RPG.GENDER_FEMALE);
	this.setAlignment(RPG.ALIGNMENT_LAWFUL);
	this.setFeat(RPG.FEAT_MAGIC, 25);
	this.setFeat(RPG.FEAT_MAX_HP, 20);

	var broom = new RPG.Items.Broom();
	this.addItem(broom);
	this.equip(RPG.SLOT_WEAPON, broom);
	
	this.addSpell(RPG.Spells.MagicBolt);
	this.addSpell(RPG.Spells.Teleport);

	this._ai.setDialogText("Quidquid latine dictum sit, altum sonatur.");

	this.fullStats();
}

/**
 * @class Village guard
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageGuard = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageGuard.factory.frequency = 0;
RPG.Beings.VillageGuard.visual = { desc:"elder's guard", color:"#f00", image:"village-guard" };
RPG.Beings.VillageGuard.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);

	this.setConfirm(RPG.CONFIRM_ASK);
	this.setGender(RPG.GENDER_MALE);
	this.setAlignment(RPG.ALIGNMENT_LAWFUL);
	this.setFeat(RPG.FEAT_STRENGTH, 20);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);
	this.setFeat(RPG.FEAT_DEXTERITY, 20);
	this.setFeat(RPG.FEAT_MAGIC, 20);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 20);

	var sword = new RPG.Items.LongSword();
	this.equip(RPG.SLOT_WEAPON,sword);

	var shield = new RPG.Items.LargeShield();
	this.equip(RPG.SLOT_SHIELD,shield);

    var armor = new RPG.Items.ChainMail();
    this.equip(RPG.SLOT_ARMOR,armor);
	
	this._ai.setDialogText("Hey there! Friend or foe?");

	this.fullStats();
}

/**
 * @class Village smith
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageSmith = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageSmith.factory.frequency = 0;
RPG.Beings.VillageSmith.visual = { desc:"dwarven smith", color:"#999", ch:"h", image:"village-smith" };
RPG.Beings.VillageSmith.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);

	this.setConfirm(RPG.CONFIRM_ASK);
	this.setGender(RPG.GENDER_MALE);
	this.setAlignment(RPG.ALIGNMENT_LAWFUL);
	this.setFeat(RPG.FEAT_STRENGTH, 20);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);
	this.setFeat(RPG.FEAT_DEXTERITY, 20);
	this.setFeat(RPG.FEAT_MAGIC, 10);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 20);
	
	var hammer = new RPG.Items.Hammer();
	this.equip(RPG.SLOT_WEAPON, hammer);
	
	this.fullStats();
}

/**
 * @class Village elder
 * @augments RPG.Beings.NPC
 */
RPG.Beings.VillageElder = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.VillageElder.factory.frequency = 0;
RPG.Beings.VillageElder.visual = { desc:"village elder", color:"#960", image:"village-elder" };
RPG.Beings.VillageElder.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);

	this.setConfirm(RPG.CONFIRM_ASK);
	this.setGender(RPG.GENDER_MALE);
	this.setAlignment(RPG.ALIGNMENT_LAWFUL);
	this.setFeat(RPG.FEAT_STRENGTH, 20);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);
	this.setFeat(RPG.FEAT_DEXTERITY, 20);
	this.setFeat(RPG.FEAT_MAGIC, 20);
	this.setFeat(RPG.FEAT_DV, 10);
	this.setFeat(RPG.FEAT_PV, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 20);
	
	var sword = new RPG.Items.LongSword();
	this.equip(RPG.SLOT_WEAPON, sword);
	
	this.fullStats();
}
