RPG.LZW = OZ.Class();

RPG.LZW.test = function() {
	var lzw = new this();
	var data = test2();

	console.profile("encode");
	var arr = lzw.encode(data);
	console.profileEnd("encode");

	console.log("Encoded to "+arr.length+" bytes");

	console.profile("decode");
	lzw.decode(arr);
	console.profileEnd("decode");
}

/**
 * @param {string} string with all codes <256
 */
RPG.LZW.prototype.encode = function(data) {
	if (!data.length) { return []; }
	if (data.charCodeAt(0) > 255) { throw new Error("Code @ 0 > 255"); }
	
	var output = new this.constructor.Stream();
	output.setBitsPerCode(8);
	
	var dict = {};
	var code = 256;
	var codeLimit = code;
	
	var phrase = data.charAt(0);
	
	for (var i=1; i<data.length; i++) {
		var ch = data[i];
		var c = ch.charCodeAt(0);
		if (c > 255) { throw new Error("Code @ "+i+" > 255"); }
		
		if (phrase+ch in dict) { /* we already know this */
			phrase += ch;
			continue;
		}
		
		output.addCode(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
		dict[phrase+ch] = code;
		
		if (code == codeLimit) {
			codeLimit *= 2;
			output.setBitsPerCode(output.getBitsPerCode() + 1);
		}
		
		code++;
		phrase = ch;
	}
	
	output.addCode(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
	
	return output.getData();
}

/**
 * @param {number[]} array of numbers
 */
RPG.LZW.prototype.decode = function(data) {
	if (!data.length) { return ""; }
	var dict = {};
	var code = 256;
	var codeLimit = code;

	var input = new this.constructor.Stream(data);
	input.setBitsPerCode(8);

	var currChar = String.fromCharCode(input.getCode());
//	input.setBitsPerCode(9);
	var oldPhrase = currChar;
	var out = [currChar];
	
	
	var phrase;
	var currCode;

	while (1) {
		if (code == codeLimit) {
			codeLimit *= 2;
			input.setBitsPerCode(input.getBitsPerCode() + 1);
		}

		currCode = input.getCode();
		if (currCode === null) { break; }
		if (currCode < 256) {
			phrase = String.fromCharCode(currCode);
		} else {
			phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
		}
		out.push(phrase);
		currChar = phrase.charAt(0);
		dict[code] = oldPhrase + currChar;
		
		
		code++;
		oldPhrase = phrase;
	}

	return out.join("");
}

RPG.LZW.Stream = OZ.Class();

RPG.LZW.Stream.prototype.init = function(data) {
	this._data = data || [];
	this._bpc = 8;
	this._bits = 0;
	this._tmp = 0;
	this._tmpIndex = 0;
}

/**
 * Add given code to stream using defined amount of bits.
 * The code *must* be representable in these bits.
 */
RPG.LZW.Stream.prototype.addCode = function(code) {
	var bit;
	
	for (var i=0;i<this._bpc;i++) {
		bit = code & (1 << i);
		if (bit) {
			this._tmp |= (1 << this._tmpIndex);
		} else {
			this._tmp &= ~(1 << this._tmpIndex);
		}
		
		this._tmpIndex = (this._tmpIndex+1) % 8; /* increase temporary index */
		if (!this._tmpIndex) { /* 8 bits done, add to output */
			this._data.push(this._tmp);
		}
	}
	
	this._bits += this._bpc;
}

RPG.LZW.Stream.prototype.getBitsPerCode = function() {
	return this._bpc;
}

RPG.LZW.Stream.prototype.setBitsPerCode = function(bpc) {
	this._bpc = bpc;
	console.log("BPC: "+bpc);
	return this;
}

RPG.LZW.Stream.prototype.getData = function() {
	if (this._tmpIndex) {
		this._data.push(this._tmp);
		this._tmpIndex = 0;
	}
	
	return this._data;
}

RPG.LZW.Stream.prototype.getBits = function() {
	return this._bits;
}

/**
 * Retrieve a code by reading defined amount of bits.
 * If there are not enough bits remaining, returns null.
 **/
RPG.LZW.Stream.prototype.getCode = function() {
	var byteIndex;
	var bitIndex;
	var bit;
	
	for (var i=0;i<this._bpc;i++) {
		byteIndex = Math.floor(this._tmpIndex/8);
		if (byteIndex >= this._data.length) { return null; } /* not enough! */
		
		bitIndex = this._tmpIndex - 8*byteIndex;
		bit = this._data[byteIndex] & (1 << bitIndex);
		
		if (bit) {
			this._tmp |= (1 << i);
		} else {
			this._tmp &= ~(1 << i);
		}
		
		this._tmpIndex++;
	}
	return this._tmp;
}
