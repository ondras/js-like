/**
 * Basic map visualizator
 */
RPG.UI.BaseMap = OZ.Class();

RPG.UI.BaseMap.prototype.init = function(container, cellCtor) {
	this._size = null;
	this._cellCtor = cellCtor;
	this._focus = null;
	this._projectiles = [];
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
	
	this.setFocus(RPG.World.pc.getCell().getCoords());
}

RPG.UI.BaseMap.prototype.redrawCoords = function(coords, data, remembered) {
	var cell = this._dom.data[coords.x][coords.y];
	cell.update(data, remembered);
}

RPG.UI.BaseMap.prototype.setFocus = function(coords) {
	if (this._focus) {
		var c = this._focus;
		this._dom.data[c.x][c.y].removeFocus();
	}
	this._dom.data[coords.x][coords.y].addFocus();
	this._focus = coords.clone();
}

/**
 * Draw a projectile at a given coords
 */
RPG.UI.BaseMap.prototype.setProjectile = function(coords, projectile) {
	var cell = this._dom.data[coords.x][coords.y];
	var index = this._projectiles.indexOf(cell);
	if (index == -1) { this._projectiles.push(cell); }
	cell.addProjectile(projectile);
}

/**
 * Remove all drawn projectiles
 */
RPG.UI.BaseMap.prototype.clearProjectiles = function() {
	while (this._projectiles.length) {
		var p = this._projectiles.shift();
		p.removeProjectile();
	}
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
 * @param {RPG.Visual.IVisual[]} data Array of data to be shown
 * @param {bool} remembered Is this a remembered part of a map?
 */
RPG.UI.BaseCell.prototype.update = function(data, remembered) {
}

RPG.UI.BaseCell.prototype.addFocus = function() {
}

RPG.UI.BaseCell.prototype.removeFocus = function() {
}

/**
 * Draw a projectile at this cell
 */
RPG.UI.BaseCell.prototype.addProjectile = function(projectile) {
}

/**
 * Revert to non-projectile state
 */
RPG.UI.BaseCell.prototype.removeProjectile = function() {
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
	this._dom.focus = OZ.DOM.elm("div", {className:"focus"});
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

	this._dom.focus = owner._dom.focus;
	
	var ts = owner.options.tileSize;
	var container = owner._dom.container;
	var x = coords.x * ts.x;
	var y = coords.y * ts.y;
	this._dom.container = OZ.DOM.elm("div", {position:"absolute", left:x+"px", top:y+"px"});
	this._dom.nodes = [];
	
	for (var i=0;i<2;i++) {
		var node = OZ.DOM.elm("img", {position:"absolute", left:"0px", top:"0px"});
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

RPG.UI.ImageCell.prototype.addFocus = function() {
	this._dom.container.appendChild(this._dom.focus);
}

RPG.UI.ImageCell.prototype._updateImage = function(node, what) {
	if (!what) {
		node.style.visibility = "hidden";
		return;
	}
	
	node.style.visibility = "visible";
	var src = what.getImage();
	var text = what.describe();

	var type = "";
	if (what instanceof RPG.Beings.PC) {
		type = "pc";
	} else if (what instanceof RPG.Beings.NPC) {
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
		this._dom.node.innerHTML = "&nbsp;";
		this._dom.node.style.color = "white";
		return;
	}

	var ch = item.getChar();
	var color = item.getColor();
	var title = item.describe();
	
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

RPG.UI.ASCIICell.prototype.addFocus = function() {
	OZ.DOM.addClass(this._dom.node, "focus");
}

RPG.UI.ASCIICell.prototype.removeFocus = function() {
	OZ.DOM.removeClass(this._dom.node, "focus");
}

RPG.UI.ASCIICell.prototype.addProjectile = function(projectile) {
	this._dom.node.innerHTML = projectile.getChar();
	this._dom.node.style.color = projectile.getColor();
}

RPG.UI.ASCIICell.prototype.removeProjectile = function() {
	this._dom.node.innerHTML = this._currentChar;
	this._dom.node.style.color = this._currentColor;
}

