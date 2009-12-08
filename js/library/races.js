/**
 * @class Basic humanoid
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Humanoid = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Humanoid.prototype.init = function() {
	this.parent();
	
	this._defaults[RPG.FEAT_SPEED] = 100;
	this._defaults[RPG.FEAT_MAXHP] = 5;
	this._defaults[RPG.FEAT_DV] = 0;
	this._defaults[RPG.FEAT_PV] = 0;
	this._defaults[RPG.FEAT_STRENGTH] = 11;
	this._defaults[RPG.FEAT_TOUGHNESS] = 11;
	this._defaults[RPG.FEAT_DEXTERITY] = 11;
	this._defaults[RPG.FEAT_MAGIC] = 11;

	var head = new RPG.Slots.BaseSlot("Head", [RPG.Items.HeadGear]);
	this._slots.push(head);
	this._headSlot = head;
	
	var armor = new RPG.Slots.BaseSlot("Armor", [RPG.Items.Armor]);
	this._slots.push(armor);

	var shield = new RPG.Slots.BaseSlot("Shield", [RPG.Items.Shield]);
	this._slots.push(shield);

	var hand = new RPG.Slots.Melee("Hand");
	this._slots.push(hand);
	this._meleeSlot = hand;
	
	var lring = new RPG.Slots.BaseSlot("Left ring", [RPG.Items.Ring]);
	this._slots.push(lring);

	var rring = new RPG.Slots.BaseSlot("Right ring", [RPG.Items.Ring]);
	this._slots.push(rring);

	var feet = new RPG.Slots.Kick("Feet")
	this._slots.push(feet);
	this._feetSlot = feet;
	
	hand.setHit(new RPG.Misc.RandomValue(5, 4));
	hand.setDamage(new RPG.Misc.RandomValue(2, 1));

	feet.setHit(new RPG.Misc.RandomValue(5, 3));
	feet.setDamage(new RPG.Misc.RandomValue(3, 1));
}

/**
 * @class Orc race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Orc = OZ.Class().extend(RPG.Races.Humanoid);
RPG.Races.Orc.name = "orc";
RPG.Races.Orc.prototype.init = function() {
	this.parent();
	this._color = "lime";
	this._image = "orc";
	
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
RPG.Races.Human.name = "human";
RPG.Races.Human.prototype.init = function() {
	this.parent();
	this._color = "royalblue";
	this._image = "human";
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
RPG.Races.Elf.name = "elf";
RPG.Races.Elf.prototype.init = function() {
	this.parent();
	this._color = "limegreen";
	this._image = "elf";
	this._defaults[RPG.FEAT_STRENGTH] += 1;
	this._defaults[RPG.FEAT_TOUGHNESS] += -1;
	this._defaults[RPG.FEAT_MAGIC] += 5;
	this._defaults[RPG.FEAT_DEXTERITY] += 3;
}

/**
 * @class Dwarven race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Dwarf = OZ.Class().extend(RPG.Races.Humanoid);
RPG.Races.Dwarf.name = "dwarf";
RPG.Races.Dwarf.prototype.init = function() {
	this.parent();
	this._color = "khaki";
	this._image = "dwarf";
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
	
	this._defaults[RPG.FEAT_SPEED] = 100;
	this._defaults[RPG.FEAT_MAXHP] = 5;
	this._defaults[RPG.FEAT_DV] = 0;
	this._defaults[RPG.FEAT_PV] = 0;
	this._defaults[RPG.FEAT_STRENGTH] = 9;
	this._defaults[RPG.FEAT_TOUGHNESS] = 9;
	this._defaults[RPG.FEAT_DEXTERITY] = 12;
	this._defaults[RPG.FEAT_MAGIC] = 7;

	var teeth = new RPG.Slots.Melee("Teeth");
	this._slots.push(teeth);
	this._meleeSlot = teeth;
	
	teeth.setHit(new RPG.Misc.RandomValue(5, 4));
	teeth.setDamage(new RPG.Misc.RandomValue(2, 1));
}
