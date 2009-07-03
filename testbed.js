var mg = new RPG.Dungeon.Generator.Digger(new RPG.Misc.Coords(40, 20));
var map = mg.generate();

var rooms = map.getRooms();
var arr = [];
var max = Math.max(4, rooms.length);
for (var i=0;i<max;i++) {
	arr.push(rooms[i % rooms.length]);
}

/* room #1 - player */
var room = arr.splice(Math.floor(Math.random()*arr.length), 1)[0];
var x = Math.round((room.getCorner1().x + room.getCorner2().x)/2);
var y = Math.round((room.getCorner1().y + room.getCorner2().y)/2);
var pc = new RPG.Beings.Human();
map.setBeing(new RPG.Misc.Coords(x, y), pc);
RPG.World.setPC(pc);

/* room #2 - orc */
var room = arr.splice(Math.floor(Math.random()*arr.length), 1)[0];
var x = Math.round((room.getCorner1().x + room.getCorner2().x)/2);
var y = Math.round((room.getCorner1().y + room.getCorner2().y)/2);
var orc = new RPG.Beings.Orc();
var dagger = new RPG.Items.Dagger();
orc.addItem(dagger);
orc.setWeapon(dagger);
var ai = new RPG.Engine.AI(orc);
map.setBeing(new RPG.Misc.Coords(x, y), orc);


var goal = new RPG.Engine.AI.Kill(ai, pc);
ai.addTask(goal);


/* room #3 - item */
var room = arr.splice(Math.floor(Math.random()*arr.length), 1)[0];
var x = Math.round((room.getCorner1().x + room.getCorner2().x)/2);
var y = Math.round((room.getCorner1().y + room.getCorner2().y)/2);
map.addItem(new RPG.Misc.Coords(x, y), new RPG.Items.KlingonSword());

/* room #4 - gold */
var room = arr.splice(Math.floor(Math.random()*arr.length), 1)[0];
var c1 = room.getCorner1();
var c2 = room.getCorner2();
for (var i=c1.x;i<=c2.x;i++) {
	for (var j=c1.y;j<=c2.y;j++) {
		var gold = new RPG.Items.Gold();
		map.addItem(new RPG.Misc.Coords(i, j), gold);
	}
}

/* teleport */
var c = map.getFreeCoords(true);
var t = new RPG.Features.Teleport(c);
map.at(c).setFeature(t);

/* setup the world */
RPG.World.setScheduler(new RPG.Engine.Queue());

/* build ui */
var buffer = RPG.UI.buildBuffer()
document.body.insertBefore(buffer, document.body.firstChild);

var commands = RPG.UI.buildCommands();
for (var i=0;i<commands.length;i++) {
	document.body.appendChild(commands[i]);
}

RPG.UI.enableKeyboard();

function use(name) { 
	var map ={
		"map_ascii": "buildASCII",
		"map_image": "buildMap"
	}
	var func = RPG.UI[map[name]];
	var c = OZ.$("map");
	OZ.DOM.clear(c);
	var m = func.call(RPG.UI);
	c.appendChild(m);
	
	if (RPG.World.getMap()) { RPG.UI.adjust(RPG.World.getMap()); }

	var a = OZ.$(name);
	var ul = a.parentNode.parentNode;
	var as = ul.getElementsByTagName("a");
	for (var i=0;i<as.length;i++) { as[i].className = ""; }
	OZ.$(name).className = "active";
}

OZ.Event.add(OZ.$("map_ascii"), "click", function() { use("map_ascii"); });
OZ.Event.add(OZ.$("map_image"), "click", function() { use("map_image"); });

use("map_ascii");

/* go! :-) */
RPG.World.setMap(map);
RPG.World.run();

