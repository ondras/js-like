var mg = new RPG.Dungeon.Generator.Digger(new RPG.Misc.Coords(40, 20));
console.profile("mapgen");
var map = mg.generate().addHiddenCorridors(0.01).getMap();
console.profileEnd("mapgen");

var rooms = map.getRooms();
for (var i=0;i<rooms.length;i++) { mg.decorateRoomDoors(rooms[i]); }

var arr = [];
var max = Math.max(4, rooms.length);
for (var i=0;i<max;i++) {
	arr.push(rooms[i % rooms.length]);
}

/* room #1 - player */
var room = arr.splice(Math.floor(Math.random()*arr.length), 1)[0];
var pc = new RPG.Beings.God();
map.setBeing(room.getCenter(), pc);
RPG.World.setPC(pc);

/* room #2 - orc */
var room = arr.splice(Math.floor(Math.random()*arr.length), 1)[0];
var orc = new RPG.Beings.Orc();
var dagger = new RPG.Items.Dagger();
orc.addItem(dagger);
orc.setWeapon(dagger);
var ai = new RPG.Engine.AI(orc);
map.setBeing(room.getCenter(), orc);

/* room #3 - item */
var room = arr.splice(Math.floor(Math.random()*arr.length), 1)[0];
map.at(room.getCenter()).addItem(new RPG.Items.KlingonSword());

/* room #4 - gold */
var room = arr.splice(Math.floor(Math.random()*arr.length), 1)[0];
mg.decorateRoomDoors(room, {locked: 1});
mg.decorateRoomInterior(room, {treasure: 1});

/* teleport */
var c = map.getFreeCoords(true);
var t = new RPG.Features.Teleport();
map.at(c).setFeature(t);

/* setup the world */
RPG.World.setScheduler(new RPG.Engine.Queue());

/* build ui */
var buffer = RPG.UI.buildBuffer();
document.body.insertBefore(buffer, document.body.firstChild);

var commands = RPG.UI.buildCommands();
for (var i=0;i<commands.length;i++) {
	document.body.appendChild(commands[i]);
}

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

/* add some chatting */
var c = new RPG.Misc.Chat("Hi, what am I supposed to do?")
	.addOption("Nothing special")
	.addOption("Some activity please", new RPG.Misc.Chat("What activity?")
		.addOption("Kill me!", function(action) {
			action.getTarget().clearTasks();
			action.getTarget().addTask(new RPG.Engine.AI.Kill(action.getSource()));
		})
		.addOption("Attack me!", function(action) {
			action.getTarget().clearTasks();
			action.getTarget().addTask(new RPG.Engine.AI.Attack(action.getSource()));
		})
		.addOption("Run away!", function(action) {
			action.getTarget().clearTasks();
			action.getTarget().addTask(new RPG.Engine.AI.Retreat(action.getSource()));
		})
	);
orc.setChat(c);
