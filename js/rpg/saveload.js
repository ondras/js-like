/**
 * @class Save data creator
 */
RPG.Serializer = OZ.Class();

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
	result.game = this.serialize(RPG.Game);
	
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

	return JSON.stringify(result/*, null, "  "*/);
}

/**
 * Return index for a given class
 */
RPG.Serializer.prototype.classIndex = function(what) {
	return this._classes.indexOf(what);
}

/**
 * Convert instance to JSON representation
 */
RPG.Serializer.prototype.finalizeInstance = function(instance) {
	if (instance.serialize) {
		return instance.serialize(this);
	} else {
		return this._doSerializeInstance(instance);
	}
}

/**
 * Called from an instance that wants a specific serialization
 */
RPG.Serializer.prototype.serialize = function(what, options) {
	return this._doSerializeInstance(what, options);
}


RPG.Serializer.prototype._doSerializeInstance = function(what, options) {
	var result = this._serializeObject(what, options);
	result["#c"] = this.classIndex(what.constructor);
	return result;
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
	var ignore = ["constructor"];
	
	for (var p in obj) {
		if (ignore.indexOf(p) != -1) { continue; } /* globally forbidden name */
		if (options && options.exclude.indexOf(p) != -1) { continue; } /* locally forbidden name */

		var value = obj[p];
		if (typeof(value) == "undefined") { continue; }
		if (typeof(value) == "function" && !value.extend) {
			if (obj.hasOwnProperty(p)) {
//				console.warn("Unknown function (property '"+p+"') encountered - we cannot serialize this");
//				console.log(value);
			}
			continue;
		} 

		result[p] = this._serializeValue(obj[p]);
	}
	
	if (options && options.include) {
		for (var p in options.include) {
			var value = options.include[p];
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
	
	if (this._classes.indexOf(value.constructor) != -1) { /* instance */
		if (value.serializeToString) {
			return value.serializeToString();
		} else {
			return this._serializeInstance(value);
		}
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

var test2 = function() {
	var s = new RPG.Serializer();
	return s.go();
}