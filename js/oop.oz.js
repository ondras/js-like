OZ.Class = function() { 
	var c = function() {
		this.constructor = arguments.callee;
		var init = arguments.callee.prototype.init;
		if (init) { init.apply(this,arguments); }
	};

	c.flags = {
		danger: 1,
		frequency: 100,
		abstr4ct: false
	}
	arguments.callee.all.push(c);
	
	c._implement = [];
	c.implement = function(parent) {
		this._implement.push(parent);
		for (var p in parent.prototype) { this.prototype[p] = parent.prototype[p]; }
		return this;
	};
	c._extend = null;
	c.extend = function(parent) {
		var tmp = function(){};
		tmp.prototype = parent.prototype;
		this.prototype = new tmp();
		this._extend = parent;
		for (var p in parent.prototype) {
			var val = parent.prototype[p];
			if (typeof(val) == "function" && !val.owner) { val.owner = parent; }
		}
		return this;
	};
	c.prototype.bind = function(fnc) {
		var obj = this;
		return function() {
			return fnc.apply(obj,arguments);
		}
	};
	c.prototype.dispatch = function(type, data) {
		var obj = {
			type:type,
			target:this,
			timeStamp:(new Date()).getTime(),
			data:data
		}
		var tocall = [];
		for (var p in OZ.Event._cache) {
			var item = OZ.Event._cache[p];
			if (item[1] == type && (!item[0] || item[0] == this)) { tocall.push(item[2]); }
		}
		var len = tocall.length;
		for (var i=0;i<len;i++) { tocall[i](obj); }
	};
	c.prototype.parent = function() {
		var caller = arguments.callee.caller;
		var owner = caller.owner || this.constructor;
		var parent = owner._extend;
		for (var p in owner.prototype) {
			if (owner.prototype[p] == caller) { return owner._extend.prototype[p].apply(this, arguments); }
		}
	};
	return c;
}

OZ.Class.all = [];
