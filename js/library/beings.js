/**
 * @class Goblin
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Goblin = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Goblin.prototype.init = function() {
	/* goblins are below-average humanoids */
	this.parent(new RPG.Races.Humanoid());
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 9);
	this.setFeat(RPG.FEAT_TOUGHNESS, 9);
	this.setFeat(RPG.FEAT_DEXTERITY, 9);
	this.setFeat(RPG.FEAT_MAGIC, 9);
	
	this._description = "goblin";
	this._char = "g";
	this._color = "mediumblue";
	this._image = "goblin";
	
	if (Math.randomPercentage() < 21) {
		var dagger = new RPG.Items.Dagger();
		this.addItem(dagger);
		this.equip(dagger, this.getMeleeSlot());
	}
	
	if (Math.randomPercentage() < 21) {
		var cap = new RPG.Items.MetalCap();
		this.addItem(cap);
		this.equip(cap, this.getHeadSlot());
	}
	
	if (Math.randomPercentage() < 21) {
		var boots = new RPG.Items.LeatherBoots();
		this.addItem(boots);
		this.equip(boots, this.getFeetSlot());
	}
	
	this.fullStats();
}

/**
 * @class Villager
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Villager = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Villager.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_NEUTRAL);
	
	this._description = "villager";
	this._char = "@";
	this._color = "peru";
	this._image = "villager";
	
	this.fullStats();
}

/**
 * @class Hoboblin
 * @augments RPG.Beings.Goblin
 */
RPG.Beings.Hobgoblin = OZ.Class().extend(RPG.Beings.Goblin);
RPG.Beings.Hobgoblin.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());
	
	this.adjustFeat(RPG.FEAT_STRENGTH, 2);
	this.adjustFeat(RPG.FEAT_TOUGHNESS, 2);

	this._color = "yellowgreen";
	this._description = "hobgoblin";
	this._image = "hobgoblin";
	
	this.fullStats();	
}

/**
 * @class Hobgoblin leader
 * @augments RPG.Beings.Hobgoblin
 */
RPG.Beings.HobgoblinLeader = OZ.Class().extend(RPG.Beings.Hobgoblin);
RPG.Beings.HobgoblinLeader.factory.frequency = 15;
RPG.Beings.HobgoblinLeader.prototype.init = function() {
	this.parent();
	
	this.adjustFeat(RPG.FEAT_STRENGTH, 2);
	this.adjustFeat(RPG.FEAT_TOUGHNESS, 2);
	
	this._color = "forestgreen";
	this._description = "hobgoblin leader";
	this._image = "hobgoblin-leader";

	this.fullStats();
}

/**
 * @class Troll
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Troll = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Troll.factory.frequency = 10;
RPG.Beings.Troll.prototype.init = function() {
	/* trolls are above-average humanoids */
	this.parent(new RPG.Races.Humanoid());
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 18);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);
	this.setFeat(RPG.FEAT_DEXTERITY, 11);
	this.setFeat(RPG.FEAT_MAGIC, 5);
	this.setFeat(RPG.FEAT_PV, 5);

	this._char = "T";
	this._color = "darkgray";
	this._description = "troll";
	this._image = "troll";
	
	this.getMeleeSlot().setHit(new RPG.Misc.RandomValue(10, 5));


	this.fullStats();
}

/**
 * @class God, useful for debugging.
 * @augments RPG.Beings.PC
 */
RPG.Beings.God = OZ.Class().extend(RPG.Beings.PC);
RPG.Beings.God.prototype.getVisibleCoords = function() {
	var arr = [];
	var map = this._cell.getMap();
	var size = map.getSize();
	var c = new RPG.Misc.Coords(0, 0);
	for (var i=0;i<size.x;i++) {
		for (var j=0;j<size.y;j++) {
			c.x = i;
			c.y = j;
			var cell = map.at(c);
			if (cell) { arr.push(cell.getCoords()); }
		}
	}
	return arr;
}

RPG.Beings.God.prototype.updateVisibility = function() {
}

RPG.Beings.God.prototype.canSee = function(coords) {
	return true;
}

/**
 * @class Rat 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Rat = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Rat.factory.frequency = 110;
RPG.Beings.Rat.prototype.init = function() {
	this.parent(new RPG.Races.Animal());
	
	this.setFeat(RPG.FEAT_TOUGHNESS, 7);
	this.setFeat(RPG.FEAT_DEXTERITY, 14);

	this._char = "r";
	this._color = "silver";
	this._description = "rat";
	this._image = "rat";

	this.fullStats();
}

/**
 * @class GiantRat 
 * @augments RPG.Beings.Rat
 */
RPG.Beings.GiantRat = OZ.Class().extend(RPG.Beings.Rat);
RPG.Beings.GiantRat.factory.frequency = 85;
RPG.Beings.GiantRat.prototype.init = function() {
	this.parent();
	
	var f = this._feats[RPG.FEAT_MAX_HP];
	this.setFeat(RPG.FEAT_MAX_HP, Math.round(f.getBase() * 1.5));

	this._color = "saddlebrown";
	this._description = "giant rat";
	this._image = "giant-rat";

	this.fullStats();
}

/**
 * @class Bat 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Bat = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Bat.factory.frequency = 100;
RPG.Beings.Bat.prototype.init = function() {
	this.parent(new RPG.Races.Animal());
	
	this.setFeat(RPG.FEAT_TOUGHNESS, 7);
	this.setFeat(RPG.FEAT_DEXTERITY, 14);
	this.setFeat(RPG.FEAT_DV, 2);

	this._char = "b";
	this._color = "darkgray";
	this._description = "bat";
	this._image = "bat";

	this.fullStats();
}

/**
 * @class GiantBat 
 * @augments RPG.Beings.Bat
 */
RPG.Beings.GiantBat = OZ.Class().extend(RPG.Beings.Bat);
RPG.Beings.GiantBat.factory.frequency = 85;
RPG.Beings.GiantBat.prototype.init = function() {
	this.parent();
	
	var f = this._feats[RPG.FEAT_MAX_HP];
	this.setFeat(RPG.FEAT_MAX_HP, Math.round(f.getBase() * 1.5));

	this._char = "B";
	this._color = "saddlebrown";
	this._description = "giant bat";
	this._image = "giant-bat";

	this.fullStats();
}

/**
 * @class Wolf 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Wolf = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Wolf.factory.frequency = 10;
RPG.Beings.Wolf.prototype.init = function() {
	this.parent(new RPG.Races.Animal());
	
	this.setFeat(RPG.FEAT_STRENGTH, 10);
	this.setFeat(RPG.FEAT_TOUGHNESS, 10);
	this.setFeat(RPG.FEAT_DEXTERITY, 11);
	this.getMeleeSlot().setHit(new RPG.Misc.RandomValue(7, 4));

	this._char = "d";
	this._color = "white";
	this._description = "wolf";
	this._image = "wolf";

	this.fullStats();
}

/**
 * @class Dog 
 * @augments RPG.Beings.Wolf
 */
RPG.Beings.Dog = OZ.Class().extend(RPG.Beings.Wolf);
RPG.Beings.Dog.factory.frequency = 40;
RPG.Beings.Dog.prototype.init = function() {
	this.parent();
	
	this.setFeat(RPG.FEAT_STRENGTH, 9);

	this._char = "d";
	this._color = "darkkhaki";
	this._description = "dog";
	this._image = "dog";

	this.fullStats();
}

/**
 * @class Jackal 
 * @augments RPG.Beings.Wolf
 */
RPG.Beings.Jackal = OZ.Class().extend(RPG.Beings.Wolf);
RPG.Beings.Jackal.factory.frequency = 20;
RPG.Beings.Jackal.prototype.init = function() {
	this.parent();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 9);
	this.setFeat(RPG.FEAT_TOUGHNESS,9 );

	this._char = "d";
	this._color = "darkgray";
	this._description = "jackal";
	this._image = "jackal";

	this.fullStats();
}

/**
 * @class Bear 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Bear = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Bear.factory.frequency = 50;
RPG.Beings.Bear.prototype.init = function() {
	this.parent(new RPG.Races.Animal());
	
	this.setFeat(RPG.FEAT_STRENGTH, 14);
	this.setFeat(RPG.FEAT_TOUGHNESS, 14);
	this.setFeat(RPG.FEAT_DEXTERITY, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 10);
	this.setFeat(RPG.FEAT_SPEED, 90);
	this.setFeat(RPG.FEAT_PV, 4);

	this._char = "N";
	this._color = "brown";
	this._description = "bear";
	this._image = "bear";

	this.fullStats();
}

/**
 * @class Snake 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Snake = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Snake.factory.frequency = 20;
RPG.Beings.Snake.prototype.init = function() {
	this.parent(new RPG.Races.Animal());
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 7);
	this.setFeat(RPG.FEAT_TOUGHNESS, 7);
	this.setFeat(RPG.FEAT_DEXTERITY, 14);
	this.setFeat(RPG.FEAT_SPEED, 105);

	this._char = "s";
	this._color = "red";
	this._description = "snake";
	this._image = "snake";

	this.fullStats();
}

/**
 * @class Orc 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Orc = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Orc.factory.frequency = 100;
RPG.Beings.Orc.prototype.init = function() {
	this.parent(new RPG.Races.Orc());
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 12);
	this.setFeat(RPG.FEAT_TOUGHNESS, 12);
	this.setFeat(RPG.FEAT_DEXTERITY, 9);
	this.setFeat(RPG.FEAT_MAGIC, 10);
	
	this._description = "orc";
	this._char = "o";
	this._color = "lime";
	this._image = "orc";
	
	if (Math.randomPercentage() < 21) {
		var dagger = new RPG.Items.OrcishDagger();
		this.addItem(dagger);
		this.equip(dagger, this.getMeleeSlot());
	}
	
	if (Math.randomPercentage() < 21) {
		var cap = new RPG.Items.MetalCap();
		this.addItem(cap);
		this.equip(cap, this.getHeadSlot());
	}
	
	this.fullStats();
}

/**
 * @class LargeOrc 
 * @augments RPG.Beings.Orc
 */
RPG.Beings.LargeOrc = OZ.Class().extend(RPG.Beings.Orc);
RPG.Beings.LargeOrc.factory.frequency = 70;
RPG.Beings.LargeOrc.prototype.init = function() {
	this.parent();
	
	this.setFeat(RPG.FEAT_STRENGTH, 13);
	this.setFeat(RPG.FEAT_TOUGHNESS, 13);
	
	this._description = "large orc";
	this._char = "o";
	this._color = "limegreen";
	this._image = "orc-large";
	
	if (Math.randomPercentage() < 41) {
		var dagger = new RPG.Items.OrcishDagger();
		this.addItem(dagger);
		this.equip(dagger, this.getMeleeSlot());
	}
	
	if (Math.randomPercentage() < 21) {
		var cap = new RPG.Items.MetalCap();
		this.addItem(cap);
		this.equip(cap, this.getHeadSlot());
	}
	
	this.fullStats();
}

/**
 * @class Orc Chieftain 
 * @augments RPG.Beings.Orc
 */
RPG.Beings.OrcChieftain = OZ.Class().extend(RPG.Beings.Orc);
RPG.Beings.OrcChieftain.factory.frequency = 15;
RPG.Beings.OrcChieftain.prototype.init = function() {
	this.parent();
	
	this.setFeat(RPG.FEAT_STRENGTH, 13);
	this.setFeat(RPG.FEAT_TOUGHNESS, 13);
	this.setFeat(RPG.FEAT_DEXTERITY, 11); 
	this.setFeat(RPG.FEAT_MAGIC, 11); 
	
	this._description = "orc chieftain";
	this._char = "o";
	this._color = "limegreen";
	this._image = "orc-chieftain";
	
	if (Math.randomPercentage() < 41) {
		var dagger = new RPG.Items.OrcishDagger();
		this.addItem(dagger);
		this.equip(dagger, this.getMeleeSlot());
	}
	
	if (Math.randomPercentage() < 41) {
		var cap = new RPG.Items.MetalCap();
		this.addItem(cap);
		this.equip(cap, this.getHeadSlot());
	}
	
	this.fullStats();
}

/**
 * @class Ogre 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Ogre = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Ogre.factory.frequency = 20;
RPG.Beings.Ogre.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 14);
	this.setFeat(RPG.FEAT_TOUGHNESS, 14);
	this.setFeat(RPG.FEAT_DEXTERITY, 9);
	this.setFeat(RPG.FEAT_MAGIC, 7);
	
	this._description = "ogre";
	this._char = "O";
	this._color = "lime";
	this._image = "ogre";
	
	this.fullStats();
}

/**
 * @class Gnoll 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Gnoll = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Gnoll.factory.frequency = 60;
RPG.Beings.Gnoll.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 13);
	this.setFeat(RPG.FEAT_TOUGHNESS, 13);
	this.setFeat(RPG.FEAT_DEXTERITY, 9);
	this.setFeat(RPG.FEAT_MAGIC, 8);
	
	this._description = "gnoll";
	this._char = "g";
	this._color = "brown";
	this._image = "gnoll";
	
	if (Math.randomPercentage() < 31) {
		var axe = new RPG.Items.Axe();
		this.addItem(axe);
		this.equip(axe, this.getMeleeSlot());
	}

	this.fullStats();
}

/**
 * @class Kobold 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Kobold = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Kobold.factory.frequency = 50;
RPG.Beings.Kobold.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 10);
	this.setFeat(RPG.FEAT_TOUGHNESS, 8);
	this.setFeat(RPG.FEAT_DEXTERITY, 12);
	this.setFeat(RPG.FEAT_MAGIC, 9);
	
	this._description = "kobold";
	this._char = "k";
	this._color = "lime";
	this._image = "kobold";
	
	if (Math.randomPercentage() < 31) {
		var club = new RPG.Items.Club();
		this.addItem(club);
		this.equip(club, this.getMeleeSlot());
	}

	this.fullStats();
}

/**
 * @class Undead 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Undead = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Undead.factory.ignore = true;
RPG.Beings.Undead.prototype.init = function(race) {
	this.parent(race);
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
}

/**
 * @class Skeleton 
 * @augments RPG.Beings.Undead
 */
RPG.Beings.Skeleton = OZ.Class().extend(RPG.Beings.Undead);
RPG.Beings.Skeleton.factory.frequency = 25;
RPG.Beings.Skeleton.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());
	
	this._description = "skeleton";
	this._char = "z";
	this._color = "gainsboro";
	this._image = "skeleton";
	
	if (Math.randomPercentage() < 21) {
		var sword = new RPG.Items.ShortSword();
		this.addItem(sword);
		this.equip(sword, this.getMeleeSlot());
	}

	this.fullStats();
}

/**
 * @class Zombie 
 * @augments RPG.Beings.Undead
 */
RPG.Beings.Zombie = OZ.Class().extend(RPG.Beings.Undead);
RPG.Beings.Zombie.factory.frequency = 25;
RPG.Beings.Zombie.prototype.init = function() {
	this.parent(new RPG.Races.Humanoid());
	this.randomGender();

	this.adjustFeat(RPG.FEAT_STRENGTH, 3);
	this.adjustFeat(RPG.FEAT_DEXTERITY, -2);
	this.adjustFeat(RPG.FEAT_MAGIC, -5);
	
	this._description = "zombie";
	this._char = "z";
	this._color = "goldenrod";
	this._image = "zombie";
	
	this.fullStats();
}
