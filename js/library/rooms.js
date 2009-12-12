/**
 * @class Room with description
 * @augments RPG.Rooms.BaseRoom
 */
RPG.Rooms.Description = OZ.Class().extend(RPG.Rooms.BaseRoom);

RPG.Rooms.Description.prototype.init = function(corner1, corner2, text) {
	this.parent(corner1, corner2);
	this._text = text;
}

RPG.Rooms.Description.prototype.entered = function(being) {
	if (being != RPG.World.pc) { return; }
	RPG.UI.buffer.message(this._text);
}
