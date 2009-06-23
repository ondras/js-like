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

var mg = new RPG.Engine.MapGen.Random(new RPG.Misc.Coords(40, 20));
var map = mg.generate();

/* add some items */
var d = new RPG.Items.Dagger();
//map.addItem(new RPG.Misc.Coords(3, 3), d);

var d = new RPG.Items.Weapon();
//map.addItem(new RPG.Misc.Coords(2, 2), d);

/* add some beings */
var pc = new RPG.Beings.Human();
map.setBeing(new RPG.Misc.Coords(0, 0), pc);
RPG.World.setPC(pc);

var orc2 = new RPG.Beings.Orc();
orc2.addItem(new RPG.Items.Dagger());
var brain2 = new RPG.Engine.AI(orc2);
//map.setBeing(new RPG.Misc.Coords(2, 2), orc2);

/* setup the world */
RPG.World.setScheduler(new RPG.Engine.Queue());

/* build ui */
var m = RPG.UI.buildASCII();
//var m = RPG.UI.buildMap();
document.body.appendChild(m);
var buffer = RPG.UI.buildBuffer()
document.body.appendChild(buffer);
var keypad = RPG.UI.buildKeypad();
document.body.appendChild(keypad);

RPG.UI.enableKeyboard();

/* go! :-) */
RPG.World.setMap(map);
RPG.World.run();
