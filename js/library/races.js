/**
 * @class Basic humanoid
 * @augments RPG.Races.BaseRace
 */
RPG.Races.Humanoid = OZ.Class().extend(RPG.Races.BaseRace);
RPG.Races.Humanoid.prototype.init = function() {
	this.parent();
	
	var head = new RPG.Slots.BaseSlot("Head", [RPG.Items.HeadGear]);
	this._slots.push(head);
	
	var hand = new RPG.Slots.Melee("Hand");
	this._slots.push(hand);
	this._meleeSlot = hand;
	
	var feet = new RPG.Slots.Kick("Feet")
	this._slots.push(feet);
	this._kickSlot = feet;
	
	hand.setHit(new RPG.Misc.RandomValue(4, 2));
	hand.setDamage(new RPG.Misc.RandomValue(2, 1));

	feet.setHit(new RPG.Misc.RandomValue(4, 3));
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
	this.addModifier(RPG.Feats.Strength, 3);
	this.addModifier(RPG.Feats.Toughness, 4);
	this.addModifier(RPG.Feats.Intelligence, -1);
	this.addModifier(RPG.Feats.Dexterity, 1);
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
	this.addModifier(RPG.Feats.Strength, 0);
	this.addModifier(RPG.Feats.Toughness, 2);
	this.addModifier(RPG.Feats.Intelligence, 3);
	this.addModifier(RPG.Feats.Dexterity, 2);
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
	this.addModifier(RPG.Feats.Strength, -1);
	this.addModifier(RPG.Feats.Toughness, -1);
	this.addModifier(RPG.Feats.Intelligence, 5);
	this.addModifier(RPG.Feats.Dexterity, 3);
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
	this.addModifier(RPG.Feats.Strength, 0);
	this.addModifier(RPG.Feats.Toughness, 5);
	this.addModifier(RPG.Feats.Intelligence, 1);
	this.addModifier(RPG.Feats.Dexterity, 0);
}
