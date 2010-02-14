/**
 * @class Save data creator
 */
RPG.Serializer = OZ.Class();

RPG.Serializer.TRANSLATION = {
	"_coords": "#c",
	"_description": "#d",
	"_modifiers": "#m",
	"_items": "#i",
	"_feature": "#f",
	"_being": "#b"
}

RPG.Serializer.prototype.init = function() {
	this._classes = [];
	this._stacks = [];
	this._cache = [];
	this._defaultStack = null;
	this._phase = 0;
}

/**
 * Go!
 */
RPG.Serializer.prototype.go = function() {
	this._cache = [];

	this._stacks = [];
	this._classes = [];
	var classNames = [];
	this._scanClasses(RPG, "RPG", this._classes, classNames);
	
	this._stacks.push(new RPG.Serializer.Stack(this, RPG.Beings.BaseBeing));
	this._stacks.push(new RPG.Serializer.Stack(this, RPG.Items.BaseItem));
	this._stacks.push(new RPG.Serializer.Stack(this, RPG.Cells.BaseCell));
	this._stacks.push(new RPG.Serializer.Stack(this, RPG.Map));
	this._stacks.push(new RPG.Serializer.Stack(this));

	var result = {};
	result.classes = classNames;
	result.game = RPG.Game.toJSON(this);
	
	do {
		var ok = true;
		for (var i=0; i<this._stacks.length; i++) {
			var stack = this._stacks[i];
			if (!stack.isDone()) {
				ok = false;
				stack.finalize();
			}
		}
	} while (!ok);
	
	for (var i=0; i<this._stacks.length; i++) {
		var stack = this._stacks[i];
		result[stack.getId()] = stack.getData();
	}

	this._stacks = [];
	return JSON.stringify(result/*, null, "  "*/);
}

/**
 * Return index for a given class
 */
RPG.Serializer.prototype.classIndex = function(what) {
	return this._classes.indexOf(what);
}

/**
 * Called from an instance that wants a specific serialization
 */
RPG.Serializer.prototype.toJSON = function(what, options) {
	return this._serializeObject(what, options);
}

/**
 * Convert instance to JSON representation
 */
RPG.Serializer.prototype.finalizeInstance = function(instance) {
	if (instance.toJSON) {
		return instance.toJSON(this);
	} else {
		return this.toJSON(instance);
	}
}

/**
 * Serialize instance by adding it to stack and returning a placeholder
 */
RPG.Serializer.prototype._serializeInstance = function(what) {
	for (var i=0;i<this._stacks.length;i++) {
		var stack = this._stacks[i];
		if (stack.accepts(what)) { return stack.add(what); }
	}
	
	console.warn("No stack accepted an instance");
	console.log(what);
}

/**
 * Serialize a class by converting it to string with index
 */
RPG.Serializer.prototype._serializeClass = function(cl) {
	return "#c"+this.classIndex(cl);
}

RPG.Serializer.prototype._serializeObject = function(obj, options) {
/*
	var index = this._cache.indexOf(obj);
	if (index == -1) {
		this._cache.push(obj);
	} else {
		console.warn("This non-instance object was already encountered!");
		console.log(obj);
	}
*/

	var result = {};

	if (obj.constructor.extend) {
		result["#"] = this.classIndex(obj.constructor);
	}

	var ignore = ["constructor"];
	
	for (var p in obj) {
		if (ignore.indexOf(p) != -1) { continue; } /* globally forbidden name */
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
	
		/* forward prop translation */
		if (p in RPG.Serializer.TRANSLATION) { p = RPG.Serializer.TRANSLATION[p]; }

		result[p] = this._serializeValue(value);
	}
	
	if (options && options.include) {
		for (var p in options.include) {
			var value = options.include[p];

			/* forward prop translation */
			if (p in RPG.Serializer.TRANSLATION) { p = RPG.Serializer.TRANSLATION[p]; }

			result[p] = this._serializeValue(value);
		}
	}
	
	return result;
}

RPG.Serializer.prototype._serializeValue = function(value) {
	if (value === null) { return value; }
	switch (typeof(value)) {
		case "number":
		case "string":
		case "undefined":
		case "boolean":
			return value;
		break;
		
		case "function":
			return this._serializeClass(value);
		break;
	}
	
	if (value instanceof Array) { /* regular array */
		var arr = [];
		for (var i=0;i<value.length;i++) {
			arr.push(this._serializeValue(value[i]));
		}
		return arr;
	}
	
	if (value.constructor.extend) { /* instance */
		return this._serializeInstance(value);
	}
	
	/* object */
	return this._serializeObject(value);
}

/**
 * Create a list of all classes
 */
RPG.Serializer.prototype._scanClasses = function(root, path, result, resultNames) {
	var forbidden = ["extend", "_extend", "implement", "_implement"];
	for (var p in root) {
		var val = root[p];
		if (!val) { continue; }
		if (forbidden.indexOf(p) != -1) { continue; }
		
		var path2 = path + "." + p;
		
		if (typeof(val) == "function" && val.extend) {
			result.push(val);
			resultNames.push(path2);
		}
		
		if (val.constructor == Object || val.extend) {
			/* recurse into native objects and OZ classes */
			arguments.callee.call(this, val, path+"."+p, result, resultNames);
		}
	}
}

/**
 * @class Stack of serialized instances of a particular type
 */
RPG.Serializer.Stack = OZ.Class();
RPG.Serializer.Stack.prototype.init = function(serializer, ctor) {
	this._serializer = serializer;
	this._ctor = ctor || null;
	this._data = [];
	this._instances = [];
	this._index = (ctor ? serializer.classIndex(ctor) : "");
}

/**
 * Return stack identification
 */
RPG.Serializer.Stack.prototype.getId = function() {
	return "#" + this._index;
}

/**
 * Does this stack accept an instance?
 */
RPG.Serializer.Stack.prototype.accepts = function(instance) {
	if (!this._ctor) { return true; }
	return (instance instanceof this._ctor);
}

/**
 * Add an instance to stack
 */
RPG.Serializer.Stack.prototype.add = function(instance) {
	var index = this._instances.indexOf(instance);
	if (index == -1) {
		index = this._instances.length;
		this._instances.push(instance);
	}
	return this.getId() + "#" + index;
}

/**
 * Finalize this stack by taking all instances and serializing them
 */
RPG.Serializer.Stack.prototype.finalize = function() {
	while (!this.isDone()) {
		var instance = this._instances[this._data.length];
		var data = this._serializer.finalizeInstance(instance);
		this._data.push(data);
	}
}

/**
 * Is this stack finished?
 */
RPG.Serializer.Stack.prototype.isDone = function() {
	return (this._data.length == this._instances.length);
}

/**
 * Serialized version of this stack
 */
RPG.Serializer.Stack.prototype.getData = function() {
	return this._data;
}


/**
 * @class Saved data parser
 */
RPG.Parser = OZ.Class();

RPG.Parser.TRANSLATION = {};

RPG.Parser.prototype.init = function() {
	this._classes = [];
	this._instances = {}; /* by id, deserialized json */
	this._done = {}; /* by id, completed instances */
	this._later = {}; /* object and properties waiting for delayed deserialization */
	this._revives = [];
	
	/* inverse translation table */
	for (var p in RPG.Serializer.TRANSLATION) {
		var v = RPG.Serializer.TRANSLATION[p];
		RPG.Parser.TRANSLATION[v] = p;
	}
}

RPG.Parser.prototype.go = function(str) {
	/* contains:
		- classes
		- game
		- stacks
	*/
	this._revives = [];
	var data = JSON.parse(str);

	/* retrieve classes */
	if (!data.classes) { throw new Error("No classes in saved data"); }
	for (var i=0;i<data.classes.length;i++) {
		var cl = this._nameToClass(data.classes[i]);
		this._classes.push(cl);
	}
	
	/* merge all instances from stacks */
	this._instances = {};
	this._done = {};
	for (var p in data) {
		if (p.charAt(0) != "#") { continue; }
		var stack = data[p];
		for (var i=0;i<stack.length;i++) {
			var id = p + "#" + i;
			this._instances[id] = stack[i];
		}
	}
	
	/* deserialize game */
	if (!data.game) { throw new Error("No game in saved data"); }
	this._parse(data.game);
	
	/* deserialize instances */
	for (var p in this._instances) {
		if (p in this._done) { continue; } /* already done */
		this._parseInstance(p);
	}
	

	this._instances = {};
	this._done = {};
	this._later = {};
	return data.game;
}

/* revive all who know how to do it */
RPG.Parser.prototype.revive = function() {
	for (var i=0;i<this._revives.length;i++) {
		this._revives[i].revive();
	}
	this._revives = [];
}

/**
 * Parse newly created "instance" and fix string references
 */
RPG.Parser.prototype._parse = function(obj) {
	for (var p in obj) {
		var v = obj[p];
		
		/* inverse prop translation */
		if (p in RPG.Parser.TRANSLATION) {
			delete obj[p];
			p = RPG.Parser.TRANSLATION[p];
			obj[p] = v;
		}
		
		if (v === null) { continue; }

		switch (typeof(v)) {
			case "string":
				this._parseString(v, obj, p);
			break;
			case "object":
				arguments.callee.call(this, v);
			break;
		}
	}
}

/**
 * Resolve string reference to constructor/instance
 */
RPG.Parser.prototype._parseString = function(string, object, property) {
	var r = string.match(/^#(c|[0-9]*)#([0-9]+)$/);
	if (!r) { return; }

	if (r[1] == "c") {
		object[property] = this._parseClass(parseInt(r[2]));
		return;
	}
	
	if (string in this._done) {
		object[property] = this._done[string];
		return;
	}
		
	if (!(string in this._instances)) { throw new Error("Non-existent instance '"+string+"'"); }

	if (!(string in this._later)) { this._later[string] = []; }
	this._later[string].push([object, property]);
}

/**
 * Convert stringified instance to new "instance"
 */
RPG.Parser.prototype._parseInstance = function(id) {
	var instance = this._instances[id];
	var classIndex = instance["#"];
	var ctor = this._parseClass(classIndex);
	if (!ctor) { throw new Error("No class available for '"+id+"'"); }
	
	/* create "instance" */
	var tmp = function(){};
	tmp.prototype = ctor.prototype;
	var result = new tmp();
	
	/* copy all values */
	for (var p in instance) {
		if (p == "#") { continue; }
		result[p] = instance[p];
	}
	
	/* mark as done */
	this._done[id] = result;

	/* are we waiting for this? */
	if (id in this._later) {
		var arr = this._later[id];
		for (var i=0;i<arr.length;i++) {
			var item = arr[i];
			item[0][item[1]] = result;
		}
		delete this._later[id];
	}
	
	/* sub-parse */
	this._parse(result);
	
	/* revive */
	if (result.revive) { this._revives.push(result); }
}

/**
 * Parse a previously serialized class (constructor)
 * @param {number} Class index (created by serializer.serializeClass)
 */
RPG.Parser.prototype._parseClass = function(index) {
	if (index < 0 || index >= this._classes.length) { throw new Error("Non-existent class index "+index); }
	return this._classes[index];
}

/**
 * Convert a dotted string to JS value
 */
RPG.Parser.prototype._nameToClass = function(str) {
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
