/**
 * @class Textual description area
 */
RPG.Visual.TextBuffer = OZ.Class();
RPG.Visual.TextBuffer.prototype.init = function(textarea) {
	this._dom = {
		textarea: textarea
	}
	this._dom.textarea.value = "";
}

RPG.Visual.TextBuffer.prototype.show = function(str) {
	var s = str.charAt(0).toUpperCase() + str.substring(1);
	this._dom.textarea.value += s+" ";
}

RPG.Visual.TextBuffer.prototype.clear = function() {
	this._dom.textarea.value = "";
}


/**
 * Basic map visualizator
 */
RPG.Visual.BaseMap = OZ.Class();

RPG.Visual.BaseMap.prototype.init = function(container, cellCtor) {
	this._size = null;
	this._cellCtor = cellCtor;
	this._dom = {
		container: container,
		data: null
	}
}

RPG.Visual.BaseMap.prototype.adjust = function(map) {
	this._size = map.getSize();
	OZ.DOM.clear(this._dom.container);
	this._resize();
	this._dom.data = new Array(this._size.x);
	
	var coords = new RPG.Misc.Coords(0, 0);
	for (var j=0;j<this._size.y;j++) {
		for (var i=0;i<this._size.x;i++) {
			if (!j) { this._dom.data[i] = new Array(this._size.y); }
			coords.x = i;
			coords.y = j;
			var cell = new this._cellCtor(this, coords);
			cell.reset();
			this._dom.data[i][j] = cell;
		}
	}
	this.redraw();
}

RPG.Visual.BaseMap.prototype.redraw = function() {
	var c = new RPG.Misc.Coords(0, 0);
	for (c.x=0;c.x<this._size.x;c.x++) {
		for (c.y=0;c.y<this._size.y;c.y++) {
			this.redrawCoords(c);
		}
	}
}

RPG.Visual.BaseMap.prototype.redrawCoords = function(coords) {
	var pc = RPG.World.getPC();
	var pccoords = pc.getCoords();
	var dist = pc.sightDistance();
	var cell = this._dom.data[coords.x][coords.y];

	if (pccoords.distance(coords) > dist || !pc.canSee(coords)) { /* cell is not visible */
		cell.notVisible();
	} else { /* cell is visible */
		cell.sync();
	}
}

RPG.Visual.BaseMap.prototype._resize = function() {
}

/**
 * @class Basic map cell
 */
RPG.Visual.BaseCell = OZ.Class();
RPG.Visual.BaseCell.prototype.init = function(owner, coords) {
	this._owner = owner;
	this._coords = coords.clone();
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
RPG.Visual.BaseCell.prototype.sync = function() {
}


/**
 * @class Image map
 * @augments RPG.Visual.BaseMap
 */
RPG.Visual.ImageMap = OZ.Class().extend(RPG.Visual.BaseMap);
RPG.Visual.ImageMap.prototype.init = function(container, cell, options) {
	this.parent(container, RPG.Visual.ImageCell);
	this.options = {
		tileSize: new RPG.Misc.Coords(32, 32)
	}
	this._dom.container.style.position = "relative";
	for (var p in options) { this.options[p] = options[p]; }
}

RPG.Visual.ImageMap.prototype._resize = function() {
	this._dom.container.style.width = (this.options.tileSize.x * this._size.x) + "px";
	this._dom.container.style.height = (this.options.tileSize.y * this._size.y) + "px";
}

/**
 * @class Image cell
 * @augments RPG.Visual.BaseCell
 */
RPG.Visual.ImageCell = OZ.Class().extend(RPG.Visual.BaseCell);
RPG.Visual.ImageCell.prototype.init = function(owner, coords) {
	this.parent(owner, coords);

	var ts = owner.options.tileSize;
	var container = owner._dom.container;
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

RPG.Visual.ImageCell.prototype.notVisible = function() {
	this.node2.style.visibility = "hidden";
}

RPG.Visual.ImageCell.prototype.sync = function() {
	var cell = RPG.World.getMap().at(this._coords);
	this._updateImage(this.node1, cell);

	var b = cell.getBeing();
	if (b) { 
		this._updateImage(this.node2, b);
		return;
	}

	var items = cell.getItems();
	if (items.length) {
		var item = items[items.length-1];
		this._updateImage(this.node2, item);
		return;
	}
	
	this.node2.style.visibility = "hidden";
}

RPG.Visual.ImageCell.prototype._updateImage = function(node, what) {
	node.style.visibility = "visible";
	var src = what.getImage();
	var text = what.describeA();

	var url = "img/"+src+".png";
	if (node.src.indexOf(url) == -1) { 
		node.src = url; 
	} else {
	}
	node.alt = text;
	node.title = text;
}

/**
 * @class Classic ASCII map
 * @augments RPG.Visual.BaseMap
 */
RPG.Visual.ASCIIMap = OZ.Class().extend(RPG.Visual.BaseMap);
RPG.Visual.ASCIIMap.prototype.init = function(container) {
	this.parent(container, RPG.Visual.ASCIICell);
}

RPG.Visual.ASCIIMap.prototype._computeWidth = function() {
	var tmp = OZ.DOM.elm("span");
	tmp.innerHTML = "x";
	this._dom.container.appendChild(tmp);
	this._charWidth = tmp.offsetWidth;
	OZ.DOM.clear(this._dom.container);
}

RPG.Visual.ASCIIMap.prototype._resize = function() {
	this._computeWidth();
	this._dom.container.style.width = (this._charWidth * this._size.x) + "px";
}

/**
 * @class ASCII cell
 * @augments RPG.Visual.BaseCell
 */
RPG.Visual.ASCIICell = OZ.Class().extend(RPG.Visual.BaseCell);
RPG.Visual.ASCIICell.prototype.init = function(owner, coords) {
	this.parent(owner, coords);

	var container = owner._dom.container;
	this.node = OZ.DOM.elm("span", {backgroundColor: "black"});
	container.appendChild(this.node);
	if (coords.x + 1 == owner._size.x) {
		container.appendChild(OZ.DOM.elm("br"));
	}
	
	this._char = null;
	this._color = null;
	this._cellChar = null;
	this._cellColor = null;
}

RPG.Visual.ASCIICell.prototype.reset = function() {
	this.node.innerHTML = "&nbsp;";
}

RPG.Visual.ASCIICell.prototype.notVisible = function() {
	if (this._char != this._cellChar) {
		this._char = this._cellChar;
		this.node.innerHTML = this._char;
	}
	if (this._color != this._cellColor) {
		this._color = this._cellColor;
		this.node.style.color = this._color;
	}
}

RPG.Visual.ASCIICell.prototype.sync = function() {
	var cell = RPG.World.getMap().at(this._coords);
	
	/* background */
	this._cellChar = cell.getChar();
	this._cellColor = cell.getColor();

	var b = cell.getBeing();
	var items = cell.getItems();

	if (b) { /* is there a being? */
		var ch = (b == RPG.World.getPC() ? "@" : b.getChar());
		var color = b.getColor();
	} else if (items.length) { /* is there an item? */
		var item = items[items.length-1];
		var ch = item.getChar();
		var color = item.getColor();
	} else { /* does the cell has a representation? */
		ch = this._cellChar;
		color = this._cellColor;
	}
	
	if (ch != this._char) {
		this._char = ch;
		this.node.innerHTML = ch;
	}
	
	if (color != this._color) {
		this._color = color;
		this.node.style.color = color;
	}
}
