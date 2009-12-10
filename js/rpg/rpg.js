/**
 * @namespace
 * Base RPG components.
 */
var RPG = {}

/** @namespace */
RPG.Actions = {};

/** @namespace */
RPG.Beings = {};

/** @namespace */
RPG.Cells = {};

/** @namespace */
RPG.Decorators = {};

/** @namespace */
RPG.Dungeon = {};

/** @namespace */
RPG.Engine = {};

/** @namespace */
RPG.Effects = {};

/** @namespace */
RPG.Feats = {};

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
RPG.Races = {};

/** @namespace */
RPG.Rooms = {};

/** @namespace */
RPG.Rules = {};

/** @namespace */
RPG.Slots = {};

/** @namespace */
RPG.Spells = {};

/** @namespace */
RPG.UI = {};

/** @namespace */
RPG.Visual = {};

/** @constant */
RPG.BLOCKS_NOTHING		= 0;
/** @constant */
RPG.BLOCKS_MOVEMENT	 	= 1; /* can not be moved onto, e.g. wall */
/** @constant */
RPG.BLOCKS_LIGHT 		= 2; /* can not be seen through */

/** @constant */
RPG.GENDER_MALE			= 0;
/** @constant */
RPG.GENDER_FEMALE		= 1;
/** @constant */
RPG.GENDER_NEUTER		= 2;

/** @constant */
RPG.UI_NORMAL			= 0;
/** @constant */
RPG.UI_LOCKED			= 1;
/** @constant */
RPG.UI_WAIT_DIRECTION	= 2;
/** @constant */
RPG.UI_WAIT_DIALOG		= 3;
/** @constant */
RPG.UI_WAIT_CHAT		= 4;

/** @constant */
RPG.AI_OK				= 0;
/** @constant */
RPG.AI_RETRY			= 1;
/** @constant */
RPG.AI_IMPOSSIBLE		= 2;

/** @constant */
RPG.MAP_UNKNOWN			= 0;
/** @constant */
RPG.MAP_VISIBLE			= 1;
/** @constant */
RPG.MAP_REMEMBERED		= 2;

/** @constant */
RPG.ALIGNMENT_CHAOTIC	= 0;
/** @constant */
RPG.ALIGNMENT_NEUTRAL	= 1;
/** @constant */
RPG.ALIGNMENT_LAWFUL	= 2;

/** @constant */
RPG.FEAT_STRENGTH		= 0;
/** @constant */
RPG.FEAT_TOUGHNESS		= 1;
/** @constant */
RPG.FEAT_DEXTERITY		= 2;
/** @constant */
RPG.FEAT_MAGIC			= 3;
/** @constant */
RPG.FEAT_MAX_HP			= 4;
/** @constant */
RPG.FEAT_MAX_MANA		= 5;
/** @constant */
RPG.FEAT_DV				= 6;
/** @constant */
RPG.FEAT_PV				= 7;
/** @constant */
RPG.FEAT_SPEED			= 8;
/** @constant */
RPG.FEAT_HIT			= 9;
/** @constant */
RPG.FEAT_DAMAGE			= 10;
/** @constant */
RPG.FEAT_DAMAGE_MAGIC	= 11;
/** @constant */
RPG.FEAT_REGEN_HP		= 12;
/** @constant */
RPG.FEAT_REGEN_MANA		= 13;

/** @constant */
RPG.STAT_HP				= 0;
/** @constant */
RPG.STAT_MANA			= 1;

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

/** @constant */
RPG.ATTRIBUTES = [RPG.FEAT_STRENGTH, RPG.FEAT_TOUGHNESS, RPG.FEAT_DEXTERITY, RPG.FEAT_MAGIC];

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
	return this[Math.floor(Math.random() * this.length)];
}

Array.prototype.clone = function() {
	var arr = [];
	for (var i=0;i<this.length;i++) { arr.push(this[i]); }
	return arr;
}
