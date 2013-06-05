/**
 * @class Basic map visualizator
 */
RPG.UI.BaseMap = OZ.Class();

RPG.UI.BaseMap.prototype.init = function(container) {
	this._ec = [];
	this._size = null;
	this._focus = null;
	this._projectiles = {};

	this._dom = {
		container: null
	}

	this._ec.push(OZ.Event.add(window, "resize", this.syncSize.bind(this)));
}

RPG.UI.BaseMap.prototype.destroy = function() {
	this._dom.container.parentNode.removeChild(this._dom.container);
	while (this._ec.length) { OZ.Event.remove(this._ec.pop()); }
}

RPG.UI.BaseMap.prototype.resize = function(size) {
	this._focus = null;
	this._size = size.clone();
	this.syncSize();
}

/**
 * Synchronize physical size with available area
 */
RPG.UI.BaseMap.prototype.syncSize = function() {
}

RPG.UI.BaseMap.prototype._getAvailableSize = function() {
	var win = OZ.DOM.win();
	win[1] -= OZ.$("buffer").offsetHeight;
	win[1] -= OZ.$("commands").offsetHeight;
	win[1] -= OZ.$("status").offsetHeight;
	return win;
}

/**
 * Measure what maximum font size is available
 */
RPG.UI.BaseMap.prototype._getAvailableCharSize = function() {
	var avail = this._getAvailableSize();
	
	var span = OZ.DOM.elm("span", {innerHTML:"x"});
	this._dom.container.parentNode.appendChild(span);
	
	var size = 1;
	while (1) {
		span.style.fontSize = size + "px";
		var charWidth = span.offsetWidth;
		var charHeight = span.offsetHeight;
		var width = charWidth * this._size.x;
		var height = charHeight * this._size.y;
		
		if (width > avail[0] || height > avail[1]) {
			span.style.fontSize = (size-1) + "px";
			var result = [size-1, span.offsetWidth, span.offsetHeight];
			span.parentNode.removeChild(span);
			return result;
		}
		
		size++;
	}
}

/**
 * Main drawing routine
 * @param {RPG.Coords} coords
 * @param {RPG.Visual[]} visuals
 * @param {bool} memorized Memorized area?
 */
RPG.UI.BaseMap.prototype.drawAtCoords = function(coords, visuals, memorized) {
}

RPG.UI.BaseMap.prototype.setFocus = function(coords) {
	this._focus = coords.clone();
}

/**
 * Draw a projectile at a given coords
 * @param {RPG.Coords}
 * @param {RPG.Visual.IVisual}
 */
RPG.UI.BaseMap.prototype.addProjectile = function(coords, projectile) {
}

/**
 * Remove all drawn projectiles
 */
RPG.UI.BaseMap.prototype.removeProjectiles = function() {
}

/**
 * @class Image map
 * @augments RPG.UI.BaseMap
 */
RPG.UI.ImageMap = OZ.Class().extend(RPG.UI.BaseMap);

RPG.UI.ImageMap.prototype.blank = OZ.DOM.elm("img", {src:"img/empty.gif", position:"absolute", left:"0px", top:"0px"});

RPG.UI.ImageMap.prototype.init = function(container) {
	this.parent(container);

	this._dom.container = OZ.DOM.elm("div", {"class":"tile", position:"relative", overflow:"hidden"});
	this._dom.content = OZ.DOM.elm("div");
	this._dom.focus = OZ.DOM.elm("div", {className:"focus"});

	this._nodes = [];
	this._tileSize = new RPG.Coords(32, 32);
	container.appendChild(this._dom.container);
	this._dom.container.appendChild(this._dom.content);
}

RPG.UI.ImageMap.prototype.resize = function(size) {
	OZ.DOM.clear(this._dom.content);
	this._nodes = [];
	
	/* fill with divs */
	var count = size.x * size.y;
	for (var i=0;i<count;i++) {
		var node = OZ.DOM.elm("div", {width:this._tileSize.x+"px", height:this._tileSize.y+"px"});
		this._nodes.push(node);
		this._dom.content.appendChild(node);
	}
	
	this.parent(size);
}

RPG.UI.ImageMap.prototype.syncSize = function() {
	var avail = this._getAvailableSize();
	var size = [this._tileSize.x * this._size.x, this._tileSize.y * this._size.y];
	this._dom.content.style.width = size[0] + "px";
	this._dom.container.style.height = avail[1] + "px";
	this._center();
}

RPG.UI.ImageMap.prototype.drawAtCoords = function(coords, visuals, memorized) {
	var index = this._coordsToIndex(coords);
	var node = this._nodes[index];
	node.style.opacity = (memorized ? 0.5 : 1);

	var children = Math.min(2, visuals.length);
	while (node.childNodes.length > children) { node.removeChild(node.lastChild); }
	while (node.childNodes.length < children) { node.appendChild(this.blank.cloneNode(false)); }
	
	for (var i=0;i<children;i++) {
		var visual = visuals[i];
		var url = "img/" + visual.image + ".png";
		var img = node.childNodes[i];
		if (img.src.indexOf(url) == -1) { img.src = url; }
		img.title = visual.desc;
	}

}

RPG.UI.ImageMap.prototype.setFocus = function(coords) {
	this.parent(coords);
	var index = this._coordsToIndex(coords);
	var node = this._nodes[index];
	node.appendChild(this._dom.focus);
	this._center();
}

RPG.UI.ImageMap.prototype.addProjectile = function(coords, projectile) {
	var index = this._coordsToIndex(coords);
	var node = this._nodes[index];

	var id = coords.x+","+coords.y;
	
	var newImage = this.blank.cloneNode(false);
	var oldImage = node.lastChild; /* false: empty; true: non-empty or focus */
	if (oldImage == this._dom.focus) { oldImage = oldImage.previousSibling; } /* false: empty; true: non-empty */
	if (!oldImage.previousSibling) { oldImage = false; } /* true only when two images are present */

	if (oldImage) { 
		node.replaceChild(newImage, oldImage);
	} else {
		node.appendChild(newImage); 
	}
	
	if (id in this._projectiles) { 
		this._projectiles[id][1] = newImage;
	} else {
		this._projectiles[id] = [oldImage, newImage];
	}
	
	var visual = RPG.Visual.getVisual(projectile);
	var url = "img/" + visual.image + ".png";
	newImage.src = url;
	newImage.title = visual.desc;
}

RPG.UI.ImageMap.prototype.removeProjectiles = function() {
	for (var id in this._projectiles) {
		var coords = RPG.Coords.fromString(id);
		var index = this._coordsToIndex(coords);
		var node = this._nodes[index];
		var oldImage = this._projectiles[id][0];
		var newImage = this._projectiles[id][1];
		
		if (oldImage) {
			node.replaceChild(oldImage, newImage);
		} else {
			node.removeChild(newImage);
		}
	}
	this._projectiles = {};
}

/**
 * Sync position in order to maintain focus centered
 */
RPG.UI.ImageMap.prototype._center = function() {
	if (!this._focus) { return; }
	var avail = this._getAvailableSize();
	var size = [this._tileSize.x * this._size.x, this._tileSize.y * this._size.y];

	var props = ["left", "top"];
	var coordsProps = ["x", "y"];
	for (var i=0;i<props.length;i++) {
		var prop = props[i];
		
		if (size[i] <= avail[i]) { /* enough to fit, center */
			this._dom.content.style[prop] = Math.round((avail[i]-size[i])/2) + "px";
		} else {
			var coordsProp = coordsProps[i];
			var focusPosition = this._tileSize[coordsProp] * (this._focus[coordsProp] + 0.5);
			var val = avail[i]/2 - focusPosition;
			val = Math.min(val, 0);
			val = Math.max(val, avail[i]-size[i]);
			this._dom.content.style[prop] = Math.round(val) + "px";
		}
		
		
	}
}

RPG.UI.ImageMap.prototype._coordsToIndex = function(coords) {
	return coords.y * this._size.x + coords.x;
}

/**
 * @class Classic ASCII map
 * @augments RPG.UI.BaseMap
 */
RPG.UI.ASCIIMap = OZ.Class().extend(RPG.UI.BaseMap);

RPG.UI.ASCIIMap.prototype.entities = {
	"<": "&lt;",
	">": "&gt;",
	"&": "&amp;"
}

RPG.UI.ASCIIMap.prototype.init = function(container) {
	this.parent(container);
	this._dom.container = OZ.DOM.elm("div", {"class":"ascii", position:"relative"});
	this._nodes = [];
	container.appendChild(this._dom.container);
}

RPG.UI.ASCIIMap.prototype.resize = function(size) {
	OZ.DOM.clear(this._dom.container);
	this._nodes = [];
	
	/* fill with spans */
	var count = size.x * size.y;
	for (var i=0;i<count;i++) {
		if (i && !(i % size.x)) { this._dom.container.appendChild(OZ.DOM.elm("br")); }

		var span = OZ.DOM.elm("span", {innerHTML:"&nbsp;", color:"white"});
		this._nodes.push(span);
		this._dom.container.appendChild(span);
	}
	
	
	this.parent(size);
}

RPG.UI.ASCIIMap.prototype.syncSize = function() {
	var avail = this._getAvailableSize();
	var charSize = this._getAvailableCharSize();
	this._dom.container.style.fontSize = charSize[0] + "px";
	this._dom.container.style.lineHeight = charSize[2] + "px";
	var w = charSize[1] * this._size.x;
	var h = charSize[2] * this._size.y;
	this._dom.container.style.width = w + "px";

	/* adjust container position */
	this._dom.container.style.marginLeft = Math.round((avail[0]-w)/2) + "px";
	this._dom.container.style.marginTop = Math.floor((avail[1]-h)/2) + "px";
	this._dom.container.style.marginBottom = Math.ceil((avail[1]-h)/2) + "px";
}

RPG.UI.ASCIIMap.prototype.drawAtCoords = function(coords, visuals, memorized) {
	var index = this._coordsToIndex(coords);
	var span = this._nodes[index];

	span.style.opacity = (memorized ? 0.5 : 1);
	
	var item = (visuals.length ? visuals[visuals.length-1] : null);
	if (!item) { /* empty */
		span.innerHTML = "&nbsp;";
		span.style.color = "white"; /* to visualize focus */
		return;
	}

	var ch = item.ch;
	if (ch in this.entities) { ch = this.entities[ch]; }
	var color = item.color;
	var title = item.desc;
	
	span.title = title;
	span.innerHTML = ch;
	span.style.color = color;
}

RPG.UI.ASCIIMap.prototype.setFocus = function(coords) {
	if (this._focus) { 
		var index = this._coordsToIndex(this._focus);
		OZ.DOM.removeClass(this._nodes[index], "focus");
	}
	
	this.parent(coords);

	var index = this._coordsToIndex(this._focus);
	OZ.DOM.addClass(this._nodes[index], "focus");
}

RPG.UI.ASCIIMap.prototype.addProjectile = function(coords, projectile) {
	var index = this._coordsToIndex(coords);
	var span = this._nodes[index];

	var id = coords.x+","+coords.y;
	
	if (!(id in this._projectiles)) { 
		this._projectiles[id] = [span.innerHTML, span.style.color];
	}
	
	var visual = RPG.Visual.getVisual(projectile);
	span.innerHTML = visual.ch;
	span.style.color = visual.color;
}

RPG.UI.ASCIIMap.prototype.removeProjectiles = function() {
	for (var id in this._projectiles) {
		var coords = RPG.Coords.fromString(id);
		var index = this._coordsToIndex(coords);
		var span = this._nodes[index];
		
		var vis = this._projectiles[id];
		span.innerHTML = vis[0];
		span.style.color = vis[1];
	}
	this._projectiles = {};
}

RPG.UI.ASCIIMap.prototype._coordsToIndex = function(coords) {
	return coords.y * this._size.x + coords.x;
}

/**
 * @class Canvas-based map
 * @augments RPG.UI.BaseMap
 */
RPG.UI.CanvasMap = OZ.Class().extend(RPG.UI.BaseMap);
RPG.UI.CanvasMap.prototype.init = function(container) {
	this.parent(container);
	
	this._char = {
		width: 0,
		height: 0
	}

	this._fontSize = 0;
	this._cache = {};
	
	/* create canvas + context */
	this._dom.container = OZ.DOM.elm("canvas");
	container.appendChild(this._dom.container);
	this._ctx = this._dom.container.getContext("2d");
}

RPG.UI.CanvasMap.prototype.resize = function(size) {
	this._cache = {};
	this.parent(size);
}

RPG.UI.CanvasMap.prototype.syncSize = function() {
	var avail = this._getAvailableSize();
	var charSize = this._getAvailableCharSize();
	var size = charSize[0];
	this._char.width = charSize[1];
	this._char.height = charSize[2];
	
	/* adjust canvas size */
	var w = this._size.x * this._char.width;
	var h = this._size.y * this._char.height;
	this._dom.container.width = w;
	this._dom.container.height = h;
	this._ctx.fillStyle = "black";
	this._ctx.fillRect(0, 0, w, h);
	this._ctx.font = size + "px " + RPG.UI.font;
	this._ctx.textBaseline = "bottom";
	this._ctx.lineCap = "butt";
	
	/* adjust canvas position */
	this._dom.container.style.marginLeft = Math.round((avail[0]-w)/2) + "px";
	this._dom.container.style.marginTop = Math.floor((avail[1]-h)/2) + "px";
	this._dom.container.style.marginBottom = Math.ceil((avail[1]-h)/2) + "px";

	/* draw from cache */
	for (var id in this._cache) { this._drawCache(RPG.Coords.fromString(id)); }
	if (this._focus) { this.setFocus(this._focus); } /* redraw focus */
}

RPG.UI.CanvasMap.prototype.addProjectile = function(coords, projectile) {
	var visual = RPG.Visual.getVisual(projectile);
	this._projectiles[coords.x+","+coords.y] = [visual.ch, visual.color, 1];
	this._drawCache(coords);
}

RPG.UI.CanvasMap.prototype.removeProjectiles = function() {
	var allCoords = [];
	for (var hash in this._projectiles) {
		var coords = RPG.Coords.fromString(hash);
		allCoords.push(coords);
	}
	this._projectiles = {};
	
	while (allCoords.length) { this._drawCache(allCoords.pop()); }
}

RPG.UI.CanvasMap.prototype.setFocus = function(coords) {
	if (this._focus) { this._drawCache(this._focus); }
	this._focus = coords.clone();
	
	var thickness = this._char.height / 10;
	var x = coords.x * this._char.width;
	var y = (coords.y+1) * this._char.height - thickness;
	this._ctx.lineWidth = thickness;
	this._ctx.strokeStyle = "#ccc";
	this._ctx.globalAlpha = 1;
	this._ctx.beginPath();
	this._ctx.moveTo(x, y);
	this._ctx.lineTo(x+this._char.width, y);
	this._ctx.stroke();
}

RPG.UI.CanvasMap.prototype.drawAtCoords = function(coords, visuals, memorized) {
	var hash = coords.x+","+coords.y;
	if (!visuals.length) {
		delete this._cache[hash];
	} else {
		var visual = visuals[visuals.length-1];
		this._cache[coords.x+","+coords.y] = [visual.ch, visual.color, memorized ? 0.5 : 1];
	}
	this._drawCache(coords);
}

RPG.UI.CanvasMap.prototype._drawCache = function(coords) {
	var x = coords.x * this._char.width;
	var y = coords.y * this._char.height;
	this._ctx.globalAlpha = 1;
	this._ctx.fillStyle = "black";
	this._ctx.fillRect(x, y, this._char.width, this._char.height);
	
	var hash = coords.x + "," + coords.y;
	if (hash in this._projectiles) {
		var what = this._projectiles[hash];
	} else if (hash in this._cache) {
		var what = this._cache[hash];
	} else {
		return;
	}

	this._ctx.globalAlpha = what[2];
	this._ctx.fillStyle = what[1];
	this._ctx.fillText(what[0], x, y + this._char.height);
}
