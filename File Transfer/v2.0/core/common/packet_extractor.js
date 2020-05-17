var EventEmitter = require('events');
var util = require('util');

const HEADER_LEN = 5;

var PacketExtractor = function() {
  this.buf = null;
  EventEmitter.call(this);  
}

util.inherits(PacketExtractor, EventEmitter);

PacketExtractor.prototype.push_data = function (data) {
  if (!this.buf) {
    this.buf = data;
  } else {
    var length = this.buf.length + data.length;
    this.buf = Buffer.concat([this.buf, data], length);
  }
  this.extract_packet();
};

PacketExtractor.prototype.extract_packet = function () {
  if (!this.buf || this.buf.length < HEADER_LEN) {
    return;
  }
  var packsize;
  var len = this.buf.readUInt32BE(1);   
  
  while (this.buf.length >=HEADER_LEN + len) {
      packsize=HEADER_LEN+len;
      this.emit('packet', this.buf.slice(0, packsize));
      this.buf = this.buf.slice(packsize);
      if(this.buf.length>HEADER_LEN)
      len = this.buf.readUInt32BE(1);
      
  }

}

module.exports = PacketExtractor;
