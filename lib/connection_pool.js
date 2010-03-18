var sys = require('sys')
var tcp = require('tcp');
require('../vendor/lib/underscore')

var ConnectionPool = exports.ConnectionPool = function(port, host, poolSize){
	this.port = port;
	this.host = host || '127.0.0.1';
	this.poolSize = poolSize || 1;
	var readyCt = 0;
	this.connections = [];
	this.connectionsWaiting = [];
	this.writeQueue = [];
	var self = this;

	this.addListener('connectionReady', function(){
		readyCt++;
		if(readyCt == this.poolSize)
			this.emit('connected');
	})

	for(var i=0; i < this.poolSize; i++) {
		var conn = new tcp.createConnection(this.port, this.host);
		conn.addListener('connect', function(){
			this.setEncoding('binary');
			this.setTimeout(0);
			this.setNoDelay();
			this.readCallback = [];
			self.emit("connectionReady");
		});
		conn.addListener('drain', function(){
			self.writeNext(this);
		});
		conn.addListener('data', function(data){
			var handler = this.readCallback.shift();

			if(handler.callback && _(handler.callback).isFunction())
				handler.callback(data, handler.args);
			this.emit('drain');
		});
		this.connections.push(conn);
	}
}

sys.inherits(ConnectionPool, process.EventEmitter);

ConnectionPool.prototype.write = function(str, callback) {
	this.writeQueue.push({buffer:str, callback:callback});

	if(!_(this.connectionsWaiting).isEmpty())
		this.connectionsWaiting.shift().emit('drain');
}
ConnectionPool.prototype.writeNext = function(connection) {
	if(_(this.writeQueue).isEmpty()) {
		this.connectionsWaiting.push(connection);
		return;
	}

	var toWrite = this.writeQueue.shift();

	connection.readCallback.push(toWrite);
	connection.write(toWrite.buffer);
}
ConnectionPool.prototype.close = function() {
	for(var conn in this.connections) {
		conn.close();
	}
}