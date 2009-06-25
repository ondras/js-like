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
			cell.update(cell.HIDDEN);
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
		if (cell.state == cell.VISIBLE) { cell.update(cell.INVISIBLE); }
	} else { /* cell is visible */
		cell.update(cell.VISIBLE);
	}
}

RPG.Visual.BaseMap.prototype._resize = function() {
}

/**
 * @class Basic map cell
 */
RPG.Visual.BaseCell = OZ.Class();
RPG.Visual.BaseCell.prototype.init = function(owner, coords) {
	this.HIDDEN = 0;
	this.INVISIBLE = 1;
	this.VISIBLE = 2;
	
	this.state = this.HIDDEN; /* 0 = not seen, 1 = seen but old, 2 = visible */
	this._owner = owner;
	this._coords = coords.clone();
}

/**
 * Update state
 * @param {int} new state
 */
RPG.Visual.BaseCell.prototype.update = function(state) {
	this.state = state;
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
	this.container = OZ.DOM.elm("div", {position:"absolute", left:x+"px", top:y+"px", width:ts.x+"px", height:ts.y+"px"});
	this.node1 = OZ.DOM.elm("img", {position:"absolute", left:"0px", top:"0px"});
	this.node2 = OZ.DOM.elm("img", {position:"absolute", left:"0px", top:"0px"});
	
	container.appendChild(this.container);
	this.container.appendChild(this.node1);
	this.container.appendChild(this.node2);
	
	/* node2 value when not visible */
	this._invisNode = null;
}

/**
 * @see RPG.Visual.BaseCell#update
 */
RPG.Visual.ImageCell.prototype.update = function(state) {
	this.state = state;
	switch (state) {
		case this.HIDDEN:
			this.node1.style.visibility = "hidden";
			this.node2.style.visibility = "hidden";
		break;

		case this.INVISIBLE:
			this.container.style.opacity = 0.5;
			if (this._invisNode) {
				this._updateImage(this.node2, this._invisNode);
			} else {
				this.node2.style.visibility = "hidden";
			}
		break;

		case this.VISIBLE:
			this._draw();
		break;
	}
}

/**
 * Complete cell redraw
 */
RPG.Visual.ImageCell.prototype._draw = function() {
	this.container.style.opacity = 1;
	var cell = RPG.World.getMap().at(this._coords);
	this._updateImage(this.node1, cell);
	
	/* find proper node for invisibility mode */
	var top = cell.getItems();
	if (top.length) { 
		top = top[top.length-1]; 
	} else {
		top = cell.getFeature();
	}
	
	this._invisNode = top;
	
	var b = cell.getBeing();
	if (b) { 
		this._updateImage(this.node2, b);
	} else if (top) {
		this._updateImage(this.node2, top);
	} else {
		this.node2.style.visibility = "hidden";
	}
}

RPG.Visual.ImageCell.prototype._updateImage = function(node, what) {
	node.style.visibility = "visible";
	var src = what.getImage();
	var text = what.describeA();

	var type = "";
	if (what instanceof RPG.Beings.BaseBeing) {
		type = "beings";
	} else if (what instanceof RPG.Items.BaseItem) {
		type = "items";
	} else if (what instanceof RPG.Dungeon.BaseCell) {
		type = "cells";
	} else if (what instanceof RPG.Dungeon.BaseFeature) {
		type = "features";
	}
	
	var url = "img/"+type+"/"+src+".png";
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
	
	this._currentChar = null;
	this._currentColor = null;
	this._invisChar = null;
	this._invisColor = null;
	this._invisTitle = null;
}

/**
 * @see RPG.Visual.BaseCell#update
 */
RPG.Visual.ASCIICell.prototype.update = function(state) {
	this.state = state;
	switch (state) {
		case this.HIDDEN:
			this.node.innerHTML = "&nbsp;";
		break;
		case this.INVISIBLE:
			this.node.style.opacity = 0.5;
		
			if (this._currentChar != this._invisChar) {
				this._currentChar = this._invisChar;
				this.node.innerHTML = this._currentChar;
			}
			
			if (this._currentColor != this._invisColor) {
				this._currentColor = this._invisColor;
				this.node.style.color = this._currentColor;
			}
			
			this.node.title = this._invisTitle;
		break;
		case this.VISIBLE:
			this._draw();
		break;
	}
}

/**
 * Complete cell redraw
 */
RPG.Visual.ASCIICell.prototype._draw = function() {
	this.node.style.opacity = 1;
	var cell = RPG.World.getMap().at(this._coords);
	
	var ch;
	var color;
	var title;
	
	var top = cell.getItems();
	if (top.length) {
		top = top[top.length-1];
	} else {
		top = cell.getFeature();
	}
	
	if (top) {
		this._invisChar = top.getChar();
		this._invisColor = top.getColor();
		this._invisTitle = top.describeA();
	} else {
		this._invisChar = cell.getChar();
		this._invisColor = cell.getColor();
		this._invisTitle = cell.describeA();
	}
	
	var b = cell.getBeing();
	if (b) { 
		ch = b.getChar();
		color = b.getColor();
		title = b.describeA();
	} else {
		ch = this._invisChar;
		color = this._invisColor;
		title = this._invisTitle;
	}
	
	this.node.title = title;
	if (ch != this._currentChar) {
		this._currentChar = ch;
		this.node.innerHTML = ch;
	}
	if (color != this._currentColor) {
		this._currentColor = color;
		this.node.style.color = color;
	}
}
