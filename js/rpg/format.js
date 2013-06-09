/**
 * Format a string in a printf-like fashion
 * @param {string} formatStr Formatting string to be substituted
 */
RPG.Misc.format = function(formatStr) {
	var args = arguments;
	var index = 0;
	return formatStr.replace(/%([a-zA-Z]+)/g, function(match, what) {
		if (index+1 < args.length) { index++; }
		var obj = args[index];
		var str = what;
		switch (what.toLowerCase()) {
			case "a": str = obj.describeA(); break;
			case "the": str = obj.describeThe(); break;
			case "d": str = obj.describe(); break;
			case "he": str = obj.describeHe(); break;
			case "him": str = obj.describeHim(); break;
			case "his": str = obj.describeHis(); break;
			case "is": str = obj.describeIs(); break;
			case "s": str = obj; break;
		}
		
		if (what.charAt(0) != what.charAt(0).toLowerCase()) { str = str.capitalize(); }
		return str;
	});
}

RPG.Misc.verb = function(verb, who) {
	return (who == RPG.Game.pc ? verb : verb+"s");
}
