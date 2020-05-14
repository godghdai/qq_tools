const MESSAGE_TYPE_TEXT=0;
const MESSAGE_TYPE_FILE=1;
const HEADER_LEN = 5;
const HOST = '127.0.0.1';
const PORT = 6868;

function getMessagePacket(txt){
    const header = Buffer.allocUnsafe(5);
    header.writeUInt8(MESSAGE_TYPE_TEXT,0); //1
    var body = new Buffer.from(txt);
    header.writeUInt32BE(body.length, 1); //4
    return Buffer.concat([ header, body ], 5 + body.length);
}

function getMessagePacketStart(){
    const header = Buffer.allocUnsafe(5);
    header.writeUInt8(MESSAGE_TYPE_TEXT,0); //1
    var body = new Buffer.from("start");
    header.writeUInt32BE(body.length, 1); //4
    return Buffer.concat([ header,body ], 5 + body.length);
}


module.exports = {
    MESSAGE_TYPE_TEXT,
    MESSAGE_TYPE_FILE,
    HEADER_LEN,
    HOST,
    PORT
}