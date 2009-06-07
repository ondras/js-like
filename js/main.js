/* a simple Map */
var nx = 10;
var ny = 10;
var size = new RPG.Misc.Coords(nx, ny);
var l = new RPG.Engine.Map(size);
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
orc.fullHP();

var orc2 = new RPG.Beings.Orc();
var brain2 = new RPG.Engine.AI(orc2);
l.setBeing(new RPG.Misc.Coords(2, 1), orc2);
orc2.fullHP();

/* setup the world */
var world = new RPG.Engine.World();
world.setScheduler(new RPG.Engine.Queue());

/* attach visualizers */
var map = new RPG.Visual.ImageMap(OZ.$("map"));
map.setBeing(orc);

var ascii = new RPG.Visual.ASCIIMap(OZ.$("ascii"));
ascii.setBeing(orc);

var text = new RPG.Visual.TextBuffer(OZ.$("ta"));
text.setBeing(orc);

/* go! :-) */
world.setMap(l);
world.run();


/* ==== misc ui stuff below ========= */

var move = function(dx, dy) {
	var being = brain.being;
	var coords = being.getCoords().clone();
	coords.x += dx;
	coords.y += dy;
	
	/* being there? */
	var cell = being.cellInfo(coords);
	var b2 = cell.getBeing();
	if (b2) {
		brain.action(RPG.Actions.Attack, b2);
	} else {
		brain.action(RPG.Actions.Move, coords);
	}
	
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
		case 105:
		case 33: move(1, -1); break;
		
		case 99:
		case 34: move(1, 1); break;

		case 103:
		case 36: move(-1, -1); break;
		
		case 97:
		case 35: move(-1, 1); break;
		
		case 100:
		case 37: move(-1, 0); break;
		
		case 104:
		case 38: move(0, -1); break;

		case 102:
		case 39: move(1, 0); break;
		
		case 98:
		case 40: move(0, 1); break;
		
		case 12: 
		case 101:
		case 190: 
			wait();
		break;
		default: return false; break;
	}
	return true;
}

OZ.Event.add(document, "click", domclick);
OZ.Event.add(document, "keydown", keypress);
