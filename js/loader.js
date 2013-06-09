var Loader = {
	_callback: null,
	version: "",
	_queue: [
		"js/oop.oz.js",
		"js/compress.js",
		"js/rpg/rpg.js",
		"js/rpg/visual.js",
		"js/rpg/RandomValue.js",
		"js/rpg/Coords.js",
		"js/rpg/IProjectile.js",
		"js/rpg/IDialog.js",
		"js/rpg/Factory.js",
		"js/rpg/IModifier.js",
		"js/rpg/IEnterable.js",
		"js/rpg/Feat.js",
		"js/rpg/IActor.js",
		"js/rpg/Scheduler.js",
		"js/rpg/format.js",
		"js/rpg/Combat.js",
		"js/rpg/ai.js",
		"js/rpg/engine.js",
		"js/rpg/rules.js",
		"js/rpg/BaseRace.js",
		"js/rpg/BaseEffect.js",
		"js/rpg/BaseSlot.js",
		"js/rpg/BaseProfession.js",
		"js/rpg/BaseQuest.js",
		"js/rpg/being.js",
		"js/rpg/dungeon.js",
		"js/rpg/game.js",
		"js/rpg/item.js",
		"js/rpg/pc.js",
		"js/rpg/npc.js",
		"js/rpg/spells/BaseSpell.js",
		"js/rpg/spells/Attack.js",
		"js/rpg/spells/Projectile.js",
		"js/rpg/chargen.js",
		"js/rpg/story.js",
		"js/rpg/saveload.js",
		"js/rpg/stats.js",

		"js/library/ai.js",
		"js/library/decorators.js",
		"js/library/dungeon.js",
		"js/library/effects.js",
		"js/library/feats.js",
		"js/library/generators.js",
		"js/library/professions.js",
		"js/library/quests.js",
		"js/library/races.js",
		"js/library/slots.js",
		"js/library/spells/fireball.js",
		"js/library/spells/heal.js",
		"js/library/spells/knock.js",
		"js/library/spells/MagicBolt.js",
		"js/library/spells/MagicExplosion.js",
		"js/library/spells/Teleport.js",
		"js/library/items/armor.js",
		"js/library/items/misc.js",
		"js/library/items/weapons.js",
		"js/library/beings/beings.js",
		"js/library/beings/humans.js",
		"js/library/beings/undead.js",

		"js/ui/ui.js",
		"js/ui/buffer.js",
		"js/ui/map.js",
		"js/ui/button.js",
		"js/ui/dialog.js",
		"js/ui/commands.js",
		"js/ui/itemlist.js",
		"js/ui/mapswitch.js",
		"js/ui/questlist.js",
		"js/ui/sound.js",
		"js/ui/status.js",
		"js/ui/attributes.js",
		"js/ui/slots.js",
		"js/ui/saveload.js",

		"js/story/beings.js",
		"js/story/items.js",
		"js/story/quests.js",
		"js/story/village.js",
		"js/story/crossroads.js",
		"js/story/church.js",
		"js/story/tutorial.js",
		"js/story/story.js",
		"js/debug/graph.js",
		"js/debug/story.js" 

	],
	
	_responseVersion: function(data) {
		this.version = data.split("\n").shift();
		this._processQueue();
	},
	
	_responseScript: function() {
		this._processQueue();
	},
	
	_processQueue: function() {
		if (!this._queue.length) {
			this._callback();
			return;
		}
		
		var item = this._queue.shift() + "?v=" + this.version;
		var script = OZ.DOM.elm("script", {src:item});
		var loaded = this._responseScript.bind(this);
		if (script.addEventListener) {
			script.addEventListener("load", loaded, false);
		} else {
			script.attachEvent("onreadystatechange", loaded);
		}
		document.body.insertBefore(script, document.body.firstChild);
	},
	
	load: function(callback) {
		this._callback = callback;
		OZ.Request("VERSION?r="+Math.random(), this._responseVersion.bind(this));
	}
}
