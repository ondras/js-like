var mg = new RPG.Engine.MapGen.Digger(new RPG.Misc.Coords(40, 20));
var map = mg.generate();

/* add some items */
map.addItem(map.getFreeCoords(), new RPG.Items.Dagger());
map.addItem(map.getFreeCoords(), new RPG.Items.Weapon());

/* add some beings */
var pc = new RPG.Beings.God();
map.setBeing(map.getFreeCoords(), pc);
RPG.World.setPC(pc);

var orc2 = new RPG.Beings.Orc();
orc2.addItem(new RPG.Items.Dagger());
var brain2 = new RPG.Engine.AI(orc2);
map.setBeing(map.getFreeCoords(), orc2);

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
