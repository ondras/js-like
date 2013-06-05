/**
 * @class Goblin
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Goblin = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Goblin.visual = { desc:"goblin", color:"#00c", image:"goblin", ch:"g" };
RPG.Beings.Goblin.prototype.init = function() {
	/* goblins are below-average humanoids */
	this.parent(RPG.Races.Humanoid);
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 9);
	this.setFeat(RPG.FEAT_TOUGHNESS, 9);
	this.setFeat(RPG.FEAT_DEXTERITY, 9);
	this.setFeat(RPG.FEAT_MAGIC, 9);
	
	if (Math.randomPercentage() < 21) {
		var dagger = new RPG.Items.Dagger();
		this.equip(RPG.SLOT_WEAPON, dagger);
	}
	
	if (Math.randomPercentage() < 21) {
		var cap = new RPG.Items.MetalCap();
		this.equip(RPG.SLOT_HEAD, cap);
	}
	
	if (Math.randomPercentage() < 21) {
		var boots = new RPG.Items.LeatherBoots();
		this.equip(RPG.SLOT_FEET, boots);
	}
	
	this.fullStats();
}

/**
 * @class Goblin rockthrower: goblin armed with rocks
 * @augments RPG.Beings.Goblin
 */
RPG.Beings.GoblinRockthrower = OZ.Class().extend(RPG.Beings.Goblin);
RPG.Beings.GoblinRockthrower.visual = { desc:"goblin rockthrower" };
RPG.Beings.GoblinRockthrower.prototype.init = function() {
	this.parent();

	var rocks = new RPG.Items.Rock().setAmount(8);
	this.equip(RPG.SLOT_PROJECTILE, rocks);
}

/**
 * @class Hoboblin
 * @augments RPG.Beings.Goblin
 */
RPG.Beings.Hobgoblin = OZ.Class().extend(RPG.Beings.Goblin);
RPG.Beings.Hobgoblin.visual = { desc:"hobgoblin", color:"#9c3", image:"hobgoblin" };
RPG.Beings.Hobgoblin.prototype.init = function() {
	this.parent();
	
	this.adjustFeat(RPG.FEAT_STRENGTH, 2);
	this.adjustFeat(RPG.FEAT_TOUGHNESS, 2);
	
	this.fullStats();	
}

/**
 * @class Hobgoblin leader
 * @augments RPG.Beings.Hobgoblin
 */
RPG.Beings.HobgoblinLeader = OZ.Class().extend(RPG.Beings.Hobgoblin);
RPG.Beings.HobgoblinLeader.factory.frequency = 15;
RPG.Beings.HobgoblinLeader.visual = { desc:"hobgoblin leader", color:"#393", image:"hobgoblin-leader" };
RPG.Beings.HobgoblinLeader.prototype.init = function() {
	this.parent();
	
	this.adjustFeat(RPG.FEAT_STRENGTH, 2);
	this.adjustFeat(RPG.FEAT_TOUGHNESS, 2);
	
	this.fullStats();
}

/**
 * @class Troll
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Troll = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Troll.factory.frequency = 10;
RPG.Beings.Troll.factory.danger = 2;
RPG.Beings.Troll.visual = { desc:"troll", color:"#999", image:"troll", ch:"T" };
RPG.Beings.Troll.prototype.init = function() {
	/* trolls are above-average humanoids */
	this.parent(RPG.Races.Humanoid);
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 18);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);
	this.setFeat(RPG.FEAT_DEXTERITY, 11);
	this.setFeat(RPG.FEAT_MAGIC, 5);
	this.setFeat(RPG.FEAT_PV, 5);

	this.getSlot(RPG.SLOT_WEAPON).setHit(new RPG.RandomValue(10, 5));

	this.fullStats();
}

/**
 * @class God, useful for debugging.
 * @augments RPG.Beings.PC
 */
RPG.Beings.God = OZ.Class().extend(RPG.Beings.PC);
RPG.Beings.God.prototype._computeVisibleCoords = function() {
	var all = {};
	var size = this._map.getSize();
	var c = new RPG.Coords(0, 0);
	for (var i=0;i<size.x;i++) {
		for (var j=0;j<size.y;j++) {
			c.x = i;
			c.y = j;
			var cell = this._map.getCell(c);
			if (cell) { all[c.x+","+c.y] = c.clone(); }
		}
	}
	return all;
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
RPG.Beings.Rat.visual = { desc:"rat", color:"#ccc", image:"rat", ch:"r" };
RPG.Beings.Rat.prototype.init = function() {
	this.parent(RPG.Races.Animal);
	
	this.setFeat(RPG.FEAT_TOUGHNESS, 7);
	this.setFeat(RPG.FEAT_DEXTERITY, 14);

	this.fullStats();
}

/**
 * @class GiantRat 
 * @augments RPG.Beings.Rat
 */
RPG.Beings.GiantRat = OZ.Class().extend(RPG.Beings.Rat);
RPG.Beings.GiantRat.factory.frequency = 85;
RPG.Beings.GiantRat.visual = { desc:"giant rat", color:"#930", image:"giant-rat" };
RPG.Beings.GiantRat.prototype.init = function() {
	this.parent();
	
	this.setFeat(RPG.FEAT_MAX_HP, Math.round(this._feats[RPG.FEAT_MAX_HP] * 1.5));

	this.fullStats();
}

/**
 * @class Bat 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Bat = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Bat.factory.frequency = 100;
RPG.Beings.Bat.visual = { desc:"bat", color:"#999", image:"bat", ch:"b" };
RPG.Beings.Bat.prototype.init = function() {
	this.parent(RPG.Races.Animal);
	
	this.setFeat(RPG.FEAT_TOUGHNESS, 7);
	this.setFeat(RPG.FEAT_DEXTERITY, 14);
	this.setFeat(RPG.FEAT_DV, 2);

	this.fullStats();
}

/**
 * @class GiantBat 
 * @augments RPG.Beings.Bat
 */
RPG.Beings.GiantBat = OZ.Class().extend(RPG.Beings.Bat);
RPG.Beings.GiantBat.factory.frequency = 85;
RPG.Beings.GiantBat.visual = { desc:"giant bat", color:"#930", image:"giant-bat", ch:"B" };
RPG.Beings.GiantBat.prototype.init = function() {
	this.parent();
	
	var f = this._feats[RPG.FEAT_MAX_HP];
	this.setFeat(RPG.FEAT_MAX_HP, Math.round(this._feats[RPG.FEAT_MAX_HP] * 1.5));

	this.fullStats();
}

/**
 * @class Wolf 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Wolf = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Wolf.factory.frequency = 10;
RPG.Beings.Wolf.visual = { desc:"wolf", color:"#fff", image:"wolf", ch:"d" };
RPG.Beings.Wolf.prototype.init = function() {
	this.parent(RPG.Races.Animal);
	
	this.setFeat(RPG.FEAT_STRENGTH, 10);
	this.setFeat(RPG.FEAT_TOUGHNESS, 10);
	this.setFeat(RPG.FEAT_DEXTERITY, 11);
	this.getSlot(RPG.SLOT_WEAPON).setHit(new RPG.RandomValue(7, 4));

	this.fullStats();
}

/**
 * @class Dog 
 * @augments RPG.Beings.Wolf
 */
RPG.Beings.Dog = OZ.Class().extend(RPG.Beings.Wolf);
RPG.Beings.Dog.factory.frequency = 40;
RPG.Beings.Dog.visual = { desc:"dog", color:"#cc6", image:"dog" };
RPG.Beings.Dog.prototype.init = function() {
	this.parent();
	
	this.setFeat(RPG.FEAT_STRENGTH, 9);

	this.fullStats();
}

/**
 * @class Jackal 
 * @augments RPG.Beings.Wolf
 */
RPG.Beings.Jackal = OZ.Class().extend(RPG.Beings.Wolf);
RPG.Beings.Jackal.factory.frequency = 20;
RPG.Beings.Jackal.visual = { desc:"jackal", color:"#999", image:"jackal" };
RPG.Beings.Jackal.prototype.init = function() {
	this.parent();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 9);
	this.setFeat(RPG.FEAT_TOUGHNESS,9 );

	this.fullStats();
}

/**
 * @class Bear 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Bear = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Bear.factory.frequency = 50;
RPG.Beings.Bear.visual = { desc:"bear", color:"#960", image:"bear", ch:"N" };
RPG.Beings.Bear.prototype.init = function() {
	this.parent(RPG.Races.Animal);
	
	this.setFeat(RPG.FEAT_STRENGTH, 14);
	this.setFeat(RPG.FEAT_TOUGHNESS, 14);
	this.setFeat(RPG.FEAT_DEXTERITY, 10);
	this.setFeat(RPG.FEAT_MAX_HP, 10);
	this.setFeat(RPG.FEAT_SPEED, 90);
	this.setFeat(RPG.FEAT_PV, 4);

	this.fullStats();
}

/**
 * @class Snake 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Snake = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Snake.factory.frequency = 20;
RPG.Beings.Snake.visual = { desc:"snake", color:"#f00", image:"snake", ch:"s" };
RPG.Beings.Snake.prototype.init = function() {
	this.parent(RPG.Races.Animal);
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 7);
	this.setFeat(RPG.FEAT_TOUGHNESS, 7);
	this.setFeat(RPG.FEAT_DEXTERITY, 14);
	this.setFeat(RPG.FEAT_SPEED, 105);

	this.fullStats();
}

/**
 * @class Orc 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Orc = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Orc.factory.frequency = 100;
RPG.Beings.Orc.visual = { desc:"orc", color:"#0f0", image:"orc", ch:"o" };
RPG.Beings.Orc.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 12);
	this.setFeat(RPG.FEAT_TOUGHNESS, 12);
	this.setFeat(RPG.FEAT_DEXTERITY, 9);
	this.setFeat(RPG.FEAT_MAGIC, 10);
	
	if (Math.randomPercentage() < 21) {
		var dagger = new RPG.Items.OrcishDagger();
		this.equip(RPG.SLOT_WEAPON, dagger);
	}
	
	if (Math.randomPercentage() < 21) {
		var cap = new RPG.Items.MetalCap();
		this.equip(RPG.SLOT_HEAD, cap);
	}
	
	this.fullStats();
}

/**
 * @class LargeOrc 
 * @augments RPG.Beings.Orc
 */
RPG.Beings.LargeOrc = OZ.Class().extend(RPG.Beings.Orc);
RPG.Beings.LargeOrc.factory.frequency = 70;
RPG.Beings.LargeOrc.visual = { desc:"large orc", color:"#3c3", image:"orc-large" };
RPG.Beings.LargeOrc.prototype.init = function() {
	this.parent();
	
	this.setFeat(RPG.FEAT_STRENGTH, 13);
	this.setFeat(RPG.FEAT_TOUGHNESS, 13);
	
	if (Math.randomPercentage() < 41) {
		var dagger = new RPG.Items.OrcishDagger();
		this.equip(RPG.SLOT_WEAPON, dagger);
	}
	
	if (Math.randomPercentage() < 21) {
		var cap = new RPG.Items.MetalCap();
		this.equip(RPG.SLOT_HEAD, cap);
	}
	
	this.fullStats();
}

/**
 * @class Orc Chieftain 
 * @augments RPG.Beings.Orc
 */
RPG.Beings.OrcChieftain = OZ.Class().extend(RPG.Beings.Orc);
RPG.Beings.OrcChieftain.factory.frequency = 15;
RPG.Beings.OrcChieftain.visual = { desc:"orc chieftain", color:"#3c3", image:"orc-chieftain" };
RPG.Beings.OrcChieftain.prototype.init = function() {
	this.parent();
	
	this.setFeat(RPG.FEAT_STRENGTH, 13);
	this.setFeat(RPG.FEAT_TOUGHNESS, 13);
	this.setFeat(RPG.FEAT_DEXTERITY, 11); 
	this.setFeat(RPG.FEAT_MAGIC, 11); 
	
	if (Math.randomPercentage() < 41) {
		var dagger = new RPG.Items.OrcishDagger();
		this.equip(RPG.SLOT_WEAPON, dagger);
	}
	
	if (Math.randomPercentage() < 41) {
		var cap = new RPG.Items.MetalCap();
		this.equip(RPG.SLOT_HEAD, cap);
	}
	
	this.fullStats();
}

/**
 * @class Ogre 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Ogre = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Ogre.factory.frequency = 20;
RPG.Beings.Ogre.factory.danger = 3;
RPG.Beings.Ogre.visual = { desc:"ogre", color:"#0f0", image:"ogre", ch:"O" };
RPG.Beings.Ogre.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 20);
	this.setFeat(RPG.FEAT_TOUGHNESS, 20);
	this.setFeat(RPG.FEAT_DEXTERITY, 11);
	this.setFeat(RPG.FEAT_MAGIC, 7);
	
	this.setFeat(RPG.FEAT_SPEED, 90);
	this.setFeat(RPG.FEAT_DV, 3);
	this.setFeat(RPG.FEAT_PV, 3);

	this.getSlot(RPG.SLOT_WEAPON).setHit(new RPG.RandomValue(10, 5));

	if (Math.randomPercentage() < 81) {
		var club = new RPG.Items.Club();
		this.equip(RPG.SLOT_WEAPON, club);
	}
	
	this.fullStats();
}

/**
 * @class Gnoll 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Gnoll = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Gnoll.factory.frequency = 60;
RPG.Beings.Gnoll.visual = { desc:"gnoll", color:"#960", image:"gnoll", ch:"g" };
RPG.Beings.Gnoll.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 13);
	this.setFeat(RPG.FEAT_TOUGHNESS, 13);
	this.setFeat(RPG.FEAT_DEXTERITY, 9);
	this.setFeat(RPG.FEAT_MAGIC, 8);
	
	if (Math.randomPercentage() < 31) {
		var axe = new RPG.Items.Axe();
		this.equip(RPG.SLOT_WEAPON, axe);
	}

	this.fullStats();
}

/**
 * @class Kobold 
 * @augments RPG.Beings.NPC
 */
RPG.Beings.Kobold = OZ.Class().extend(RPG.Beings.NPC);
RPG.Beings.Kobold.factory.frequency = 50;
RPG.Beings.Kobold.visual = { desc:"kobold", color:"#0f0", image:"kobold", ch:"k" };
RPG.Beings.Kobold.prototype.init = function() {
	this.parent(RPG.Races.Humanoid);
	this.randomGender();
	this.setAlignment(RPG.ALIGNMENT_CHAOTIC);
	
	this.setFeat(RPG.FEAT_STRENGTH, 10);
	this.setFeat(RPG.FEAT_TOUGHNESS, 8);
	this.setFeat(RPG.FEAT_DEXTERITY, 12);
	this.setFeat(RPG.FEAT_MAGIC, 9);
	
	if (Math.randomPercentage() < 31) {
		var club = new RPG.Items.Club();
		this.equip(RPG.SLOT_WEAPON, club);
	}

	this.fullStats();
}
