const {MESSAGE_TYPE_TEXT} = require('./const');
const TEXT_PACKET_TRUE=Buffer.from([0x00, 0x00, 0x00, 0x00, 0x04, 0x74, 0x72, 0x75,0x65]);//getTextPacket("true")
 
function getTextPacket(text){
    const header = Buffer.allocUnsafe(5);
    header.writeUInt8(MESSAGE_TYPE_TEXT,0); //1
    var body = new Buffer.from(text);
    header.writeUInt32BE(body.length, 1); //4
    return Buffer.concat([ header, body ], 5 + body.length);
}


function textPacketParse(buffer){
  return buffer.slice(5).toString();
}

module.exports = {
    getTextPacket,
    textPacketParse,
    TEXT_PACKET_TRUE
}