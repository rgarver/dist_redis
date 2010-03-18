var sys = require('sys')
var Tokenizer = exports.Tokenizer = function(str) {
	this.reset(str);
}

Tokenizer.prototype.append = function(str) {
	this.buffer += str;
}
Tokenizer.prototype.restOfBuffer = function(){
	if(!this.buffer || this.buffer.length < this.position)
		return ""
	return this.buffer.slice(this.position);
}
Tokenizer.prototype.reset = function(str){
	this.buffer = str || this.restOfBuffer();
	this.position = 0;
	this.tokens = []
}
Tokenizer.prototype.peek = function(amount) {
	var amt = amount || 1;
	return this.buffer.substr(this.position, amt);
}
Tokenizer.prototype.next = function(amount) {
	var amt = amount || 1;
	var c = this.peek(amt);
	this.position += amt;
	return c;
}
Tokenizer.prototype.nextUntil = function(stop) {
	var loc = "";
	while(!this.peek().match(stop)) {
		loc += this.next();
	}
	return loc;
}