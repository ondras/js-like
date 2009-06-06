/**
 * @class AI
 * @augments RPG.Engine.Brain
 */
RPG.Engine.AI = OZ.Class().extend(RPG.Engine.Brain);
RPG.Engine.AI.prototype.yourTurn = function() {
	var being = this.being;
	var map = being.getMap();
	var world = RPG.getWorld();
	
	var myCoords = being.getCoords();
	var avail = [null];
	
	for (var i=-1;i<=1;i++) {
		for (var j=-1;j<=1;j++) {
			if (Math.abs(i) == Math.abs(j)) { continue; }
			var coords = myCoords.clone();
			coords.x += i;
			coords.y += j;
			if (map.isFree(coords)) { avail.push(coords); }
		}
	}
	
	var target = avail[Math.floor(Math.random() * avail.length)];
	if (target) {
		world.action(new RPG.Actions.Move(being, target));
	} else {
		world.action(new RPG.Actions.Wait(being));
	}
}

/**
 * @class Asynchronous interactive brain. Postpones execution and awaits user input.
 * @augments RPG.Engine.Brain
 */
RPG.Engine.Interactive = OZ.Class().extend(RPG.Engine.Brain);
RPG.Engine.Interactive.prototype.init = function(being) {
	this.parent(being);
	this._allowed = false;
	OZ.Event.add(RPG.getWorld(), "action", this.bind(this._action));
}
/**
 * World requests an action from us
 */
RPG.Engine.Interactive.prototype.yourTurn = function() {
	this._allowed = true;
}
/**
 * User decided to act somehow
 */
RPG.Engine.Interactive.prototype.action = function(actionConstructor, target, params) {
	if (!this._allowed) { return false; }
	var a = new actionConstructor(this.being, target, params);
	RPG.getWorld().action(a);
}
/**
 * Action happened
 */
RPG.Engine.Interactive.prototype._action = function(e) {
	var action = e.data;
	if (action.getSource() == this.being && action.tookTime() == true) { this._allowed = false; }
}
