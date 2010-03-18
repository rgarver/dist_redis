var assert = require("assert");
var sys = require("sys");
var dht = require("../lib/dist_hash_table");

sys.debug("TEST 1 : Can add nodes.")
var test1 = new dht.DistHashTable()
assert.doesNotThrow(function(){
	test1.addNode({})
}, TypeError)

sys.debug("TEST 1 : Can retrieve nodes.")
var test2 = new dht.DistHashTable()
test2.addNode('test')
assert.equal(test2.getNodeFor("anything"), 'test')

