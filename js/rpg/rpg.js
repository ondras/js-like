/**
 * @namespace
 * Base RPG components.
 */
var RPG = {}

/** @namespace */
RPG.Actions = {};
/** @namespace */
RPG.Misc = {};
/** @namespace */
RPG.Engine = {};
/** @namespace */
RPG.Visual = {};
/** @namespace */
RPG.Feats = {};
/** @namespace */
RPG.Items = {};
/** @namespace */
RPG.Beings = {};
/** @namespace */
RPG.Cells = {};
/** @namespace */
RPG.Races = {};

RPG.CELL_BLOCKED 	= 1 << 0;

RPG.ITEM_PICKABLE	= 1 << 0;
RPG.ITEM_EDIBLE		= 1 << 1;

RPG.MODIFIER_PLUS	= 0;
RPG.MODIFIER_TIMES	= 1;

RPG.GENDER_MALE		= 0;
RPG.GENDER_FEMALE	= 1;
RPG.GENDER_NEUTER	= 2;

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
