/*process.mixin(GLOBAL, require('./test_helper'));*/
require('../vendor/ntest/ntest')
var assert = require("assert");
var sys = require("sys");
var dht = require("../lib/dist_hash_table");

describe("DistHashTable")
	it("can add nodes", function(){
		var table = new dht.DistHashTable()
		assert.doesNotThrow(function(){
			table.addNode({})
		}, TypeError)
	})

	it("can retrieve nodes", function(){
		var table = new dht.DistHashTable()
		table.addNode('test')
		assert.equal(table.getNodeFor("anything"), 'test')
	})