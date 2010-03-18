var assert = require("assert");
var sys = require("sys");
var ra = require("../lib/redis_array");

sys.debug("TEST 1 : INLINE Command from string.")
var test1 = new ra.RedisArray("PING\r\n")
assert.equal(test1.command(), "PING");
assert.deepEqual(test1.toArray(), ["PING"]);

sys.debug("TEST 2 : Bulk Command from string.")
var test2 = new ra.RedisArray("set test 3\r\nxxx\r\n");
assert.equal(test2.command(), "SET");
assert.deepEqual(test2.toArray(), ["SET", "test", "xxx"]);

sys.debug("TEST 3 : Multi-Bulk Command from string.")
var test3 = new ra.RedisArray("*5\r\n$4\r\nmset\r\n$5\r\ntest1\r\n$3\r\nxxx\r\n$5\r\ntest2\r\n$3\r\nyyy\r\n");
assert.equal(test3.command(), "MSET")
assert.deepEqual(test3.toArray(), ["MSET", "test1", "xxx", "test2", "yyy"])

sys.debug("TEST 4 : INLINE Comand from array.")
var test4 = new ra.RedisArray(["PING"])
assert.equal(test4.toString(), "PING\r\n")

sys.debug("TEST 5 : Bulk Command from array.")
var test5 = new ra.RedisArray(["SET", "test", "xxx"])
assert.equal(test5.toString(), "SET test 3\r\nxxx\r\n")

sys.debug("TEST 6 : Multi-Bulk Command from array.")
var test6 = new ra.RedisArray(["MSET", "test1", "xxx", "test2", "yyy"])
assert.equal(test6.toString(), "*5\r\n$4\r\nMSET\r\n$5\r\ntest1\r\n$3\r\nxxx\r\n$5\r\ntest2\r\n$3\r\nyyy\r\n")

sys.debug("TEST 7 : String to string.")
var test7str = "SET test 3\r\nxxx\r\n"
var test7 = new ra.RedisArray(test7str)
assert.equal(test7.toString(), test7str)

sys.debug("TEST 8 : Weird INLINE Command from string.")
var test8 = new ra.RedisArray("LRANGE test 0 3\r\n")
assert.equal(test8.command(), "LRANGE");
assert.deepEqual(test8.toArray(), ["LRANGE", "test", "0", "3"]);