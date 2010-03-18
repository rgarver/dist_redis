require('../vendor/lib/underscore')
var tok = require('./tokenizer')

var inline_commands = {
  AUTH:1, BGSAVE:1, DBSIZE:1, DECR:1, DECRBY:1, DEL:1,
  EXISTS:1, EXPIRE:1, FLUSHALL:1, FLUSHDB:1, GET:1, INCR:1, INCRBY:1, INFO:1,
  KEYS:1, LASTSAVE:1, LINDEX:1, LLEN:1, LPOP:1, LRANGE:1, LTRIM:1, MGET:1,
  MOVE:1, PING:1, RANDOMKEY:1, RENAME:1, RENAMENX:1, RPOP:1, SAVE:1, SCARD:1, SDIFF:1,
  SDIFFSTORE:1, SELECT:1, SHUTDOWN:1, SINTER:1, SINTERSTORE:1, SMEMBERS:1,
  SPOP:1, SRANDMEMBER:1, SUNION:1, SUNIONSTORE:1, TTL:1, TYPE:1,
  ZRANGE:1, ZREVRANGE:1, ZCARD:1, ZRANGEBYSCORE:1,
  RPOPLPUSH:1
};

var bulk_commands = {
  GETSET:1, LPUSH:1, LREM:1, LSET:1, RPUSH:1, SADD:1, SET:1,
  SETNX:1, SISMEMBER:1, SMOVE:1, SREM:1, ZADD:1, ZREM:1, ZSCORE:1
};

var multi_bulk_commands = {
  MSET:1, MSETNX:1
};

var RedisArray = exports.RedisArray = function(init) {
	var s = '';
	var a = [];
	if(_(init).isString()) {
		s = init;
	} else if(_(init).isArray()) {
		a = init;
	}
	this.rawString = s;
	this.tokens = a;
}
RedisArray.prototype.append = function(str) {
	this.tokenizer.append(str);
	this.rawString = this.tokenizer.restOfBuffer();
}
RedisArray.prototype.command = function() {
	var cmd = this.toArray()[0];
	if(isRedisCommand(cmd)) {
		return cmd
	} else {
		return null;
	}
}
RedisArray.prototype.toArray = function() {
	if(_(this.tokens).isEmpty()) {
		this.tokens = getTokens(this.rawString);
	}
	return this.tokens
}
RedisArray.prototype.toString = function() {
	if(_(this.tokens).isEmpty())
		this.toArray();
	if(_(this.tokens).size() <= 2) {
		// Inline command
		return this.tokens.join(" ") + "\r\n";
	} else if(_(this.tokens).size() == 3) {
		// Bulk command
		return Array(this.command(), this.tokens[1], this.tokens[2].length).join(" ") + Array("\r\n", this.tokens[2], "\r\n").join("")
	} else {
		// Multi-bulk command
		return Array("*", _(this.tokens).size(), "\r\n",
			_(this.tokens).chain()
				.map(function(t){return Array("$" + t.length, t)})
				.flatten()
				.value()
				.join("\r\n"),
			"\r\n").join("");
	}
}

function isRedisCommand(s) {
	if(inline_commands[s] || bulk_commands[s] || multi_bulk_commands[s]) {
		return true
	} else {
		return false;
	}
}

function parse(tok) {
	var tokens = [];

	// Get command
	tokens.push(tok.nextUntil(/[ ]|\r/));
	if(tok.next() == "\r") {
		if(tok.next() != "\n") return null;
	} else {
		// Arg 1
		tokens.push(tok.nextUntil(/[ ]|\r/));
		if(tok.next() == "\r") {
			if(tok.next() != "\n") return null;
		} else {
			// Arg 2
			if(inline_commands[tokens[0]]) {
				tokens.push(tok.nextUntil(/[ ]|\r/));
				if(tok.next() == "\r") {
					if(tok.next() != "\n") return null;
				} else {
					// Arg 3
					tokens.push(tok.nextUntil("\r"));
					if(tok.next(2) != "\r\n") return null;
				}
			} else {
				var length = parseInt(tok.nextUntil("\r"));
				if(tok.next(2) != "\r\n") return null;
				tokens.push(tok.next(length));
			}
		}
	}
	return tokens;
}
function parseBulk(tok) {
	var tokens = []
	tok.next(); // $
	var len = parseInt(tok.nextUntil("\r"))
	tok.next(2)
	tokens.push(tok.next(len))
	if(tokens[0].length == len && tok.next(2) == "\r\n") {
		return tokens;
	} else {
		return null;
	}
}

function parseMultiBulk(tok) {
	var tokens = []

	tok.next(); // Drop the prefix
	var arrLen = parseInt(tok.nextUntil("\r"));
	if(tok.next(2) != "\r\n") return null;
	for(var arrPos=0; arrPos < arrLen; arrPos++) {
		tok.next(); // $
		var len = parseInt(tok.nextUntil("\r"));
		if(tok.next(2) != "\r\n") return null;
		if(len >= 0) {
			tokens.push(tok.next(len));
			if(_(tokens).last().length != len) return null;
			if(tok.next(2) != "\r\n") return null;
		}
	}
	return tokens;
}
function getTokens(str) {
	var tokenizer = new tok.Tokenizer(str);
	var tokens = null

	if(tokenizer.peek() == '*') {
		tokens = parseMultiBulk(tokenizer);
	} else if(tokenizer.peek() == '$') {
		tokens = parseBulk(tokenizer);
	} else {
		tokens = parse(tokenizer);
	}

	tokens[0] = tokens[0].toUpperCase(); // Normalize the first one
	return tokens;
}