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
