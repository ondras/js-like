/**
 * @class Simple chat response
 */
RPG.Misc.Chat = OZ.Class();
RPG.Misc.Chat.prototype.init = function(text, sound) {
	this._text = text;
	this._sound = sound;
}

RPG.Misc.Chat.prototype.perform = function(being) {
	if (this._sound) { RPG.UI.sound.play(this._sound); }
	RPG.UI.buffer.message(this._text);
	return RPG.ACTION_TIME;
}

/**
 * @class Complex multi-state dialog
 */
RPG.Misc.ComplexChat = OZ.Class();

RPG.Misc.ComplexChat.prototype.init = function(owner) {
	this._owner = owner;
	this._state = null;
	this._states = {};
}

RPG.Misc.ComplexChat.prototype.perform = function(being) {
	var text = this.getText();
	var answers = this.getAnswers();
	if (!(text instanceof Array) && !answers.length) {
		RPG.UI.buffer.message('"' + text + '"');
		return;
	}
	
	RPG.UI.complexChat.show(this, being);
	return RPG.ACTION_DEFER;
}

RPG.Misc.ComplexChat.prototype.setState = function(id) {
	this._state = id;
	var obj = this._states[this._state];
	if (obj.callback) { obj.callback.call(this._owner); }
}

/* GETTERS */

/**
 * Return what should be said right now
 */
RPG.Misc.ComplexChat.prototype.getText = function() {
	return this._states[this._state].text;
}

/**
 * Return what should be played right now
 */
RPG.Misc.ComplexChat.prototype.getSound = function(text) {
	return this._states[this._state].sound;
}

/**
 * Returns list of available answers
 */
RPG.Misc.ComplexChat.prototype.getAnswers = function() {
	return this._states[this._state].answers;
}

/**
 * Advance the conversation using given answer index
 * @param {int} answerIndex Irrelevant if current answerlist is empty
 * @returns {bool} Should the conversation continue?
 */
RPG.Misc.ComplexChat.prototype.advance = function(answerIndex) {
	var obj = this._states[this._state];
	var nextId = null;
	if (obj.next.length) {
		nextId = obj.next[answerIndex];
	} else {
		nextId = obj.nextId;
	}
	
	if (nextId === null) { return false; } /* nowhere to advance */

	this.setState(nextId);
	
	/* conversation stop */
	return !this._states[this._state].end;
}

/* SETTERS */

/**
 * Define a new state
 * @param {int} id state identifier
 * @param {string} text
 * @param {int} [nextId] where to advance
 */
RPG.Misc.ComplexChat.prototype.defineState = function(id, text, nextId) {
	if (this._state === null) { this._state = id; }
	
	this._states[id] = {
		text: text, /* what to say */
		answers: [], /* available answers */
		next: [], /* where to go for a given answer */
		end: false, /* do we stop after reaching this state? */
		nextId: null, /* where to go if no answer available */
		callback: null,
		sound: null
	}
	
	if (arguments.length > 2) { this._states[id].nextId = nextId; }
	
	return this;
}

/**
 * Mark this state as a conversation end, e.g. do not advance automatically
 */
RPG.Misc.ComplexChat.prototype.defineEnd = function(id) {
	this._states[id].end = true;
	return this;
}

/**
 * Define a sound for a state
 */
RPG.Misc.ComplexChat.prototype.defineSound = function(id, sound) {
	this._states[id].sound = sound;
	return this;
}

/**
 * Define an answer for a state
 */
RPG.Misc.ComplexChat.prototype.defineAnswer = function(id, text, nextId) {
	this._states[id].answers.push(text);
	this._states[id].next.push(nextId);
	return this;
}

/**
 * Define a callback for a state
 */
RPG.Misc.ComplexChat.prototype.defineCallback = function(id, callback) {
	this._states[id].callback = callback;
	return this;
}
