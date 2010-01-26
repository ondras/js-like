var Serializer = function() {
	this.map = {};
	this.cache = [];
	this.names = [];
}

Serializer.prototype.buildTable = function(root, path) {
	var forbidden = ["extend", "_extend", "implement", "_implement"];
	
	for (var p in root) {
		var val = root[p];
		if (!val) { continue; }
		if (forbidden.indexOf(p) != -1) { continue; }
		
		var path2 = path + "." + p;
		
		if (typeof(val) == "function" && val.extend) {
			this.map[path2] = val;
		}
		
		if (val.constructor == Object || val.extend) {
			/* recurse into native objects and OZ classes */
			arguments.callee.call(this, val, path+"."+p);
		}
	}
}

Serializer.prototype.serTable = function() {
	var str = "";
	this.names = [];
	for (var p in this.map) {
		this.names.push(p);
		str += "<ctor name='"+p+"'/>\n";
	}
	return str;
}

Serializer.prototype.serVal = function(what) {
	if (what === null) {
		return "null";
	} else if (typeof(what) == "string") {
		return '"' + what + '"';
	} else if (typeof(what) == "object") {
		return this.serObj(what);
	} else if (typeof(what) == "undefined") {
		return "undefined";
	} else {
		return what.toString();
	}
}

Serializer.prototype.serArrProps = function(what) {
	var str = "";
	for (var i=0;i<what.length;i++) {
		var val = what[i];
		if (typeof(val) == "function") { continue; }
		str += "<p>";
		str += this.serVal(val);
		str += "</p>";
	}
	return str;
}

Serializer.prototype.serObjProps = function(what, clone) {
	var str = "";
	for (var p in what) {
		var val = what[p];
		if (typeof(val) == "function") { continue; }
		if (val instanceof HTMLElement) { continue; }
		if (val === clone[p]) { continue; }
		str += "<p n='"+p+"'>";
		str += this.serVal(val);
		str += "</p>";
	}
	return str;
}

Serializer.prototype.serObj = function(what) {
	var index = this.cache.indexOf(what);
	if (index != -1) {
		return "<r i='"+index+"' />";
	}
	
	this.cache.push(what);
	
	var str = "";
	if (what instanceof Array) {
		str += "<a>";
		str += this.serArrProps(what);
		str += "</a>";
	} else if (what.constructor == Object) {
		str += "<o>";
		str += this.serObjProps(what, {});
		str += "</o>";
	} else {
		var ctor = what.constructor;
		var name = null;
		for (var p in this.map) { if (this.map[p] == ctor) { name = p; } }
		if (!name) { alert("FOK."); debugger; }
		
		var index = this.names.indexOf(name);
		
		str += "<i c='"+index+"'>";
/*		
		try {
			var clone = new ctor();
		} catch (e) {
			var clone = {};
		}
		*/
		var clone = {};
		str += this.serObjProps(what, clone);
		str += "</i>\n";
	}
	
	return str;
}

function test() {
	var ser = new Serializer();
	ser.buildTable(RPG, "RPG");
	window.ser = ser;
	var data = "";

	data += ser.serTable();
	data += ser.serObj(RPG.World);
	data += ser.serObj(s);

	return data;
}
