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
	this._focus = null;
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

/**
 * Redraw a game coords. If this cell is outside a visibility range, do nothing.
 */
RPG.UI.BaseMap.prototype.redrawCoords = function(coords) {
	if (!RPG.Game.pc.canSee(coords)) { return; }
	RPG.Game.pc.getMap().setMemory(RPG.MAP_VISIBLE, coords);
	this._redrawCoords(coords);
}

/**
 * Redraw the visible area.
 */
RPG.UI.BaseMap.prototype.redrawVisible = function() {
	var map = RPG.Game.getMap();

	var pc = RPG.Game.pc;
	var oldVisible = pc.getVisibleCoords();
	pc.updateVisibility(); /* tell PC to update its set of visible coordinates */
	var newVisible = pc.getVisibleCoords();

	/* check all cells visible before; if some is not visible now, mark it as remembered */
	for (var hash in oldVisible) {
		if (!(hash in newVisible)) { /* this one is no longer visible */
			var coords = oldVisible[hash];
			map.setMemory(RPG.MAP_REMEMBERED, coords);
			this._redrawCoords(coords);
		}
	}

	/* take all currently visible and mark them as visible */
	for (var hash in newVisible) {
		var coords = newVisible[hash];
		map.setMemory(RPG.MAP_VISIBLE, coords);
		this._redrawCoords(coords);
	}
}

/**
 * Redraw all coords on this map.
 */
RPG.UI.BaseMap.prototype.redrawAll = function() {
	var map = RPG.Game.getMap();
	var size = map.getSize();
	
	var coords = new RPG.Misc.Coords(0, 0);
	for (var i=0;i<size.x;i++) {
		for (var j=0;j<size.y;j++) {
			coords.x = i;
			coords.y = j;
			this._redrawCoords(coords);
		}
	}
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
RPG.UI.BaseMap.prototype.addProjectile = function(coords, projectile) {
	var cell = this._dom.data[coords.x][coords.y];
	var index = this._projectiles.indexOf(cell);
	if (index == -1) { this._projectiles.push(cell); }
	cell.addProjectile(projectile);
}

/**
 * Remove all drawn projectiles
 */
RPG.UI.BaseMap.prototype.removeProjectiles = function() {
	while (this._projectiles.length) {
		var p = this._projectiles.shift();
		p.removeProjectile();
	}
}

/**
 * Force redraw a coords
 */
RPG.UI.BaseMap.prototype._redrawCoords = function(coords) {
	var map = RPG.Game.getMap();
	var what = this._dom.data[coords.x][coords.y];

	var index = this._projectiles.indexOf(what);
	if (index != -1) {
		this._projectiles.splice(index, 1);
		what.removeProjectile();
	}

	what.update(map.getMemory(coords));
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
 * @param {object || null} memory Map memory
 */
RPG.UI.BaseCell.prototype.update = function(memory) {
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
	this._topLayer = null;
	
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
RPG.UI.ImageCell.prototype.update = function(memory) {
	this._dom.container.style.opacity = (memory && memory.state == RPG.MAP_REMEMBERED ? 0.5 : 1);

	for (var i=0;i<this._dom.nodes.length;i++) {
		var what = (memory && memory.data.length > i ? memory.data[i] : null);
		this._updateImage(this._dom.nodes[i], what);
		if (i == 1) { this._topLayer = what; }
	}
}

RPG.UI.ImageCell.prototype.addFocus = function() {
	this._dom.container.appendChild(this._dom.focus);
}

RPG.UI.ImageCell.prototype.addProjectile = function(projectile) {
	this._updateImage(this._dom.nodes[1], projectile);
}

RPG.UI.ImageCell.prototype.removeProjectile = function() {
	this._updateImage(this._dom.nodes[1], this._topLayer);
}

RPG.UI.ImageCell.prototype._updateImage = function(node, what) {
	if (!what) {
		node.style.visibility = "hidden";
		return;
	}
	
	node.style.visibility = "visible";
	var url = "img/" + what.imagePrefix + "/" + what.image + ".png";
	var text = what.desc;
	
	if (node.src.indexOf(url) == -1) { 
		node.src = url; 
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

RPG.UI.ASCIICell.prototype.entities = {
	"<": "&lt;",
	">": "&gt;",
	"&": "&amp;"
}

RPG.UI.ASCIICell.prototype.init = function(owner, coords) {
	this.parent(owner);

	var container = owner._dom.container;
	this._dom.node = OZ.DOM.elm("span", {backgroundColor: "black"});
	container.appendChild(this._dom.node);
	if (coords.x + 1 == owner._size.x) {
		container.appendChild(OZ.DOM.elm("br"));
	}
	
	this._dom.node.innerHTML = "&nbsp;";
	this._currentChar = "&nbsp;";
	this._currentColor = null;
}

/**
 * @see RPG.UI.BaseCell#update
 */
RPG.UI.ASCIICell.prototype.update = function(memory) {
	this._dom.node.style.opacity = (memory && memory.state == RPG.MAP_REMEMBERED ? 0.5 : 1);
	
	var item = (memory && memory.data.length ? memory.data[memory.data.length-1] : null);
	if (!item) {
		this._dom.node.innerHTML = "&nbsp;";
		this._dom.node.style.color = "white";
		this._currentChar = "&nbsp;";
		this._currentColor = "white";
		return;
	}

	var ch = item.ch;
	if (ch in this.entities) { ch = this.entities[ch]; }

	var color = item.color;
	var title = item.desc;
	
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
	this._dom.node.innerHTML = projectile.getVisual().ch;
	this._dom.node.style.color = projectile.getVisual().color;
}

RPG.UI.ASCIICell.prototype.removeProjectile = function() {
	this._dom.node.innerHTML = this._currentChar;
	this._dom.node.style.color = this._currentColor;
}

/**
 * @class Canvas-based map
 * @augments RPG.UI.BaseMap
 */
RPG.UI.CanvasMap = OZ.Class().extend(RPG.UI.BaseMap);
RPG.UI.CanvasMap.prototype.init = function(container) {
	this.parent(container);	
	this._font = "16px monospace";
	
	/* create canvas + context */
	var canvas = OZ.DOM.elm("canvas");
	container.appendChild(canvas);
	this._dom.canvas = canvas;
	this._ctx = canvas.getContext("2d");
	this._ctx.fillStyle = "black";
	
	/* create testing char to measure its dimensions */
	var tmp = OZ.DOM.elm("span", {font:this._font});
	tmp.innerHTML = "x";
	this._dom.container.appendChild(tmp);
	this._charWidth = tmp.offsetWidth;
	this._charHeight = tmp.offsetHeight;
	tmp.parentNode.removeChild(tmp);
}

RPG.UI.CanvasMap.prototype.resize = function(size) {
	this._focus = null;
	var w = size.x * this._charWidth;
	var h = size.y * this._charHeight;
	this._dom.canvas.width = w;
	this._dom.canvas.height = h;
	this._dom.container.style.width = w+"px";
	this._dom.container.style.height = h+"px";
	this._ctx.clearRect(0, 0, w, h);
	this._ctx.font = this._font;
	this._ctx.textBaseline = "bottom";
}

RPG.UI.CanvasMap.prototype.addProjectile = function(coords, projectile) {
	this._projectiles.push(coords.clone());
	this._redrawCoords(coords, projectile.getVisual());
}

RPG.UI.CanvasMap.prototype.removeProjectiles = function() {
	for (var i=0;i<this._projectiles.length;i++) {
		var coords = this._projectiles[i];
		this._redrawCoords(coords);
	}
	this._projectiles = [];
}

RPG.UI.CanvasMap.prototype.setFocus = function(coords) {
	if (this._focus) { this._redrawCoords(this._focus); }
	this._focus = coords.clone();
	
	var x = coords.x * this._charWidth;
	var y = (coords.y+1) * this._charHeight - 1;
	this._ctx.strokeStyle = "white";
	this._ctx.beginPath();
	this._ctx.moveTo(x, y);
	this._ctx.lineTo(x+this._charWidth-1, y);
	this._ctx.closePath();
	this._ctx.stroke();
}

RPG.UI.CanvasMap.prototype._redrawCoords = function(coords, what) {
	var x = coords.x * this._charWidth;
	var y = coords.y * this._charHeight;
	this._ctx.clearRect(x, y, this._charWidth, this._charHeight);
	
	var todo = what;
	if (!todo) {
		var memory = RPG.Game.getMap().getMemory(coords);
		if (memory) {
			if (memory.state == RPG.MAP_REMEMBERED) { this._ctx.globalAlpha = 0.5; }
			if (memory.data.length) { todo = memory.data[memory.data.length-1]; }
		}
	}
	
	if (todo) {
		var ch = todo.ch;
		var color = todo.color;
		this._ctx.fillStyle = color;
		this._ctx.fillText(ch, x, y + this._charHeight);
		this._ctx.globalAlpha = 1;
	}
}
