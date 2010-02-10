/**
 * @class Sound manager
 */
RPG.UI.Sound = OZ.Class();

RPG.UI.Sound.prototype.init = function() {
	this._supported = !!(window.Audio && new Audio("").load);
	this._muted = false;
	if (!this._supported) { return; }
	
	this._cache = {};
	this._bg = {
		audio: null,
		name: "",
		event: null
	}
	
	OZ.Event.add(window, "unload", this.bind(this._unload));
}

/**
 * Can this system play audio?
 * @returns {bool}
 */
RPG.UI.Sound.prototype.isSupported = function() {
	return this._supported;
}

/**
 * Play a sound ASAP
 * @param {string} name Sound name
 */
RPG.UI.Sound.prototype.play = function(name) {
	if (!this._supported) { return; }

	if (this._cache[name]) {
		this._cache[name].play();
		return this._cache[name];
	}
	
	var a = new Audio(this._resolve(name));
	a.muted = this._muted;
	this._cache[name] = a;
	a.autobuffer = true;
	a.autoplay = true;
	a.load();
	return a;
}

/**
 * Preload a sound
 * @param {string} name Sound name
 */
RPG.UI.Sound.prototype.preload = function(name) {
	if (!this._supported) { return; }
	
	if (name in this._cache) { return this._cache[name]; }

	var a = new Audio(this._resolve(name));
	a.muted = this._muted;
	this._cache[name] = a;
	a.autobuffer = true;
	a.load();
	
	return a;
}

/**
 * Play a sound as a background, e.g. with looping
 * @param {string} name Sound name
 */
RPG.UI.Sound.prototype.playBackground = function(name) {
	if (!this._supported) { return; }
	if (name == this._bg.name) { return; }
	
	if (this._bg.name) {
		this._bg.audio.pause();
		OZ.Event.remove(this._bg.event);
	}
	
	this._bg.name = name;
	if (name) { 
		this._bg.audio = this.play(name);
		this._bg.event = OZ.Event.add(this._bg.audio, "ended", this._ended.bind(this));
	}
}

RPG.UI.Sound.prototype.getBackground = function() {
	return this._bg.name;
}

RPG.UI.Sound.prototype.getMuted = function() {
	return this._muted;
}

RPG.UI.Sound.prototype.setMuted = function(state) {
	this._muted = state;
	for (var name in this._cache) { this._cache[name].muted = state; }
}


RPG.UI.Sound.prototype._unload = function() {
	for (var name in this._cache) { this._cache[name].pause(); }
}

RPG.UI.Sound.prototype._ended = function() {
	this._bg.audio.play();
}

RPG.UI.Sound.prototype._resolve = function(name) {
	return "sound/" + name + ".ogg";
}

RPG.UI.sound = new RPG.UI.Sound();
