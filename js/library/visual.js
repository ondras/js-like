/**
 * @class Basic map
 */
RPG.Visual.BaseMap = OZ.Class();
RPG.Visual.BaseMap.prototype.init = function(container) {
	this.dom = {
		container: container
	}
	this._event = null;
	this._being = null;
	this._data = null;
	this._size = null;
	
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
}
RPG.Visual.BaseMap.prototype._redraw = function() {
	var c = new RPG.Misc.Coords(0, 0);
	for (var j=0;j<this._size.y;j++) {
		for (var i=0;i<this._size.x;i++) {
			c.x = i;
			c.y = j;
			this._redrawCoords(c);
		}
	}
}
RPG.Visual.BaseMap.prototype._action = function(e) {
	this._redraw();
}
RPG.Visual.BaseMap.prototype._redrawCoords = function(coords) {
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

	var map = RPG.getWorld().getMap();
	if (map) { this._map(map); }
}
RPG.Visual.ImageMap.prototype._resize = function() {
	this.dom.container.style.width = (this.options.tileSize.x * this._size.x) + "px";
	this.dom.container.style.height = (this.options.tileSize.y * this._size.y) + "px";
}
RPG.Visual.ImageMap.prototype._rebuild = function() {
	this.parent();
	this._data = new Array(this._size.x);
	var ts = this.options.tileSize;
	
	for (var i=0;i<this._size.x;i++) {
		this._data[i] = new Array(this._size.y);
		for (var j=0;j<this._size.y;j++) {
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
	var pair = this._data[coords.x][coords.y];
	if (!this._being.canSee(coords)) {
		this._hide(pair[0]);
		this._hide(pair[1]);
		return;
	}

	this._show(pair[0]);
	var cell = this._being.cellInfo(coords);
	this._cell(coords, cell);
}
RPG.Visual.ImageMap.prototype._cell = function(coords, cell) {	
	var pair = this._data[coords.x][coords.y];
	var bg = pair[0];
	var fg = pair[1];

	this._tile(bg, cell.getImage(this._being), cell.describeA(this._being));

	var b = cell.getBeing();
	if (b) { 
		this._show(fg);
		this._tile(fg, b.getImage(this._being), b.describeA(this._being));
		return;
	}

	var items = cell.getItems();
	if (items.length) {
		var item = items[items.length-1];
		this._show(fg);
		this._tile(fg, item.getImage(this._being), item.describeA(this._being));
		return;
	}
	
	this._hide(fg);
}
RPG.Visual.ImageMap.prototype._tile = function(node, src, text) {
	node.src = "img/"+src+".png";
	node.alt = text;
	node.title = text;
}

/**
 * @class Classic ASCII map
 * @augments RPG.Visual.BaseMap
 */
RPG.Visual.ASCIIMap = OZ.Class().extend(RPG.Visual.BaseMap);
RPG.Visual.ASCIIMap.prototype.init = function(container) {
	this.parent(container);
	this._computeWidth();

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
RPG.Visual.ASCIIMap.prototype._rebuild = function() {
	this.parent();
	this._data = new Array(this._size.x);
	
	for (var j=0;j<this._size.y;j++) {
		for (var i=0;i<this._size.x;i++) {
			if (!j) { this._data[i] = new Array(this._size.y); }
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
	var span = this._data[coords.x][coords.y];
	if (!this._being.canSee(coords)) {
		span.innerHTML = "&nbsp;"
		return;
	}

	var cell = this._being.cellInfo(coords);

	/* background */
	var cellvis = cell.getChar(this._being);
	span.style.backgroundColor = cellvis.getBackground();

	/* is there a being? */
	var b = cell.getBeing();
	if (b) {
		var beingvis = b.getChar(this._being);
		span.innerHTML = beingvis.getChar();
		span.style.color = beingvis.getColor();
		return span;
	}
	
	/* is there an item? */
	var items = cell.getItems();
	if (items.length) {
		var item = items[items.length-1];
		var itemvis = item.getChar(this._being);
		span.innerHTML = itemvis.getChar();
		span.style.color = itemvis.getColor();
		return span;
	}
	
	/* does the cell has a representation? */
	span.innerHTML = cellvis.getChar();
	span.style.color = cellvis.getColor();
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
