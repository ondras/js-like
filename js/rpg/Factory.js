/**
 * @class Generic object factory
 */ 
RPG.Factory = OZ.Class();
RPG.Factory.prototype.init = function() {
	this._classList = [];
}
RPG.Factory.prototype.add = function(ancestor) {
	for (var i=0;i<OZ.Class.all.length;i++) {
		var ctor = OZ.Class.all[i];
		if (!ctor.factory.frequency) { continue; }
		if (this._hasAncestor(ctor, ancestor)) { this._classList.push(ctor); }
	}
	return this;
}

/**
 * Return a random class
 * @param {int} danger Highest danger available
 */ 
RPG.Factory.prototype.getClass = function(danger) {
	var len = this._classList.length;
	if (len == 0) { throw new Error("No available classes"); }

	var avail = [];
	var total = 0;
	
	for (var i=0;i<this._classList.length;i++) {
		ctor = this._classList[i];
		if (ctor.factory.danger > danger) { continue; } 
		total += ctor.factory.frequency;
		avail.push(ctor);
	}
	var random = Math.floor(Math.random()*total);
	
	var sub = 0;
	var ctor = null;
	for (var i=0;i<avail.length;i++) {
		ctor = avail[i];
		sub += ctor.factory.frequency;
		if (random < sub) { return ctor; }
	}
}

/**
 * Return a random instance
 * @param {int} danger Highest danger available
 */ 
RPG.Factory.prototype.getInstance = function(danger) {
	var ctor = this.getClass(danger);
	if (ctor.factory.method) {
		return ctor.factory.method.call(ctor, danger);
	} else {
		return new ctor(); 
	}
}

/**
 * Create all available instances
 */
RPG.Factory.prototype.getAllInstances = function(danger) {
	var result = [];
	
	for (var i=0;i<this._classList.length;i++) {
		ctor = this._classList[i];
		if (ctor.factory.danger > danger) { continue; } 
		if (ctor.factory.method) {
			var inst = ctor.factory.method.call(ctor, danger);
		} else {
			var inst = new ctor(); 
		}
		result.push(inst);
	}
	
	return result;
}

RPG.Factory.prototype._hasAncestor = function(ctor, ancestor) {
	var current = ctor;
	while (current) {
		if (current == ancestor) { return true; }
		current = current._extend;
	}
	return false;
}

