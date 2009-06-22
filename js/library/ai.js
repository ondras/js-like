/**
 * @class AI
 */
RPG.Engine.AI = OZ.Class();

RPG.Engine.AI.prototype.init = function(being) {
	this.being = being;
	being.yourTurn = this.bind(this.yourTurn);
}

RPG.Engine.AI.prototype.yourTurn = function() {
	var being = this.being;
	var map = being.getMap();
	
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
		RPG.World.action(new RPG.Actions.Move(being, target));
	} else {
		RPG.World.action(new RPG.Actions.Wait(being));
	}
}
