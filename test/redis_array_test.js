/*var ntest = require('../vendor/ntest/ntest');*/
/*process.mixin(GLOBAL, require('./test_helper'));*/
require('../vendor/ntest/ntest')
var assert = require("assert");
var sys = require("sys");
var ra = require("../lib/redis_array");

describe("RedisArray")
	it("parses inline commands from string to array", function(){
		var r = new ra.RedisArray("PING\r\n")
		assert.equal(r.command(), "PING");
		assert.deepEqual(r.toArray(), ["PING"]);
	})

	it("parses bulk commands from string to array", function(){
		var r = new ra.RedisArray("set test 3\r\nxxx\r\n");
		assert.equal(r.command(), "SET");
		assert.deepEqual(r.toArray(), ["SET", "test", "xxx"]);
	})

	it("parses multi-bulk commands from string to array", function(){
		var r = new ra.RedisArray("*5\r\n$4\r\nmset\r\n$5\r\ntest1\r\n$3\r\nxxx\r\n$5\r\ntest2\r\n$3\r\nyyy\r\n");
		assert.equal(r.command(), "MSET")
		assert.deepEqual(r.toArray(), ["MSET", "test1", "xxx", "test2", "yyy"])
	})

	it("parses strings to strings", function(){
		var str = "SET test 3\r\nxxx\r\n"
		var r = new ra.RedisArray(str)
		assert.equal(r.toString(), str)
	})

	it("parses weird inline commands from string to array", function(){
		var r = new ra.RedisArray("LRANGE test 0 3\r\n")
		assert.equal(r.command(), "LRANGE");
		assert.deepEqual(r.toArray(), ["LRANGE", "test", "0", "3"]);
	})

describe("validRedisResponse")
	it("validates errors", function(){
		assert.ok(ra.validRedisResponse("-OK\r\n"));
	})

	it("validates success", function(){
		assert.ok(ra.validRedisResponse("+OK\r\n"));
	})

	it("validates bulk data", function(){
		assert.ok(ra.validRedisResponse("$3\r\nxxx\r\n"))
	})

	it("validates multi-bulk data", function(){
		assert.ok(ra.validRedisResponse("*3\r\n$3\r\nxxx\r\n$1\r\na\r\n$2\r\nbb\r\n"))
	})

	it("validates integers", function(){
		assert.ok(ra.validRedisResponse(":12345\r\n"))
	})

	it("rejects non-newline terminated data", function(){
		assert.ok(!ra.validRedisResponse("+OK"))
	})

	it("rejects too short bulk data", function(){
		assert.ok(!ra.validRedisResponse("$5\r\nxxx\r\n"))
	})

	it("rejects too short multi-bulk arrays", function(){
		assert.ok(!ra.validRedisResponse("*3\r\n$3\r\nxxx\r\n$1\r\na\r\n"))
	})

	it("validates multi-bulk arrays with empty cells", function(){
		assert.ok(ra.validRedisResponse("*3\r\n$3\r\nxxx\r\n$1\r\na\r\n$-1\r\n"))
	})