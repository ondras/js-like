/**
 * @class Basic humanoid
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Humanoid = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Humanoid.visual = { ch:"@" };
RPG.Races.Humanoid.prototype.init = function() {
	this.parent();
	
	/* humanoids are average beings; their defaults are not altered */

	this._slots[RPG.SLOT_HEAD] = new RPG.Slots.BaseSlot("Head", RPG.Items.HeadGear);
	this._slots[RPG.SLOT_ARMOR] = new RPG.Slots.BaseSlot("Armor", RPG.Items.Armor);
	this._slots[RPG.SLOT_SHIELD] = new RPG.Slots.Shield("Shield");
	this._slots[RPG.SLOT_LRING] = new RPG.Slots.BaseSlot("Left ring", RPG.Items.Ring);
	this._slots[RPG.SLOT_RRING] = new RPG.Slots.BaseSlot("Right ring", RPG.Items.Ring);
	this._slots[RPG.SLOT_PROJECTILE] = new RPG.Slots.Projectile("Quiver");
	this._slots[RPG.SLOT_NECK] = new RPG.Slots.BaseSlot("Neck", RPG.Items.Necklace);
	
	var weapon = new RPG.Slots.Weapon("Weapon");
	this._slots[RPG.SLOT_WEAPON] = weapon;
	weapon.setHit(new RPG.RandomValue(3, 4));
	weapon.setDamage(new RPG.RandomValue(2, 1));
	
	var feet = new RPG.Slots.Kick("Feet");
	feet.setHit(new RPG.RandomValue(3, 3));
	feet.setDamage(new RPG.RandomValue(3, 1));
	this._slots[RPG.SLOT_FEET] = feet;
}

/**
 * @class Orc race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Orc = OZ.Class().extend(RPG.Races.Humanoid);
RPG.Races.Orc.visual = { image:"orc", desc:"orc", color:"#0f0" };
RPG.Races.Orc.prototype.init = function() {
	this.parent();
	
	this._defaults[RPG.FEAT_STRENGTH] += 3;
	this._defaults[RPG.FEAT_TOUGHNESS] += 4;
	this._defaults[RPG.FEAT_MAGIC] += -1;
	this._defaults[RPG.FEAT_DEXTERITY] += 1;
}

/**
 * @class Human race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Human = OZ.Class().extend(RPG.Races.Humanoid);
RPG.Races.Human.visual = { image:"human", desc:"human", color:"#36c" };
RPG.Races.Human.prototype.init = function() {
	this.parent();
	this._defaults[RPG.FEAT_STRENGTH] += 0;
	this._defaults[RPG.FEAT_TOUGHNESS] += 2;
	this._defaults[RPG.FEAT_MAGIC] += 3;
	this._defaults[RPG.FEAT_DEXTERITY] += 2;
}

/**
 * @class Elven race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Elf = OZ.Class().extend(RPG.Races.Humanoid);
RPG.Races.Elf.visual = { image:"elf", desc:"elf", color:"#3c3" };
RPG.Races.Elf.prototype.init = function() {
	this.parent();
	this._defaults[RPG.FEAT_STRENGTH] -= 1;
	this._defaults[RPG.FEAT_TOUGHNESS] += -1;
	this._defaults[RPG.FEAT_MAGIC] += 5;
	this._defaults[RPG.FEAT_DEXTERITY] += 3;
}

/**
 * @class Dwarven race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Dwarf = OZ.Class().extend(RPG.Races.Humanoid);
RPG.Races.Dwarf.visual = { image:"dwarf", desc:"dwarf", color:"#fc6" };
RPG.Races.Dwarf.prototype.init = function() {
	this.parent();
	this._defaults[RPG.FEAT_TOUGHNESS] += 5;
	this._defaults[RPG.FEAT_MAGIC] += 1;
}

/**
 * @class Animal race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Animal = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Animal.prototype.init = function() {
	this.parent();
	
	this._defaults[RPG.FEAT_STRENGTH] -= 2;
	this._defaults[RPG.FEAT_TOUGHNESS] -= 2;
	this._defaults[RPG.FEAT_DEXTERITY] += 1;
	this._defaults[RPG.FEAT_MAGIC] -= 4;

	var teeth = new RPG.Slots.Weapon("Teeth");
	teeth.setHit(new RPG.RandomValue(5, 4));
	teeth.setDamage(new RPG.RandomValue(2, 1));
	this._slots[RPG.SLOT_WEAPON] = teeth;
}
