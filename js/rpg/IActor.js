/**
 * @class Actor interface
 */
RPG.IActor = OZ.Class();
RPG.IActor.prototype.getSpeed = function() {};
/**
 * World asks actor to perform an action
 */ 
RPG.IActor.prototype.yourTurn = function() {
	return RPG.ACTION_TIME;
}
RPG.IActor.prototype.getEffects = function() {
	return [];
}
