OZ.Class = function() { 
	var c = function() {
		var init = arguments.callee.prototype.init;
		if (init) { init.apply(this,arguments); }
	};

	c.factory = {
		danger: 1,
		frequency: 100,
		method: null
	}
	arguments.callee.all.push(c);
	
	c._implement = [];
	c.implement = function(parent) {
		this._implement.push(parent);
		for (var p in parent.prototype) { 
			var val = parent.prototype[p];
			// if (p in this.prototype && ["bind","dispatch","parent","constructor"].indexOf(p)==-1) { debugger; }
			this.prototype[p] = val; 
			if (p != "constructor" && typeof(val) == "function" && !val.owner) { val.owner = parent; }
		}
		return this;
	};
	c.implements = function(iface) {
		var cl = this;
		while (cl) {
			if (cl._implement.indexOf(iface) != -1) { return true; }
			cl = cl._extend;
		}
		return false;
	}
	
	c._extend = null;
	c.extend = function(parent) {
		var tmp = function(){};
		tmp.prototype = parent.prototype;
		this.prototype = new tmp();
		this._extend = parent;
		this.prototype.constructor = this;
		for (var p in parent.prototype) {
			var val = parent.prototype[p];
			if (p != "constructor" && typeof(val) == "function" && !val.owner) { val.owner = parent; }
		}
		return this;
	};
	c["extends"] = function(ctor) {
		var cl = this;
		while (cl) {
			if (cl._extend == ctor) { return true; }
			cl = cl._extend;
		}
		return false;
	}

	c.prototype.bind = function(fnc) { return fnc.bind(this); };

	c.prototype.dispatch = function(type, data) {
		var obj = {
			type:type,
			target:this,
			timeStamp:(new Date()).getTime(),
			data:data
		}
		var tocall = [];
		var list = OZ.Event._byName[type];
		for (var id in list) {
			var item = list[id];
			if (!item[0] || item[0] == this) { tocall.push(item[2]); }
		}
		var len = tocall.length;
		for (var i=0;i<len;i++) { tocall[i](obj); }
	}

	c.prototype.parent = function() {
		var caller = arguments.callee.caller; /* one step back in call stack */
		var owner = caller.owner || this.constructor; /* class which owns calling method */
		for (var p in owner.prototype) { /* find the name of called method */
			if (owner.prototype[p] != caller) { continue; }
			/* p is the name of method */
			var candidates = [owner._extend].concat(owner._implement); /* find extended/implemented class which has this method */
			while (candidates.length) {
				var candidate = candidates.shift();
				if (candidate && p in candidate.prototype) { return candidate.prototype[p].apply(this, arguments); } /* if available, call */
			}
		}
	};
	return c;
}

OZ.Class.all = [];

OZ.Singleton = function() {
	var c = OZ.Class();
	c.getInstance = arguments.callee.getInstance;
	return c;
}

OZ.Singleton.getInstance = function() {
	if (!this._instance) { this._instance = new this(); }
	return this._instance;
}
