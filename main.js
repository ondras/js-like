RPG.init();

var mg = new RPG.Dungeon.Generator.Digger(new RPG.Misc.Coords(80, 20));
var map = mg.generate("dungeon").addHiddenCorridors(0.01).getMap();

var rooms = map.getRooms();
for (var i=0;i<rooms.length;i++) { mg.decorateRoomDoors(rooms[i]); }

var arr = [];
var max = Math.max(4, rooms.length);
for (var i=0;i<max;i++) {
	arr.push(rooms[i % rooms.length]);
}

/* room #1 - player */
var room = arr.splice(Math.floor(Math.random()*arr.length), 1)[0];
var pc = new RPG.Beings.Human();
map.at(room.getCenter()).setBeing(pc);
RPG.World.setPC(pc);
var dagger = new RPG.Items.Dagger();
pc.addItem(dagger);

/* room #2 - orc */
var room = arr.splice(Math.floor(Math.random()*arr.length), 1)[0];
var orc = new RPG.Beings.Orc();
var dagger = new RPG.Items.Dagger();
orc.addItem(dagger);
orc.setWeapon(dagger);
var ai = new RPG.Engine.AI(orc);
map.at(room.getCenter()).setBeing(orc);

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

/* build ui */
RPG.UI.build();

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
