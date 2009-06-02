/**
 * Basic feats
 */
RPG.Feats.HP = OZ.Class().extend(RPG.Feats.AbstractFeat);
RPG.Feats.HP.prototype.init = function(baseValue) {
	this.parent(baseValue);
}
