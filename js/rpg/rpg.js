/**
 * @namespace
 * Base RPG components.
 */
var RPG = {}

/** @namespace */
RPG.Beings = {};

/** @namespace */
RPG.Cells = {};

/** @namespace */
RPG.Decorators = {};

/** @namespace */
RPG.Effects = {};

/** @namespace */
RPG.Factories = {};

RPG.Feats = [];

/** @namespace */
RPG.Features = {};

/** @namespace */
RPG.Generators = {};

/** @namespace */
RPG.Items = {};

/** @namespace */
RPG.Misc = {};

/** @namespace */
RPG.Professions = {};

/** @namespace */
RPG.Quests = {};

/** @namespace */
RPG.Races = {};

/** @namespace */
RPG.Areas = {};

/** @namespace */
RPG.Rules = {};

/** @namespace */
RPG.Slots = {};

/** @namespace */
RPG.Spells = {};

/** @namespace */
RPG.UI = {};

/* Cell and Feature blocking */

/** @constant */
RPG.BLOCKS_NOTHING		= 0;
/** @constant */
RPG.BLOCKS_MOVEMENT	 	= 1; /* can not be moved onto (but lets light through) */
/** @constant */
RPG.BLOCKS_ITEMS 		= 2; /* Items can not go here, either */
/** @constant */
RPG.BLOCKS_LIGHT 		= 3; /* can not be seen through, e.g. a wall */

/* Being sexes */

/** @constant */
RPG.GENDER_MALE			= 0;
/** @constant */
RPG.GENDER_FEMALE		= 1;
/** @constant */
RPG.GENDER_NEUTER		= 2;

/* UI states */

/** @constant */
RPG.UI_NORMAL			= 0;
/** @constant */
RPG.UI_LOCKED			= 1;
/** @constant */
RPG.UI_WAIT_DIRECTION	= 2;
/** @constant */
RPG.UI_WAIT_TARGET		= 3;

/* AI states */

/** @constant */
RPG.AI_OK				= 0;
/** @constant */
RPG.AI_ALREADY_DONE		= 1;
/** @constant */
RPG.AI_IMPOSSIBLE		= 2;

/* Map memory states */

/** @constant */
RPG.MAP_UNKNOWN			= 0;
/** @constant */
RPG.MAP_VISIBLE			= 1;
/** @constant */
RPG.MAP_REMEMBERED		= 2;

/* Being alignments */

/** @constant */
RPG.ALIGNMENT_CHAOTIC	= 0;
/** @constant */
RPG.ALIGNMENT_NEUTRAL	= 1;
/** @constant */
RPG.ALIGNMENT_LAWFUL	= 2;

/* Feats */

/** @constant */
RPG.FEAT_STRENGTH		= 0;
/** @constant */
RPG.FEAT_TOUGHNESS		= 1;
/** @constant */
RPG.FEAT_DEXTERITY		= 2;
/** @constant */
RPG.FEAT_MAGIC			= 3;
/** @constant */
RPG.FEAT_LUCK			= 4;
/** @constant */
RPG.FEAT_MAX_HP			= 5;
/** @constant */
RPG.FEAT_MAX_MANA		= 6;
/** @constant */
RPG.FEAT_DV				= 7;
/** @constant */
RPG.FEAT_PV				= 8;
/** @constant */
RPG.FEAT_SPEED			= 9;
/** @constant */
RPG.FEAT_HIT			= 10;
/** @constant */
RPG.FEAT_DAMAGE			= 11;
/** @constant */
RPG.FEAT_REGEN_HP		= 12;
/** @constant */
RPG.FEAT_REGEN_MANA		= 13;
/** @constant */
RPG.FEAT_SIGHT_RANGE	= 14;

/* Stats */

/** @constant */
RPG.STAT_HP				= 0;
/** @constant */
RPG.STAT_MANA			= 1;

/* Spell types */

/** @constant */
RPG.SPELL_SELF			= 0;
/** @constant */
RPG.SPELL_TOUCH			= 1;
/** @constant */
RPG.SPELL_REMOTE		= 2;
/** @constant */
RPG.SPELL_DIRECTION		= 3;
/** @constant */
RPG.SPELL_TARGET		= 4;

/* Quest states */

/** @constant */
RPG.QUEST_NEW			= -1;
/** @constant */
RPG.QUEST_TALKED		= -2;
/** @constant */
RPG.QUEST_GIVEN			= -3;
/** @constant */
RPG.QUEST_DONE			= -4;
/** @constant */
RPG.QUEST_REWARDED		= -5;

/* Slots */

/** @constant */
RPG.SLOT_HEAD			= 0;
/** @constant */
RPG.SLOT_WEAPON			= 1;
/** @constant */
RPG.SLOT_SHIELD			= 2;
/** @constant */
RPG.SLOT_FEET			= 3;
/** @constant */
RPG.SLOT_ARMOR			= 4;
/** @constant */
RPG.SLOT_LRING			= 5;
/** @constant */
RPG.SLOT_RRING			= 6;
/** @constant */
RPG.SLOT_PROJECTILE		= 7;
/** @constant */
RPG.SLOT_NECK			= 8;

/* Save/load states */

/** @constant */
RPG.SAVELOAD_PROCESS	= 0;
/** @constant */
RPG.SAVELOAD_DONE		= 1;
/** @constant */
RPG.SAVELOAD_FAILURE	= 2;

/* Save load variants */

/** @constant */
RPG.SAVELOAD_SAVE		= 0;
/** @constant */
RPG.SAVELOAD_LOAD		= 1;

/* Attributes (special feats) */

/** @constant */
RPG.ATTRIBUTES = [RPG.FEAT_STRENGTH, RPG.FEAT_TOUGHNESS, RPG.FEAT_DEXTERITY, RPG.FEAT_MAGIC, RPG.FEAT_LUCK];

/* Directions */

/**
 * Directional constants should not be renumbered. Current numbering offers:
 * - for (i=0;i<8;i++)
 * - index + 2 (mod 8) = normal
 * - index + 4 (mod 8) = opposite
 * - index % 2 = diagonal
 */

/** @constant */
RPG.N					= 0;
/** @constant */
RPG.NE					= 1;
/** @constant */
RPG.E					= 2;
/** @constant */
RPG.SE					= 3;
/** @constant */
RPG.S					= 4;
/** @constant */
RPG.SW					= 5;
/** @constant */
RPG.W					= 6;
/** @constant */
RPG.NW					= 7;
/** @constant */
RPG.CENTER				= 8;
/** @constant */
RPG.DIR = {};

/* Action length types */

/** @constant */
RPG.ACTION_TIME 		= 0;
/** @constant */
RPG.ACTION_NO_TIME 		= 1;
/** @constant */
RPG.ACTION_DEFER		= 2;

/* Confirmation modes */

/** @constant */
RPG.CONFIRM_NA			= 0;
/** @constant */
RPG.CONFIRM_ASK			= 1;
/** @constant */
RPG.CONFIRM_DONE		= 2;

/**
 * Generates a normally distributed random number, mean = 0.
 * @param {float} stddev Standard deviation. ~95% of the absolute values will be lower than 2*stddev.
 */
Math.randomNormal = function(stddev) {
	do {
		var u = 2*Math.random()-1;
		var v = 2*Math.random()-1;
		var r = u*u + v*v;
	} while (r > 1 || r == 0);

    var gauss = u * Math.sqrt(-2*Math.log(r)/r);
    return gauss*stddev;
}

/**
 * Returns number between 1 and 100 inclusive
 */
Math.randomPercentage = function() {
	return 1 + Math.floor(Math.random() * 100);
}

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.substring(1);
}

Array.prototype.random = function() {
	if (!this.length) { return null; }
	return this[Math.floor(Math.random() * this.length)];
}

Array.prototype.clone = function() {
	var arr = [];
	for (var i=0;i<this.length;i++) { arr.push(this[i]); }
	return arr;
}

Array.prototype.transpose = function() {
	var arr = [];
	for (var i=0;i<this.length;i++) {
		var row = this[i];
		for (var j=0;j<row.length;j++) {
			if (i==0) { arr.push([]); }
			arr[j].push(this[i][j]);
		}
	}
	return arr;
}

Number.prototype.round = function(amount) {
	var mult = Math.pow(10, amount);
	return Math.round(this*mult)/mult;
}
