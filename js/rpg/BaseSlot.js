/**
 * @class Body part - place for an item
 */
RPG.Slots.BaseSlot = OZ.Class();
RPG.Slots.BaseSlot.prototype.init = function(name, allowed) {
	this._item = null;
	this._being = null;
	this._name = name;
	this._allowed = allowed;
}

RPG.Slots.BaseSlot.prototype.setBeing = function(being) {
	this._being = being;
	return this;
}

RPG.Slots.BaseSlot.prototype.filterAllowed = function(itemList) {
	var arr = [];
	for (var i=0;i<itemList.length;i++) {
		var item = itemList[i];
		if (item instanceof this._allowed && !item.isUnpaid()) { arr.push(item); }
	}
	return arr;
}

RPG.Slots.BaseSlot.prototype.setItem = function(item) {
	var it = item;
	
	if (it) {
		if (it.getAmount() == 1) {
			if (this._being.hasItem(it)) { this._being.removeItem(it); }
		} else {
			it = it.subtract(1);
		}
	}
	
	this._item = it;
	return it;
}

RPG.Slots.BaseSlot.prototype.getItem = function() {
	return this._item;
}

RPG.Slots.BaseSlot.prototype.getName = function() {
	return this._name;
}
