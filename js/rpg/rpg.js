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

RPG.INFO_POSITION	= 0;
RPG.INFO_CELL		= 1;
RPG.INFO_SIZE		= 2;

RPG.MODIFIER_PLUS	= 0;
RPG.MODIFIER_TIMES	= 1;
