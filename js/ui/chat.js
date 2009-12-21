/**
 * @class Chat dialog
 */
RPG.UI.Chat = OZ.Class();

RPG.UI.Chat.prototype.init = function(chat, being) {
	this._being = being;
	this._showPart(chat);
}

RPG.UI.Chat.prototype._showPart = function(chat) {
	var text = chat.getText();
	var options = chat.getOptions();
	var result = null;

	var sound = chat.getSound();
	if (sound) { RPG.UI.sound.play(sound); }

	/* show someting */
	if (options.length) {
		result = this._displayOptions(text, options);
	} else {
		this._displayText(text);
	}
	
	/* an option was selected */
	if (options.length) {
		var o = options[result-1];
		var todo = o[1];
		if (todo instanceof RPG.Misc.Chat) {
			this._showPart(todo);
		} else if (todo) {
			todo.call(this._being);
		}
	}
	
	var end = chat.getEnd();
	if (end) { end.call(this._being); }
	
	RPG.UI.setMode(RPG.UI_NORMAL);
}

RPG.UI.Chat.prototype._displayOptions = function(text, options) {
	var num = null;
	var str = this._formatText(text);
	str += "\n\n";
	for (var i=0;i<options.length;i++) {
		var o = options[i];
		str += (i+1)+". " + o[0] + "\n";
	}

	do {
		/* ask for option until valid answer comes */
		var result = prompt(str);
		num = parseInt(result, 10);
	} while (isNaN(num) || num <= 0 || num > options.length);

	return num;
}

RPG.UI.Chat.prototype._displayText = function(text) {
	if (text instanceof Array) {
		var str = this._formatText(text);
		alert(str);
	} else {
		RPG.UI.buffer.message(text);
	}
}

RPG.UI.Chat.prototype._formatText = function(text) {
	var str = RPG.Misc.format("%D:\n\n", this._being);
	
	if (text instanceof Array) {
		str += text.join("\n…\n");
	} else {
		str += text;
	}
	
	return str;
}