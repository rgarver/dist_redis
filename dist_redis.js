var sys = require('sys');
var tcp = require('tcp');
require('./vendor/lib/underscore')
var ra = require('./lib/redis_array')
var cp = require('./lib/connection_pool')

var pool = new cp.ConnectionPool(6379, '127.0.0.1', 10)


var server = tcp.createServer(function(socket){
	socket.setEncoding('binary');
	socket.addListener('connect', function(){
		sys.log("Connected");
		socket.setNoDelay();
	});

	socket.addListener('data', function(data){
		sys.log("RECEIVED: " + data.replace("\r", "\\r").replace("\n", "\\n"));
		var r = new ra.RedisArray(data)

		if(r.command() == "SET") {
			pool.write(r.toString());
			socket.write("+OK\r\n");
			sys.log("REPLYING: +OK\\r\\n");
		} else if(r.command() == "PING") {
			socket.write("+PONG\r\n");
			sys.log("REPLYING: +PONG\\r\\n");
		} else {
			pool.write(r.toString(), function(data){
				if(socket.readyState == "open") {
					sys.log("REPLYING: " + data.replace("\r", "\\r").replace("\n", "\\n"));
					socket.write(data);
				}
			});
		}
	});

	socket.addListener('end', function(){
		sys.log("Disconnected");
		socket.close();
	});
});

pool.addListener('connected', function(){
	server.listen(7000, "localhost");
});