/* a simple level */
var nx = 10;
var ny = 10;
var size = new RPG.Misc.Coords(nx, ny);
var l = new RPG.Engine.Level(size);
for (var i=0;i<size.x;i++) {
	for (var j=0;j<size.y;j++) {
		var c = new RPG.Misc.Coords(i, j);
		if (Math.min(i,j) == 0 || i == nx-1 || j == ny-1) {
			l.setCell(c, new RPG.Cells.Wall());
		} else if (j > 5 && i < 6) {
			l.setCell(c, new RPG.Cells.Wall());
		} else if (j == 3 && i == 6) {
			l.setCell(c, new RPG.Cells.Wall());
		} else if (j == 4 && i == 7) {
			l.setCell(c, new RPG.Cells.Wall());
		} else {
			l.setCell(c, new RPG.Cells.Corridor());
		}
	}
}

/* add some items */
var d = new RPG.Items.Dagger();
l.addItem(new RPG.Misc.Coords(3, 3), d);

var d = new RPG.Items.Weapon();
l.addItem(new RPG.Misc.Coords(2, 2), d);

/* add some beings */
var orc = new RPG.Beings.Orc();
var brain = new RPG.Engine.Interactive(orc);
l.setBeing(new RPG.Misc.Coords(1, 1), orc);

var orc2 = new RPG.Beings.Orc();
var brain2 = new RPG.Engine.AI(orc2);
l.setBeing(new RPG.Misc.Coords(4, 4), orc2);

/* setup the world */
var world = new RPG.Engine.World();
world.useScheduler(new RPG.Engine.Queue());

/* attach visualizers */
var map = new RPG.Visual.ImageMap(OZ.$("map"));
map.setBeing(orc);

var ascii = new RPG.Visual.ASCIIMap(OZ.$("ascii"));
ascii.setBeing(orc);

var text = new RPG.Visual.TextBuffer(OZ.$("ta"));
text.setBeing(orc);

/* go! :-) */
world.useLevel(l);
world.run();


/* ==== misc ui stuff below ========= */

var move = function(dx, dy) {
	var coords = brain.being.getCoords().clone();
	coords.x += dx;
	coords.y += dy;
	brain.action(RPG.Actions.Move, coords);
}

var wait = function() {
	brain.action(RPG.Actions.Wait);
}

var domclick = function(e) {
	var target = OZ.Event.target(e);
	if (target.className != "nav") { return; }
	var r = target.id.match(/keyCode_(.*)/);
	var keyCode = parseInt(r[1], 10);
	doKeyCode(keyCode);
}

var keypress = function(e) {
	if (doKeyCode(e.keyCode)) {
		OZ.Event.prevent(e);
	}
}

var doKeyCode = function(keyCode) {
	switch (keyCode) {
		case 33: move(1, -1); break;
		case 34: move(1, 1); break;
		case 36: move(-1, -1); break;
		case 35: move(-1, 1); break;
		case 37: move(-1, 0); break;
		case 38: move(0, -1); break;
		case 39: move(1, 0); break;
		case 40: move(0, 1); break;
		case 12: 
		case 190: 
			wait();
		break;
		default: return false; break;
	}
	return true;
}

OZ.Event.add(document, "click", domclick);
OZ.Event.add(document, "keydown", keypress);
