/**
 * Base RPG components.
 */
var RPG = {
	world:null,
	
	Misc:{},
	Engine:{},
	Visual:{},
	
	Actions:{},
	Feats:{},
	Items:{},
	Beings:{},
	Cells:{},
	Races:{}
}

RPG.getWorld = function() {
	return this._world;
}

RPG.CELL_BLOCKED 	= 1;
RPG.ITEM_PICKABLE 	= 1;

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
