RPG.Beings.Orc = OZ.Class().extend(RPG.Beings.BaseBeing);
RPG.Beings.Orc.prototype.init = function() {
	this.parent(new RPG.Races.Orc());
	this._items.push(new RPG.Items.Dagger());
}
