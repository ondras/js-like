RPG.LZW = OZ.Class();

RPG.LZW.test = function(data) {
	var lzw = new this();
/*
	console.profile("serialize");
	var data = test2();
	console.profileEnd("serialize");
*/
	console.profile("encode");
	var arr = lzw.encode(data, true);
	console.profileEnd("encode");

	console.profile("decode");
	var result = lzw.decode(arr);
	console.profileEnd("decode");
	return result;
}

RPG.LZW.prototype.init = function() {
	this._maxBits = 16;
}

/**
 * @param {string} string with all codes <256
 */
RPG.LZW.prototype.encode = function(data, stats) {
	if (!data.length) { return []; }
	if (data.charCodeAt(0) > 255) { throw new Error("Code @ 0 > 255"); }
	
	var bpc = 8;
	var codes = 1;
	var output = new this.constructor.Stream();
	output.setBitsPerCode(bpc);
	
	var dict = {};
	var code = (1 << bpc)-1;
	var codeLimit = 1 << bpc;
	
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
		codes++;
		
		code++;
		if (code == codeLimit) {
			codeLimit *= 2;
			bpc++;
			if (bpc <= this._maxBits) { output.setBitsPerCode(bpc); }
		}

		if (bpc <= this._maxBits) { dict[phrase+ch] = code; }
		phrase = ch;
	}
	
	output.addCode(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
	
	var result = output.getData();
	
	if (stats) {
		var inb = data.length;
		var outb = result.length;
		var ratio = (100*outb/inb).round(2);
		
		console.log("LZW encoding stats");
		console.log("==================");
		console.log("Input:  " + inb + " chars");
		console.log("Output: " + outb + " bytes");
		console.log("Ratio: " + ratio + "%");
		console.log("Codes: " + codes + " (" + (2*codes) + " bytes)");
	}
	
	return result;
}

/**
 * @param {number[]} array of numbers
 */
RPG.LZW.prototype.decode = function(data) {
	if (!data.length) { return ""; }
	var dict = {};
	var bpc = 8;
	var code = 1 << bpc;
	var codeLimit = code;

	var input = new this.constructor.Stream(data);
	input.setBitsPerCode(bpc);

	var currChar = String.fromCharCode(input.getCode());
	var oldPhrase = currChar;
	var out = [currChar];
	
	var phrase;
	var currCode;

	while (1) {
		if (code == codeLimit) {
			codeLimit *= 2;
			bpc++;
			if (bpc <= this._maxBits) { input.setBitsPerCode(bpc); }
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
		
		if (bpc <= this._maxBits) { 
			dict[code] = oldPhrase + currChar; 
			code++;
		}
	
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
	this._codes = 0;
}

/**
 * Add given code to stream using defined amount of bits.
 * The code *must* be representable in these bits.
 */
RPG.LZW.Stream.prototype.addCode = function(code) {
//	this._data.push(code); return;

	var bit;
	this._codes++;
	
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
//	return this._data.shift() || null;

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

function bwt(s) 
{
	if (s.indexOf('\0') != -1) { return false; }
	s += '\0';
	
	var t = [];
	for (var i=0;i<s.length;i++) {
		t.push(s.substr(i) + s.substr(0,i));
	}
	t.sort();
	
	var l = [];
	for (var i=0;i<t.length;i++) {
		var row = t[i];
		l.push(row.charAt(row.length-1));
	}
	
	return l.join("");
}

function ibwt(s)
{
	var t = [];

	for (var i=0;i<s.length;i++) {
		t.push("");
	}

	for (var i=0;i<s.length;i++) {
		if (!(i % 100)) console.log(i);
		for (var j=0;j<s.length;j++) {
			t[j] = s[j] + t[j];
		}
		t.sort();
	}

	s = t.filter(function(x) { 
		return (x.charAt(x.length-1) == '\0') }
	).shift();

	return s.substr(0,s.length-1);
}


// RLE decompression reference implementation
function rleDecode(data)
{
	var result = new Array;
	if(data.length == 0)
		return result;

	if((data.length % 2) != 0)
	{
		alert("Invalid RLE data");
		return;
	}

	for(var i = 0; i < data.length; i+=2)
	{
		var val = data[i];
		var count = data[i+1];
		for(var c = 0; c < count; c++)
			result[result.length] = val;
	}
	return result;
}

// RLE compression reference implementation
function rleEncode(data)
{
	var result = new Array;
	if(data.length == 0)
		return result;

	var count = 1;
	var r = 0;
	for(var i = 0; i < (data.length - 1); i++)
	{
		// If contiguous sequence ends, or we encounter a ladder/egg
		// or the sequence reaches 30 elements in length, terminate sequence.
		if(data[i] != data[i+1] || data[i] >= 3 || count == 30)
		{
			result[r] = data[i];
			result[r+1] = count;
			count = 0;
			r +=2;
		}
		count++;
	}
	result[r] = data[i];
	result[r+1] = count;

	return result;
}


function mtf(str) {
	var dict = [];
	for (var i=0;i<256;i++) { dict.push(i); }
	
	var out = [];
	for (var i=0;i<str.length;i++) {
		var code = str.charCodeAt(i);
		var index = dict.indexOf(code);
		out.push(String.fromCharCode(index));
		dict.splice(index, 1);
		dict.unshift(code);
	}
	
	return out.join("");
}

function imtf(str) {
	var dict = [];
	for (var i=0;i<256;i++) { dict.push(i); }

	var out = [];
	for (var i=0;i<str.length;i++) {
		var code = str.charCodeAt(i);
		var val = dict[code];
		out.push(String.fromCharCode(val));
		dict.splice(code, 1);
		dict.unshift(val);
	}
	
	return out.join("");
}
