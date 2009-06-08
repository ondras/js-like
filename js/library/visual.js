/**
 * @class Basic map cell
 */
RPG.Visual.BaseCell = OZ.Class();
RPG.Visual.BaseCell.prototype.init = function(owner, coords) {
	this._owner = owner;
}

/**
 * Reset a cell - we have never seen it
 */
RPG.Visual.BaseCell.prototype.reset = function() {
}

/**
 * Mark a cell as being out of sight
 */
RPG.Visual.BaseCell.prototype.notVisible = function() {
	this.reset();
}

/**
 * Is visible - fill with relevant data
 */
RPG.Visual.BaseCell.prototype.sync = function(being, coords) {
}


/**
 * @class Basic map
 */
RPG.Visual.BaseMap = OZ.Class();
RPG.Visual.BaseMap.prototype.init = function(container) {
	this.dom = {
		container: container
	}
	this._being = null;
	this._data = null;
	this._size = null;
	this._cell = RPG.Visual.BaseCell;
	
	OZ.Event.add(RPG.getWorld(), "map", this.bind(this._mapChange));
	OZ.Event.add(RPG.getWorld(), "action", this.bind(this._action));
}

RPG.Visual.BaseMap.prototype._mapChange = function(e) {
	this._map(e.data);
}

RPG.Visual.BaseMap.prototype._map = function(map) {
	this._size = map.getSize();
	this._rebuild();
	this._redraw();
}

RPG.Visual.BaseMap.prototype.setBeing = function(being) {
	this._being = being;
}

RPG.Visual.BaseMap.prototype._rebuild = function() {
	OZ.DOM.clear(this.dom.container);
	this._resize();
	this._data = new Array(this._size.x);
	
	var coords = new RPG.Misc.Coords(0, 0);
	for (var j=0;j<this._size.y;j++) {
		for (var i=0;i<this._size.x;i++) {
			if (!j) { this._data[i] = new Array(this._size.y); }
			coords.x = i;
			coords.y = j;
			var cell = new this._cell(this, coords);
			cell.reset();
			this._data[i][j] = cell;
		}
	}
}

RPG.Visual.BaseMap.prototype._redraw = function() {
	var bc = this._being.getCoords();
	var dist = this._being.sightDistance();
	var c = new RPG.Misc.Coords(0, 0);
	for (var j=0;j<this._size.y;j++) {
		for (var i=0;i<this._size.x;i++) {
			var cell = this._data[i][j];
			c.x = i;
			c.y = j;
			if (bc.distance(c) > dist || !this._being.canSee(c)) { /* cell is not visible */
				cell.notVisible();
			} else { /* cell is visible */
				cell.sync(this._being, c);
			}
		}
	}
}

RPG.Visual.BaseMap.prototype._action = function(e) {
	this._redraw();
}


/**
 * @class Image cell
 * @augments RPG.Visual.BaseCell
 */
RPG.Visual.ImageCell = OZ.Class().extend(RPG.Visual.BaseCell);
RPG.Visual.ImageCell.prototype.init = function(owner, coords) {
	this.parent(owner);

	var ts = owner.options.tileSize;
	var container = owner.dom.container;
	var x = coords.x * ts.x;
	var y = coords.y * ts.y;
	this.node1 = OZ.DOM.elm("img", {position:"absolute", left:x+"px", top:y+"px", width:ts.x+"px", height:ts.y+"px"});
	this.node2 = OZ.DOM.elm("img", {position:"absolute", left:x+"px", top:y+"px", width:ts.x+"px", height:ts.y+"px"});
	
	container.appendChild(this.node1);
	container.appendChild(this.node2);
}

RPG.Visual.ImageCell.prototype.reset = function() {
	this.node1.style.visibility = "hidden";
	this.node2.style.visibility = "hidden";
}

RPG.Visual.ImageCell.prototype.sync = function(being, coords) {
	var cell = being.cellInfo(coords);
	this._updateImage(this.node1, cell, being);

	var b = cell.getBeing();
	if (b) { 
		this._updateImage(this.node2, b, being);
		return;
	}

	var items = cell.getItems();
	if (items.length) {
		var item = items[items.length-1];
		this._updateImage(this.node2, item, being);
		return;
	}
	
	this.node2.style.visibility = "hidden";
}

RPG.Visual.ImageCell.prototype._updateImage = function(node, what, being) {
	node.style.visibility = "visible";
	var src = what.getImage(being);
	var text = what.describeA(being);

	var url = "img/"+src+".png";
	if (node.src.indexOf(url) == -1) { 
		node.src = url; 
	} else {
	}
	node.alt = text;
	node.title = text;
}

/**
 * @class Image map
 * @augments RPG.Visual.BaseMap
 */
RPG.Visual.ImageMap = OZ.Class().extend(RPG.Visual.BaseMap);
RPG.Visual.ImageMap.prototype.init = function(container, options) {
	this.parent(container);
	this.options = {
		tileSize: new RPG.Misc.Coords(32, 32)
	}
	this.dom.container.style.position = "relative";
	for (var p in options) { this.options[p] = options[p]; }
	this._cell = RPG.Visual.ImageCell;

	var map = RPG.getWorld().getMap();
	if (map) { this._map(map); }
}
RPG.Visual.ImageMap.prototype._resize = function() {
	this.dom.container.style.width = (this.options.tileSize.x * this._size.x) + "px";
	this.dom.container.style.height = (this.options.tileSize.y * this._size.y) + "px";
}

/**
 * @class ASCII cell
 * @augments RPG.Visual.BaseCell
 */
RPG.Visual.ASCIICell = OZ.Class().extend(RPG.Visual.BaseCell);
RPG.Visual.ASCIICell.prototype.init = function(owner, coords) {
	this.parent(owner);

	var container = owner.dom.container;
	this.node = OZ.DOM.elm("span");
	container.appendChild(this.node);
	if (coords.x + 1 == owner._size.x) {
		container.appendChild(OZ.DOM.elm("br"));
	}
}

RPG.Visual.ASCIICell.prototype.reset = function() {
	this.node.innerHTML = "&nbsp;"
}

RPG.Visual.ASCIICell.prototype.sync = function(being, coords) {
	var cell = being.cellInfo(coords);

	/* background */
	var cellvis = cell.getChar(being);
	this.node.style.backgroundColor = cellvis.getBackground();

	/* is there a being? */
	var b = cell.getBeing();
	if (b) {
		var beingvis = b.getChar(being);
		this.node.innerHTML = beingvis.getChar();
		this.node.style.color = beingvis.getColor();
		return;
	}
	
	/* is there an item? */
	var items = cell.getItems();
	if (items.length) {
		var item = items[items.length-1];
		var itemvis = item.getChar(being);
		this.node.innerHTML = itemvis.getChar();
		this.node.style.color = itemvis.getColor();
		return;
	}
	
	/* does the cell has a representation? */
	this.node.innerHTML = cellvis.getChar();
	this.node.style.color = cellvis.getColor();
}

/**
 * @class Classic ASCII map
 * @augments RPG.Visual.BaseMap
 */
RPG.Visual.ASCIIMap = OZ.Class().extend(RPG.Visual.BaseMap);
RPG.Visual.ASCIIMap.prototype.init = function(container) {
	this.parent(container);
	this._computeWidth();

	this._cell = RPG.Visual.ASCIICell;

	var map = RPG.getWorld().getMap();
	if (map) { this._map(map); }
}

RPG.Visual.ASCIIMap.prototype._computeWidth = function() {
	var tmp = OZ.DOM.elm("span");
	tmp.innerHTML = "x";
	this.dom.container.appendChild(tmp);
	this._charWidth = tmp.offsetWidth;
	OZ.DOM.clear(this.dom.container);
}

RPG.Visual.ASCIIMap.prototype._resize = function() {
	this.dom.container.style.width = (this._charWidth * this._size.x) + "px";
}

/**
 * @class Textual description area
 */
RPG.Visual.TextBuffer = OZ.Class();
RPG.Visual.TextBuffer.prototype.init = function(textarea) {
	this._world = null;
	this._being = null;
	this._event = null;
	this.dom = {
		textarea: textarea
	}
	this.dom.textarea.value = "";
	OZ.Event.add(RPG.getWorld(), "action", this.bind(this._action));
}
RPG.Visual.TextBuffer.prototype.setBeing = function(being) {
	this._being = being;
}
RPG.Visual.TextBuffer.prototype._action = function(e) {
	var action = e.data;
	var description = action.describe(this._being);
	description += " ";

	var source = action.getSource();
	if (this._being && this._being != source) {
		this.dom.textarea.value += description;
	} else {
		this.dom.textarea.value = description;
	}
}
