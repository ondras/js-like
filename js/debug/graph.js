var Graph = {
	result:"",
	cache:[],
	
	go:function(root, name) {
		this.items = [];
		this.result = "";
		this.list(root, name);
		this.cache.sort(function(a, b){
			return a.name < b.name ? 1 : -1;
		});
		
		this.result += "digraph G { label=\"RPG\" \n";
		this.buildNodes();
		this.buildEdges();
		this.result += "}\n";
	},
	
	list:function(node, name) {
		if (!(node instanceof Object)) { return; }
		if (node.parentNode) { return; } /* dom node */
		if (node.parent) { return; } /* instance! */
		if (this.cached(node)) { return; } /* already have */
		
		if (node.extend) {
			var obj = {
				node:node,
				name:name
			}
			this.cache.push(obj);
		}
		
		var forbidden = ["prototype","_implement","_extend","bind"];
		for (var p in node) {
			if (forbidden.indexOf(p) != -1) { continue; }
			var n = (name ? name+"." : "")+p;
			Graph.list(node[p], n);
		}
	},
	
	cached:function(node) {
		for (var i=0;i<this.cache.length;i++) {
			var item = this.cache[i];
			if (node == item.node) { return item.name; }
		}
		return null;
	},
	
	buildNodes:function() {
		var cluster = null;
		for (var i=0;i<this.cache.length;i++) {
			var item = this.cache[i];
			var c = item.name.split(".")[0];
			if (c != cluster) {
				if (cluster) { this.result += " } \n"; }
				cluster = c;
				this.result += " subgraph cluster_"+c+" { label=\""+c+"\" \n"; 
			}
			this.result += '"'+item.name+'"\n';
		}
		if (cluster) { this.result += " } \n"; }
	},
	
	buildEdges:function() {
		for (var i=0;i<this.cache.length;i++) {
			var item = this.cache[i];
			var node = item.node;
			if (node._extend) {
				var name = this.cached(node._extend);
				if (!name) { throw new Error("wtf."); }
				this.result += '"'+name + '" -> "' + item.name+'" [constraint=true, color=blue]\n';
			}
			for (var j=0;j<node._implement.length;j++) {
				var name = this.cached(node._implement[j]);
				if (!name) { throw new Error("wtf."); }
				this.result += '"'+name + '" -> "' + item.name+'" [constraint=true, color=red, style=dotted]\n';
			}
		}
	}
}

Graph.go(RPG, "");
