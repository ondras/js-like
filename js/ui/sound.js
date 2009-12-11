if (!window.Audio) {
	window.Audio = function() {}
	window.Audio.prototype.load = function() {}
	window.Audio.prototype.pause = function() {}
	window.Audio.prototype.play = function() {}
}

/**
 * @class Sound manager
 */
RPG.UI.Sound = OZ.Class();

RPG.UI.Sound.prototype.init = function(background) {
	this._cache = [];
	this._background = new Audio();
	this._background.autobuffer = true;
	
	OZ.Event.add(window, "unload", this.bind(this._unload));
	OZ.Event.add(this._background, "ended", this.bind(this._ended));
}

RPG.UI.Sound.prototype.play = function(name) {
	if (this._cache[name]) {
		this._cache[name].play();
		return;
	}
	
	var a = new Audio(this._resolve(name));
	this._cache[name] = a;
	a.autobuffer = true;
	a.autoplay = true;
	a.load();
}

RPG.UI.Sound.prototype.preloadBackground = function(name) {
	this._background.src = this._resolve(name);
	this._background.load();
}

RPG.UI.Sound.prototype.playBackground = function() {
	this._background.play();
}

RPG.UI.Sound.prototype._unload = function() {
	this._background.pause();
}

RPG.UI.Sound.prototype._ended = function() {
	this._background.play();
}

RPG.UI.Sound.prototype._resolve = function(name) {
	return "sound/" + name + ".ogg";
}
