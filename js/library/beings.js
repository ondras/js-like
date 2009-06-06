/**
 * @class Orc
 * @augments RPG.Beings.BaseBeing
 */
RPG.Beings.Orc = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.Orc.prototype.init = function() {
	this.parent(new RPG.Races.Orc());
	this._items.push(new RPG.Items.Dagger(3, 2));
//	this._feats.strength = new RPG.Feats.Strength(7);
}
