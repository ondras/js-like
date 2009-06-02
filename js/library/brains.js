RPG.Engine.AI = OZ.Class().extend(RPG.Engine.Brain);
RPG.Engine.AI.prototype.act = function() {
	var being = this.being;
	var world = being.getWorld();
	
	var myCoords = world.info(being, RPG.INFO_POSITION);
	var avail = [null];
	
	for (var i=-1;i<=1;i++) {
		for (var j=-1;j<=1;j++) {
			if (Math.abs(i) == Math.abs(j)) { continue; }
			var coords = myCoords.clone();
			coords.x += i;
			coords.y += j;
			var cell = world.info(being, RPG.INFO_CELL, coords);
			if (cell.isFree()) { avail.push(coords); }
		}
	}
	
	var target = avail[Math.floor(Math.random() * avail.length)];
	if (target) {
		return new RPG.Actions.Move(being, target);
	} else {
		return new RPG.Actions.Wait(being);
	}
}

/**
 * Asynchronous interactive brain. Postpones execution and awaits user input.
 */
RPG.Engine.Interactive = OZ.Class().extend(RPG.Engine.Brain);
RPG.Engine.Interactive.prototype.init = function(being) {
	this.parent(being);
	this.allowed = false;
}
/**
 * World requests an action from us
 */
RPG.Engine.Interactive.prototype.act = function() {
	this.allowed = true;
	return false;
}
/**
 * User decided to act somehow
 */
RPG.Engine.Interactive.prototype.userAct = function(actionConstructor, target, params) {
	if (!this.allowed) { return false; }
	this.allowed = false;
	var a = new actionConstructor(this.being, target, params);
	this.being.getWorld().act(a);
	return true;
}
