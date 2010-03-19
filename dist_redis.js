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
		socket.handleRedisReply = handleResponseFn(socket);
	});

	socket.addListener('data', function(data){
/*		sys.log("RECEIVED: " + data.replace("\r", "\\r").replace("\n", "\\n"));*/
		var r = new ra.RedisArray(data)

		if(r.command() == "SET") {
			process.nextTick(function(){pool.write(r.toString());});
			process.nextTick(function(){
				if(socket.readyState == "open")
					socket.write("+OK\r\n");
				sys.log("REPLYING: +OK\\r\\n");
			});
		} else if(r.command() == "PING") {
			process.nextTick(function(){
				if(socket.readyState == "open")
					socket.write("+PONG\r\n");
				sys.log("REPLYING: +PONG\\r\\n");
			});
		} else {
			process.nextTick
			pool.write(r.toString(), handleResponseFn(socket));
		}
	});

	socket.addListener('end', function(){
		sys.log("Disconnected");
		socket.close();
	});
});

function handleResponseFn(socket) {
	return function(data) {
/*		sys.log("GOT: " + data);*/
		if(ra.validRedisResponse(data)) {
			if(socket.readyState == "open")
				socket.write(data);
/*		sys.log("REPLYING: " + data.replace("\r", "\\r").replace("\n", "\\n"));*/
			sys.log("REPLYING")
			return true;
		} else {
/*			sys.log("NOT ENOUGH: " + data.replace("\r", "\\r").replace("\n", "\\n"));*/
			sys.log("NOT ENOUGH");
			return false;
		}
	}
}

pool.addListener('connected', function(){
	server.listen(7000, "localhost");
});