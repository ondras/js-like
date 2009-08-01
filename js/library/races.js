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
	this._defaults[RPG.FEAT_INTELLIGENCE] = 11;

	var head = new RPG.Slots.BaseSlot("Head", [RPG.Items.HeadGear]);
	this._slots.push(head);
	this._headSlot = head;
	
	var hand = new RPG.Slots.Melee("Hand");
	this._slots.push(hand);
	this._meleeSlot = hand;
	
	var feet = new RPG.Slots.Kick("Feet")
	this._slots.push(feet);
	this._feetSlot = feet;
	
	hand.setHit(new RPG.Misc.RandomValue(5, 2));
	hand.setDamage(new RPG.Misc.RandomValue(2, 1));

	feet.setHit(new RPG.Misc.RandomValue(5, 3));
	feet.setDamage(new RPG.Misc.RandomValue(3, 1));
}

/**
 * @class Orc race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Orc = OZ.Class().extend(RPG.Races.Humanoid);
RPG.Races.Orc.prototype.init = function() {
	this.parent();
	this._color = "lime";
	this._image = "orc";
	this.addModifier(RPG.FEAT_STRENGTH, 3);
	this.addModifier(RPG.FEAT_TOUGHNESS, 4);
	this.addModifier(RPG.FEAT_INTELLIGENCE, -1);
	this.addModifier(RPG.FEAT_DEXTERITY, 1);
}

/**
 * @class Human race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Human = OZ.Class().extend(RPG.Races.Humanoid);
RPG.Races.Human.prototype.init = function() {
	this.parent();
	this._color = "royalblue";
	this._image = "human";
	this.addModifier(RPG.FEAT_STRENGTH, 0);
	this.addModifier(RPG.FEAT_TOUGHNESS, 2);
	this.addModifier(RPG.FEAT_INTELLIGENCE, 3);
	this.addModifier(RPG.FEAT_DEXTERITY, 2);
}

/**
 * @class Elven race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Elf = OZ.Class().extend(RPG.Races.Humanoid);
RPG.Races.Elf.prototype.init = function() {
	this.parent();
	this._color = "limegreen";
	this._image = "elf";
	this.addModifier(RPG.FEAT_STRENGTH, -1);
	this.addModifier(RPG.FEAT_TOUGHNESS, -1);
	this.addModifier(RPG.FEAT_INTELLIGENCE, 5);
	this.addModifier(RPG.FEAT_DEXTERITY, 3);
}

/**
 * @class Dwarven race
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Dwarf = OZ.Class().extend(RPG.Races.Humanoid);
RPG.Races.Dwarf.prototype.init = function() {
	this.parent();
	this._color = "khaki";
	this._image = "dwarf";
	this.addModifier(RPG.FEAT_STRENGTH, 0);
	this.addModifier(RPG.FEAT_TOUGHNESS, 5);
	this.addModifier(RPG.FEAT_INTELLIGENCE, 1);
	this.addModifier(RPG.FEAT_DEXTERITY, 0);
}

/**
 * @class Animal race
 * @auguments RPG.Races.BaseRace
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
	this._defaults[RPG.FEAT_INTELLIGENCE] = 7;

	var teeth = new RPG.Slots.Melee("Teeth");
	this._slots.push(teeth);
	this._meleeSlot = teeth;
	
	teeth.setHit(new RPG.Misc.RandomValue(5, 2));
	teeth.setDamage(new RPG.Misc.RandomValue(2, 1));
}
