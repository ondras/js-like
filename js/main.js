/* a simple level */
var nx = 10;
var ny = 6;
var size = new RPG.Misc.Coords(nx, ny);
var l = new RPG.Engine.Level(size);
for (var i=0;i<size.x;i++) {
	for (var j=0;j<size.y;j++) {
		var c = new RPG.Misc.Coords(i, j);
		if (Math.min(i,j) == 0 || i == nx-1 || j == ny-1 || (i == 4 && j == 2)) {
			l.setCell(c, new RPG.Cells.Wall());
		} else {
			l.setCell(c, new RPG.Cells.Corridor());
		}
	}
}

/* add some items */
var d = new RPG.Items.Dagger();
l.at(new RPG.Misc.Coords(3, 3)).addItem(d);

var d = new RPG.Items.Weapon();
l.at(new RPG.Misc.Coords(2, 2)).addItem(d);

/* add some beings */
var orc = new RPG.Beings.Orc();
var brain = new RPG.Engine.Interactive(orc);
l.at(new RPG.Misc.Coords(1, 1)).setBeing(orc);

var orc2 = new RPG.Beings.Orc();
var brain2 = new RPG.Engine.AI(orc2);
l.at(new RPG.Misc.Coords(4, 4)).setBeing(orc2);

/* setup the world */
var world = new RPG.Engine.World();
world.useScheduler(new RPG.Engine.Queue());
world.useLevel(l);

/* attach visualizers */

var map = new RPG.Visual.ImageMap(OZ.$("map"));
map.setActor(orc);
map.setWorld(world);

var ascii = new RPG.Visual.ASCIIMap(OZ.$("ascii"));
ascii.setActor(orc);
ascii.setWorld(world);

var text = new RPG.Visual.TextBuffer(OZ.$("ta"));
text.setActor(orc);
text.setWorld(world);

/* go! :-) */
world.run();


/* ==== misc ui stuff below ========= */

var move = function(dir) {
	var ctor = null;
	var coords = world.info(brain.being, RPG.INFO_POSITION);
	switch (dir) {
		case "up":
			ctor = RPG.Actions.Move;
			coords.y--;
		break;
		case "left":
			ctor = RPG.Actions.Move;
			coords.x--;
		break;
		case "right":
			ctor = RPG.Actions.Move;
			coords.x++;
		break;
		case "down":
			ctor = RPG.Actions.Move;
			coords.y++;
		break;
	}
	brain.userAct(ctor, coords);
}

var domclick = function(e) {
	move(this.id);
}


var keypress = function(e) {
	switch (e.keyCode) {
		case 37: 
			move("left");
		break;
		case 38: 
			move("up");
		break;
		case 39: 
			move("right");
		break;
		case 40: 
			move("down");
		break;
		default:
			return;
		break;
	}
	OZ.Event.prevent(e);
}

OZ.Event.add(OZ.$("up"), "click", domclick);
OZ.Event.add(OZ.$("left"), "click", domclick);
OZ.Event.add(OZ.$("right"), "click", domclick);
OZ.Event.add(OZ.$("down"), "click", domclick);
OZ.Event.add(document, "keydown", keypress);
