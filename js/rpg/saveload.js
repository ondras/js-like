/**
 * @class Save data creator
 */
RPG.Serializer = OZ.Class();

RPG.Serializer.prototype.init = function() {
	this._allClasses = {}; /* all available */
	this._classes = []; /* class names used in save game data */
	this._ctors = []; /* instance-constructor mappings */
	this._instances = [];
	this._transformedInstances = [];
}

/**
 * Go!
 */
RPG.Serializer.prototype.go = function() {
	this._allClasses = {};
	this._classes = [];
	this._ctors = [];
	this._instances = [];
	this._transformedInstances = [];

	this._scanClasses(RPG, "RPG");
	
	var result = {};
	result.game = this._valueToJSON(RPG.Game);
	result.classes = this._classes;
	result.ctors = this._ctors;
	result.instances = this._transformedInstances;
	window.x = result;
	return JSON.stringify(result/*, null, "  "*/);
}

/**
 * External helper, can be used by custom serializators
 */
RPG.Serializer.prototype.toJSON = function(what, options) {
	return this._objectToJSON(what, options);
}

/**
 * Transform JS value to JSON-compatible format, apply caching and instance transformation
 */
RPG.Serializer.prototype._valueToJSON = function(value) {
	if (value === null) { return value; }
	switch (typeof(value)) {
		case "number":
		case "string":
		case "undefined":
		case "boolean":
			return value;
		break;
		
		case "function":
			return this._ctorToJSON(value);
		break;
	}

	if (value instanceof Array) { /* regular array */
		var arr = [];
		for (var i=0;i<value.length;i++) {
			arr.push(this._valueToJSON(value[i])); /* recurse */
		}
		return arr;
	}

	if (value.constructor.extend) {
		var index = this._instances.indexOf(value);
		if (index == -1) {
			index = this._instances.length;
			var ctorIndex = this._ctorToIndex(value.constructor);
			this._ctors[ctorIndex].push(index);
			this._instances.push(value); /* cache */
			var transformed = (value.toJSON ? value.toJSON(this) : this._objectToJSON(value));
			this._transformedInstances[index] = transformed;
		}
		return "$$"+index;
	}
	
	return (value.toJSON ? value.toJSON(this) : this._objectToJSON(value));
}

/**
 * JSONify a class (function) by converting it to string with index
 */
RPG.Serializer.prototype._ctorToJSON = function(cl) {
	return "$c"+this._ctorToIndex(cl);
}

/**
 * Get (or create) an index for a constructor
 */
RPG.Serializer.prototype._ctorToIndex = function(cl) {
	var name = null;
	for (var p in this._allClasses) { if (this._allClasses[p] == cl) { name = p; } }

	var index = this._classes.indexOf(name);
	if (index == -1) {
		index = this._classes.length;
		this._classes.push(name);
		this._ctors.push([]);
	}
	return index;
}

/**
 * Creates a JSON-compatible variant of an object. Does not perform caching and instance testing.
 */
RPG.Serializer.prototype._objectToJSON = function(obj, options) {
	var result = {};

	for (var p in obj) {
		if (!obj.hasOwnProperty(p)) { continue; } /* inherited */
		if (options && options.exclude.indexOf(p) != -1) { continue; } /* locally forbidden name */

		var value = obj[p];
		if (typeof(value) == "undefined") { continue; }
		if (typeof(value) == "function" && !value.extend) {
/*
			if (obj.hasOwnProperty(p)) {
				console.warn("Unknown function (property '"+p+"') encountered - we cannot serialize this");
				console.log(value);
			}
*/
			continue;
		} 
		result[p] = this._valueToJSON(value);
	}
	
	if (options && options.include) {
		for (var p in options.include) {
			result[p] = this._valueToJSON(options.include[p]);
		}
	}
	
	return result;
}

/**
 * Create a list of all classes
 */
RPG.Serializer.prototype._scanClasses = function(root, path) {
	var forbidden = ["extend", "_extend", "implement", "_implement"];
	for (var p in root) {
		var val = root[p];
		if (!val) { continue; }
		if (forbidden.indexOf(p) != -1) { continue; }
		
		var path2 = path + "." + p;
		
		if (typeof(val) == "function" && val.extend) {
			this._allClasses[path2] = val;
		}
		
		if (val.constructor == Object || val.extend) {
			/* recurse into native objects and OZ classes */
			arguments.callee.call(this, val, path+"."+p);
		}
	}
}

/**
 * @class Saved data parser
 */
RPG.Parser = OZ.Class();

RPG.Parser.prototype.init = function() {
	this._classes = [];
	this._revives = [];
	this._ctors = [];
	this._instances = [];
	this._fixedInstances = [];
}

RPG.Parser.prototype.go = function(str) {
	var data = JSON.parse(str);
	/* contains:
		- game
		- classes
		- ctors
		- instances
	*/

	this._revives = [];
	this._classes = [];
	this._ctors = data.ctors;
	this._instances = data.instances;
	this._fixedInstances = [];

	/* retrieve classes */
	if (!data.classes) { throw new Error("No classes in saved data"); }
	while (data.classes.length) {
		var cl = this._nameToCtor(data.classes.shift());
		this._classes.push(cl);
	}
	
	/* fix game */
	if (!data.game) { throw new Error("No game in saved data"); }
	return this._fix(data.game);
}

/* revive all who know how to do it */
RPG.Parser.prototype.revive = function() {
	while (this._revives.length) { this._revives.pop().revive(); }
}

/**
 * Walk through this JS object/array and fix internal string references + build instances
 */
RPG.Parser.prototype._fix = function(what) {
	if (what instanceof Array) {
		for (var i=0;i<what.length;i++) {
			what[i] = this._fixValue(what[i]);
		}
	} else {
		for (var p in what) {
			if (!what.hasOwnProperty(p)) { continue; }
			what[p] = this._fixValue(what[p]);
		}
	}

	if (what.revive) { this._revives.push(what); }
	return what;
}

RPG.Parser.prototype._fixValue = function(value) {
	if (value === null) { return value; }
	if (typeof(value) == "string") { return this._fixString(value); }
	if (value instanceof Array || typeof(value) == "object") { return this._fix(value); }
	return value;
}

/**
 * Resolve string reference to constructor/instance
 */
RPG.Parser.prototype._fixString = function(string) {
	var r = string.match(/^\$([c\$])([0-9]+)$/);
	if (!r) { return string; }
	var index = parseInt(r[2]);
	
	if (r[1] == "c") { return this._indexToCtor(index); } /* class reference */
	
	/* instance */
	if (this._fixedInstances[index]) { return this._fixedInstances[index]; } /* already done */
	return this._fixInstance(index);
}

/**
 * Convert object into a new "instance"
 */
RPG.Parser.prototype._fixInstance = function(index) {
	if (!this._instances[index]) { throw new Error("Reference to non-existing instance #"+index); }
	var data = this._instances[index];

	var ctor = null;
	for (var i=0;i<this._ctors.length;i++) {
		var ctors = this._ctors[i];
		var ctorIndex = ctors.indexOf(index);
		if (ctorIndex != -1) { ctor = this._indexToCtor(i); }
	}

	if (!ctor) { throw new Error("No class available for instance #'"+index+"'"); }
	
	/* create "instance" */
	var tmp = function(){};
	tmp.prototype = ctor.prototype;
	var result = new tmp();
	this._fixedInstances[index] = result;
	
	/* copy all values */
	for (var p in data) { result[p] = data[p]; }
	
	/* recurse */
	return this._fix(result);	
}

/**
 * Parse a previously serialized class (constructor)
 * @param {number} Class index (created by serializer.serializeClass)
 */
RPG.Parser.prototype._indexToCtor = function(index) {
	if (!this._classes[index]) { throw new Error("Reference to non-existing class #"+index); }
	return this._classes[index];
}

/**
 * Convert a dotted string to JS value
 */
RPG.Parser.prototype._nameToCtor = function(str) {
	var arr = str.split(".");
	var curr = window;
	while (arr.length) {
		curr = curr[arr.shift()];
		if (!curr) { throw new Error("Class '"+str+"' does not exist"); }
	}
	return curr;
}

var test2 = function() {
	var s = new RPG.Serializer();
	s = s.go();
	window.x = s;
	var words = s.split(/\W+/);
	var obj = {};
	for (var i=0;i<words.length;i++) {
		var w = words[i];
		if (!(w in obj)) { obj[w] = 0; }
		obj[w]++;
	}
	
	var arr = [];
	for (var p in obj) { arr.push([p, obj[p]]); }
	arr.sort(function(a,b){return b[1]-a[1];});
	return arr;
}
