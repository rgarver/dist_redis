var zip = require('./crc32')

var DistHashTable = exports.DistHashTable = function(){
	this.nodes = []

	this.addNode = function(node) {
		this.nodes.push(node);
	}

	this.getNodeFor = function(lookup) {
		return this.nodes[0]
	}

	this.hash = function(val) {
		return zip.crc32(val);
	}
}