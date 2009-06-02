RPG.Visual.BaseMap = OZ.Class();
RPG.Visual.BaseMap.prototype.init = function(container) {
	this.dom = {
		container: container
	}
	this._event = null;
	this._actor = null;
	this._world = null;
	this._data = null;
}
RPG.Visual.BaseMap.prototype.setWorld = function(world) {
	this._world = world;
	if (this._event) { OZ.Event.remove(this._event); }
	this._event = OZ.Event.add(world, "action", this.bind(this._action));
	this._rebuild();
	this._redraw();
}
RPG.Visual.BaseMap.prototype.setActor = function(actor) {
	this._actor = actor;
}
RPG.Visual.BaseMap.prototype._rebuild = function() {
	OZ.DOM.clear(this.dom.container);
	var size = this._world.info(this._actor, RPG.INFO_SIZE);
	this._resize(size);
}
RPG.Visual.BaseMap.prototype._redraw = function() {
	var size = this._world.info(this._actor, RPG.INFO_SIZE);
	for (var j=0;j<size.y;j++) {
		for (var i=0;i<size.x;i++) {
			var c = new RPG.Misc.Coords(i, j);
			this._redrawCoords(c);
		}
	}
}
RPG.Visual.BaseMap.prototype._action = function(e) {
	this._redraw();
}
RPG.Visual.BaseMap.prototype._redrawCoords = function(coords) {
}

RPG.Visual.ImageMap = OZ.Class().extend(RPG.Visual.BaseMap);
RPG.Visual.ImageMap.prototype.init = function(container, options) {
	this.parent(container);
	this.dom.container.style.position = "relative";
	this.options = {
		tileSize: new RPG.Misc.Coords(32, 32)
	}
	for (var p in options) { this.options[p] = options[p]; }
}
RPG.Visual.ImageMap.prototype._resize = function(size) {
	this.dom.container.style.width = (this.options.tileSize.x * size.x) + "px";
	this.dom.container.style.height = (this.options.tileSize.y * size.y) + "px";
}
RPG.Visual.ImageMap.prototype._rebuild = function() {
	this.parent();
	var size = this._world.info(this._actor, RPG.INFO_SIZE);
	this._data = new Array(size.x);
	var ts = this.options.tileSize;
	
	for (var i=0;i<size.x;i++) {
		this._data[i] = new Array(size.y);
		for (var j=0;j<size.y;j++) {
			var pair = [];
			for (var k=0;k<2;k++) {
				var x = i * ts.x;
				var y = j * ts.y;
				var node = OZ.DOM.elm("img", {position:"absolute", left:x+"px", top:y+"px", width:ts.x+"px", height:ts.y+"px"});
				this.dom.container.appendChild(node);
				pair.push(node);
			}
			this._data[i][j] = pair;
		}
	}
}
RPG.Visual.ImageMap.prototype._show = function(img) {
	img.style.visibility = "visible";
}
RPG.Visual.ImageMap.prototype._hide = function(img) {
	img.style.visibility = "hidden";
}
RPG.Visual.ImageMap.prototype._redrawCoords = function(coords) {
	var cell = this._world.info(this._actor, RPG.INFO_CELL, coords);
	var pair = this._data[coords.x][coords.y];
	
	if (cell) {
		this._show(pair[0]);
	} else {
		this._hide(pair[0]);
		this._hide(pair[1]);
		return;
	}
	
	this._cell(coords, cell);
}
RPG.Visual.ImageMap.prototype._cell = function(coords, cell) {	
	var pair = this._data[coords.x][coords.y];
	var bg = pair[0];
	var fg = pair[1];

	this._tile(bg, cell.getImage(this._actor), cell.describe(this._actor));

	var b = cell.getBeing();
	if (b) { 
		this._show(fg);
		this._tile(fg, b.getImage(this._actor), b.describe(this._actor));
		return;
	}

	var items = cell.getItems();
	if (items.length) {
		var item = items[items.length-1];
		this._show(fg);
		this._tile(fg, item.getImage(this._actor), item.describe(this._actor));
		return;
	}
	
	this._hide(fg);
}
RPG.Visual.ImageMap.prototype._tile = function(node, src, text) {
	node.src = "img/"+src+".png";
	node.alt = text;
	node.title = text;
}

RPG.Visual.ASCIIMap = OZ.Class().extend(RPG.Visual.BaseMap);
RPG.Visual.ASCIIMap.prototype.init = function(container) {
	this.parent(container);
	this._computeWidth();
}
RPG.Visual.ASCIIMap.prototype._computeWidth = function() {
	var tmp = OZ.DOM.elm("span");
	tmp.innerHTML = "x";
	this.dom.container.appendChild(tmp);
	this._charWidth = tmp.offsetWidth;
	OZ.DOM.clear(this.dom.container);
}
RPG.Visual.ASCIIMap.prototype._resize = function(size) {
	this._size = size;
	this.dom.container.style.width = (this._charWidth * size.x) + "px";
}
RPG.Visual.ASCIIMap.prototype._rebuild = function() {
	this.parent();
	var size = this._world.info(this._actor, RPG.INFO_SIZE);
	this._data = new Array(size.x);
	
	for (var j=0;j<size.y;j++) {
		for (var i=0;i<size.x;i++) {
			if (!j) { this._data[i] = new Array(size.y); }
			var node = OZ.DOM.elm("span");
			this.dom.container.appendChild(node);
			this._data[i][j] = node;
			if (i + 1 == size.x) {
				this.dom.container.appendChild(OZ.DOM.elm("br"));
			}
		}
	}
}
RPG.Visual.ASCIIMap.prototype._redrawCoords = function(coords) {
	var cell = this._world.info(this._actor, RPG.INFO_CELL, coords);
	var span = this._data[coords.x][coords.y];
	
	if (cell) {
		span.style.visibility = "visible";
	} else {
		span.style.visibility = "hidden";
		return;
	}
	

	/* background */
	var cellvis = cell.getChar(this._actor);
	span.style.backgroundColor = cellvis.getBackground();

	/* is there a being? */
	var b = cell.getBeing();
	if (b) {
		var beingvis = b.getChar(this._actor);
		span.innerHTML = beingvis.getChar();
		span.style.color = beingvis.getColor();
		return span;
	}
	
	/* is there an item? */
	var items = cell.getItems();
	if (items.length) {
		var item = items[items.length-1];
		var itemvis = item.getChar(this._actor);
		span.innerHTML = itemvis.getChar();
		span.style.color = itemvis.getColor();
		return span;
	}
	
	/* does the cell has a representation? */
	span.innerHTML = cellvis.getChar();
	span.style.color = cellvis.getColor();
}

RPG.Visual.TextBuffer = OZ.Class();
RPG.Visual.TextBuffer.prototype.init = function(textarea) {
	this._world = null;
	this._actor = null;
	this._event = null;
	this.dom = {
		textarea: textarea
	}
	this.dom.textarea.value = "";
}
RPG.Visual.TextBuffer.prototype.setWorld = function(world) {
	this._world = world;
	if (this._event) { OZ.Event.remove(this._event); }
	this._event = OZ.Event.add(world, "action", this.bind(this._action));
}
RPG.Visual.TextBuffer.prototype.setActor = function(actor) {
	this._actor = actor;
}
RPG.Visual.TextBuffer.prototype._action = function(e) {
	var action = this._world.info(this._actor, RPG.INFO_ACTION);
	var description = action.describe(this._actor);
	description += " ";

	var source = action.getSource();
	if (this._actor && this._actor != source) {
		this.dom.textarea.value += description;
	} else {
		this.dom.textarea.value = description;
	}
}
