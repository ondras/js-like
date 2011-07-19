<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<link rel="stylesheet" type="text/css" href="style.css" />
		
		<?php $ver = 3; ?>

		<script type="text/javascript" src="js/oz.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/oop.oz.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/compress.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/rpg.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/visual.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/misc.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/ai.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/engine.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/rules.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/base.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/being.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/dungeon.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/game.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/item.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/pc.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/npc.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/spells.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/chargen.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/story.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/saveload.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/rpg/stats.js?<?php echo $ver; ?>"></script>

		<script type="text/javascript" src="js/library/ai.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/decorators.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/dungeon.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/effects.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/feats.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/generators.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/professions.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/quests.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/races.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/slots.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/spells.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/items/armor.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/items/misc.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/items/weapons.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/beings/beings.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/beings/humans.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/library/beings/undead.js?<?php echo $ver; ?>"></script>

		<script type="text/javascript" src="js/ui/ui.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ui/buffer.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ui/map.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ui/button.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ui/dialog.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ui/commands.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ui/itemlist.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ui/mapswitch.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ui/questlist.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ui/sound.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ui/status.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ui/attributes.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ui/slots.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ui/saveload.js?<?php echo $ver; ?>"></script>

		<script type="text/javascript" src="js/story/beings.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/story/items.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/story/quests.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/story/village.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/story/tutorial.js?<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/story/story.js?<?php echo $ver; ?>"></script>
	</head>

	<body>
		<div id="buffer"></div>
		<div id="map"></div>
		
		<div id="keypad"></div>
		<div id="commands"></div>
		
		<ul id="misc"></ul>
		<ul id="status"></ul>
		
		<script type="text/javascript" src="js/debug/graph.js"></script>
		<script type="text/javascript" src="js/debug/story.js"></script>
		<script type="text/javascript" src="js/debug/church.js"></script>
		<script type="text/javascript">
//			RPG.Stats.server = "http://192.168.1.6/js-like-server/";
			RPG.Game.init();
			var index = document.location.search.indexOf("debug");
			var story = (index == -1 ? RPG.Story.Village : RPG.Story.Debug);
			var s = new story();

			RPG.Game.setStory(s);
			RPG.Game.start();
		</script>
	</body>
</html>
