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
			this.buffer = "";
			self.connectionsWaiting.push(this);
			self.emit("connectionReady");
		});
		conn.addListener('data', function(data){
			this.buffer += data;
			var handler = _(this.readCallback).first();

			if(_(handler.callback).isFunction()){
				if(handler.callback(this.buffer)){
					this.buffer = "";
					this.readCallback.shift();
					self.writeNext(this);
				}
			} else {
				this.buffer = "";
				this.readCallback.shift();
				self.writeNext(this);
			}
		});
		this.connections.push(conn);
	}
}

sys.inherits(ConnectionPool, process.EventEmitter);

ConnectionPool.prototype.write = function(str, callback) {
	this.writeQueue.push({buffer:str, callback:callback});

	if(!_(this.connectionsWaiting).isEmpty())
		this.writeNext(this.connectionsWaiting.shift());
}
ConnectionPool.prototype.writeNext = function(connection) {
	if(_(this.writeQueue).isEmpty()) {
		this.connectionsWaiting.push(connection);
		return;
	}

	var toWrite = this.writeQueue.shift();

	connection.readCallback.push(toWrite);
	sys.log("FORWARDING: " + toWrite.buffer);
/*	sys.log(sys.inspect(connection.readCallback))*/
	connection.write(toWrite.buffer);
}
ConnectionPool.prototype.close = function() {
	for(var conn in this.connections) {
		conn.close();
	}
}