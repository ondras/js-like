/**
 * @class Base abstract spell
 * @augments RPG.Visual.IVisual
 */
RPG.Spells.BaseSpell = OZ.Class()
						.implement(RPG.Visual.IVisual);
RPG.Spells.BaseSpell.factory.frequency = 0;
RPG.Spells.BaseSpell.cost = null;
RPG.Spells.BaseSpell.visual = { path:"spells" };
RPG.Spells.BaseSpell.prototype._type = RPG.SPELL_SELF;
RPG.Spells.BaseSpell.prototype.init = function(caster) {
	this._caster = caster;
}

RPG.Spells.BaseSpell.prototype.cast = function(target) {
}

RPG.Spells.BaseSpell.prototype.getCost = function() { 
	return this.constructor.cost;
}

RPG.Spells.BaseSpell.prototype.getType = function() { 
	return this._type;
}

RPG.Spells.BaseSpell.prototype.getCaster = function() {
	return this._caster;
}
