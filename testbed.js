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
l.setBeing(new RPG.Misc.Coords(1, 1), orc);
RPG.World.setPC(orc);

var orc2 = new RPG.Beings.Orc();
orc2.addItem(new RPG.Items.Dagger());
var brain2 = new RPG.Engine.AI(orc2);
l.setBeing(new RPG.Misc.Coords(2, 2), orc2);

/* setup the world */
RPG.World.setScheduler(new RPG.Engine.Queue());

/* build ui */
var map = RPG.UI.buildASCII();
document.body.appendChild(map);
var buffer = RPG.UI.buildBuffer()
document.body.appendChild(buffer);
var keypad = RPG.UI.buildKeypad();
document.body.appendChild(keypad);

RPG.UI.enableKeyboard();

/* go! :-) */
RPG.World.setMap(l);
RPG.World.run();
