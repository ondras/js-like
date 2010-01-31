/**
 * @class Save data creator
 */
RPG.Serializer = OZ.Class();

RPG.Serializer.prototype.init = function() {
	this._classes = [];
	this._stacks = [];
	this._defaultStack = null;
}

/**
 * Go!
 */
RPG.Serializer.prototype.go = function() {
	this._stacks = [];
	this._classes = [];
	var classNames = [];
	this._scanClasses(RPG, "RPG", this._classes, classNames);
	
	this._stacks.push(new RPG.Serializer.Stack(this, RPG.Beings.BaseBeing));
	this._stacks.push(new RPG.Serializer.Stack(this, RPG.Items.BaseItem));
	this._stacks.push(new RPG.Serializer.Stack(this, RPG.Cells.BaseCell));
	this._stacks.push(new RPG.Serializer.Stack(this, RPG.Map));
	this._defaultStack = new RPG.Serializer.Stack(this);

	var result = {};
	result.classes = classNames;
	result.game = RPG.Game.serialize(this);
	
	this._stacks.push(this._defaultStack);

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

	return JSON.stringify(result);
}

/**
 * Get an index for a given constructor
 */
RPG.Serializer.prototype.serializeClass = function(cl) {
	return this._classes.indexOf(cl);
}

/**
 * Serialize an instance of OZ.Class(). Return the serialized value.
 * This method is called by instances during their serialization process.
 */
RPG.Serializer.prototype.serialize = function(instance) {
	for (var i=0;i<this._stacks.length;i++) {
		var stack = this._stacks[i];
		if (stack.accepts(instance)) { return stack.add(instance); }
	}
	
	return this._defaultStack.add(instance);
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
	this._ctor = ctor;
	this._data = [];
	this._instances = [];
	this._index = (ctor ? serializer.serializeClass(ctor) : "");
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
		var data = instance.serialize(this._serializer);
		data["#ctor"] = this._serializer.serializeClass(instance.constructor);
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

RPG.Parser.prototype.init = function() {
	this._classes = [];
	this._instances = {};
	this._done = {};
	this._later = {};
}

RPG.Parser.prototype.go = function(str) {
	/* contains:
		- classes
		- game
		- stacks
	*/
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
	RPG.Game.parse(data.game, this);
	
	/* deserialize instances */
	for (var p in this._instances) {
		if (p in this._done) { continue; } /* already done */
		this._parseInstance(p);
		
	}
	
}

/**
 * Parse a previously serialized instance of OZ.Class(); when it becomes available, 
 * set it as a property of a given object.
 * This method is called by instances during their parsing process.
 * @param {string} what serialized reference to object
 * @param {object} object where to put unserialized instance
 * @param {string} property which property name to use
 */
RPG.Parser.prototype.parse = function(what, object, property) {
	if (what in this._done) { /* already parsed */
		object[property] = this._done[what];
		return; 
	} 
	
	if (!(what in this._instances)) { throw new Error("Non-existent instance '"+what+"'"); }
	var instance = this._instances[what];
	
	if (!(what in this._later)) { this._later[what] = []; }
	this._later[what].push([object, property]);
}

/**
 * Parse a previously serialized class (constructor)
 * @param {number} Class index (created by serializer.serializeClass)
 */
RPG.Parser.prototype.parseClass = function(index) {
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

/**
 * Parse one instance
 */
RPG.Parser.prototype._parseInstance = function(id) {
	var instance = this._instances[id];
	var classIndex = instance["#ctor"];
	var ctor = this.parseClass(classIndex);
	if (!ctor) { throw new Error("No class available for '"+id+"'"); }
	var tmp = function(){};
	tmp.prototype = ctor.prototype;
	var tmpInstance = new tmp();
	
	var result = tmpInstance.parse(instance, this);
	this._done[id] = result;
	
	if (id in this._later) {
		var arr = this._later[id];
		for (var i=0;i<arr.length;i++) {
			var item = arr[i];
			item[0][item[1]] = result;
		}
	}
}


function test2() {
	RPG.Beings.PC.prototype.serialize = function(serializer) { 
		return {
			name:"PC jak cyp", 
			wut:serializer.serialize(this)
		}; 
	}
	RPG.Beings.PC.prototype.parse = function(data, parser) { 
		var obj = {pica:"parek"};
		parser.parse(data.wut, obj, "wut");
		return obj;
	}

	var ser = new RPG.Serializer();
	var str = ser.go();

	var par = new RPG.Parser();
	par.go(str);
}
