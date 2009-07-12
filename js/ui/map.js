/**
 * Basic map visualizator
 */
RPG.UI.BaseMap = OZ.Class();

RPG.UI.BaseMap.prototype.init = function(container, cellCtor) {
	this._size = null;
	this._cellCtor = cellCtor;
	this._dom = {
		container: container,
		data: null
	}
}

RPG.UI.BaseMap.prototype.resize = function(size) {
	this._size = size.clone();
	OZ.DOM.clear(this._dom.container);
	this._resize();
	
	/* create cells */
	var c = new RPG.Misc.Coords(0, 0);
	this._dom.data = new Array(this._size.x);
	for (var j=0;j<this._size.y;j++) {
		for (var i=0;i<this._size.x;i++) {
			c.x = i;
			c.y = j;
			if (!j) { this._dom.data[i] = new Array(this._size.y); }
			var cell = new this._cellCtor(this, c);
			this._dom.data[i][j] = cell;
		}
	}
}

RPG.UI.BaseMap.prototype.redrawCoords = function(coords, data, remembered) {
	var cell = this._dom.data[coords.x][coords.y];
	cell.update(data, remembered);
}

RPG.UI.BaseMap.prototype._resize = function() {
}

/**
 * @class Basic map cell
 */
RPG.UI.BaseCell = OZ.Class();
RPG.UI.BaseCell.prototype.init = function(owner, coords) {
	this._owner = owner;
	this._dom = {};
}

/**
 * Update cell contents
 * @param {RPG.Visual.VisualInterface[]} data Array of data to be shown
 * @param {bool} remembered Is this a remembered part of a map?
 */
RPG.UI.BaseCell.prototype.update = function(data, remembered) {
}

/**
 * @class Image map
 * @augments RPG.UI.BaseMap
 */
RPG.UI.ImageMap = OZ.Class().extend(RPG.UI.BaseMap);
RPG.UI.ImageMap.prototype.init = function(container, options) {
	this.parent(container, RPG.UI.ImageCell);
	OZ.DOM.addClass(container, "map");
	this.options = {
		tileSize: new RPG.Misc.Coords(32, 32)
	}
	for (var p in options) { this.options[p] = options[p]; }
	this._dom.container.style.position = "relative";
}

RPG.UI.ImageMap.prototype._resize = function() {
	this._dom.container.style.width = (this.options.tileSize.x * this._size.x) + "px";
	this._dom.container.style.height = (this.options.tileSize.y * this._size.y) + "px";
}

/**
 * @class Image cell
 * @augments RPG.UI.BaseCell
 */
RPG.UI.ImageCell = OZ.Class().extend(RPG.UI.BaseCell);
RPG.UI.ImageCell.prototype.init = function(owner, coords) {
	this.parent(owner);

	var ts = owner.options.tileSize;
	var container = owner._dom.container;
	var x = coords.x * ts.x;
	var y = coords.y * ts.y;
	this._dom.container = OZ.DOM.elm("div", {position:"absolute", left:x+"px", top:y+"px", width:ts.x+"px", height:ts.y+"px"});
	this._dom.nodes = [];
	
	for (var i=0;i<2;i++) {
		var node = OZ.DOM.elm("img", {position:"absolute", left:"0px", top:"0px", width:ts.x+"px", height:ts.y+"px"});
		this._dom.nodes.push(node);
		this._dom.container.appendChild(node);
	}
	container.appendChild(this._dom.container);
}

/**
 * @see RPG.UI.BaseCell#update
 */
RPG.UI.ImageCell.prototype.update = function(data, remembered) {
	this._dom.container.style.opacity = (remembered ? 0.5 : 1);
	for (var i=0;i<this._dom.nodes.length;i++) {
		var what = (data.length > i ? data[i] : null);
		this._updateImage(this._dom.nodes[i], what);
	}
}

RPG.UI.ImageCell.prototype._updateImage = function(node, what) {
	if (!what) {
		node.style.visibility = "hidden";
		return;
	}
	
	node.style.visibility = "visible";
	var src = what.getImage();
	var text = what.describeA();

	var type = "";
	if (what instanceof RPG.Beings.BaseBeing) {
		type = "beings";
	} else if (what instanceof RPG.Items.BaseItem) {
		type = "items";
	} else if (what instanceof RPG.Cells.BaseCell) {
		type = "cells";
	} else if (what instanceof RPG.Features.BaseFeature) {
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
 * @augments RPG.UI.BaseMap
 */
RPG.UI.ASCIIMap = OZ.Class().extend(RPG.UI.BaseMap);
RPG.UI.ASCIIMap.prototype.init = function(container) {
	this.parent(container, RPG.UI.ASCIICell);
	OZ.DOM.addClass(container, "ascii");
}

RPG.UI.ASCIIMap.prototype._computeWidth = function() {
	var tmp = OZ.DOM.elm("span");
	tmp.innerHTML = "x";
	this._dom.container.appendChild(tmp);
	this._charWidth = tmp.offsetWidth;
	OZ.DOM.clear(this._dom.container);
}

RPG.UI.ASCIIMap.prototype._resize = function() {
	this._computeWidth();
	this._dom.container.style.width = (this._charWidth * this._size.x) + "px";
}

/**
 * @class ASCII cell
 * @augments RPG.UI.BaseCell
 */
RPG.UI.ASCIICell = OZ.Class().extend(RPG.UI.BaseCell);
RPG.UI.ASCIICell.prototype.init = function(owner, coords) {
	this.parent(owner);

	var container = owner._dom.container;
	this._dom.node = OZ.DOM.elm("span", {backgroundColor: "black"});
	container.appendChild(this._dom.node);
	if (coords.x + 1 == owner._size.x) {
		container.appendChild(OZ.DOM.elm("br"));
	}
	
	this._currentChar = null;
	this._currentColor = null;
}

/**
 * @see RPG.UI.BaseCell#update
 */
RPG.UI.ASCIICell.prototype.update = function(data, remembered) {
	this._dom.node.style.opacity = (remembered ? 0.5 : 1);
	
	var item = (data.length ? data[data.length-1] : null);
	if (!item) {
		this._dom.node.innerHTML = "&nbsp;"
		return;
	}

	var ch = item.getChar();
	var color = item.getColor();
	var title = item.describeA();
	
	this._dom.node.title = title;
	if (ch != this._currentChar) {
		this._currentChar = ch;
		this._dom.node.innerHTML = ch;
	}
	if (color != this._currentColor) {
		this._currentColor = color;
		this._dom.node.style.color = color;
	}
}
