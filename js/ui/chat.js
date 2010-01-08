/**
 * @class Chat dialog
 */
RPG.UI.Chat = OZ.Class();

RPG.UI.Chat.prototype.init = function() {
}

RPG.UI.Chat.prototype.show = function(chat, being) {
	var cont = false;
	do {
		var text = chat.getText();
		var answers = chat.getAnswers();
		
		var answerIndex = -1;
		
		if (answers.length) {
			answerIndex = this._displayOptions(being, text, answers);
		} else {
			this._displayText(being, text);
		}
		
		cont = chat.advance(answerIndex);
	} while (cont);
}

RPG.UI.Chat.prototype._displayOptions = function(being, text, answers) {
	var num = null;
	var str = this._formatText(being, text);
	str += "\n\n";
	for (var i=0;i<answers.length;i++) {
		var a = answers[i];
		str += (i+1)+". " + a + "\n";
	}

	do {
		/* ask for option until valid answer comes */
		var result = prompt(str);
		num = parseInt(result, 10);
	} while (isNaN(num) || num <= 0 || num > answers.length);

	return num-1;
}

RPG.UI.Chat.prototype._displayText = function(being, text) {
	if (text instanceof Array) {
		var str = this._formatText(being, text);
		alert(str);
	} else {
		RPG.UI.buffer.message(text);
	}
}

RPG.UI.Chat.prototype._formatText = function(being, text) {
	var str = RPG.Misc.format("%D:\n\n", being);
	
	if (text instanceof Array) {
		str += text.join("\n…\n");
	} else {
		str += text;
	}
	
	return str;
}
