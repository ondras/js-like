/**
 * @class Visual interface: everything that can be visualized have this
 */
RPG.IVisual = OZ.Class();
RPG.IVisual.prototype.getVisual = function() {
	var remainingProps = ["color", "ch", "desc", "image", "path"];
	var result = {};
	var current = this.constructor;
	while (remainingProps.length && current) {
		var visual = current.visual;
		current = current._extend;
		if (!visual) { continue; }
		
		for (var i=0;i<remainingProps.length;i++) {
			var prop = remainingProps[i];
			if (prop in visual) {
				result[prop] = visual[prop];
				remainingProps.splice(i, 1);
				i--;
			}
		}
	}
	
	return result;
}

/**
 * Describe self
 * @returns {string}
 */
RPG.IVisual.prototype.describe = function() {
	return this.getVisual().desc;
}
/**
 * Describe + prefix with indefinite article
 */
RPG.IVisual.prototype.describeA = function() {
	var base = this.describe();
	var result = "a";
	if (base.charAt(0).match(/[aeiouy]/i)) { result += "n"; }
	result += " " + base;
	return result;
}
/**
 * Describe + prefix with definite article
 */
RPG.IVisual.prototype.describeThe = function() {
	return "the " + this.describe();
}
