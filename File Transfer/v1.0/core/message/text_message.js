const {MESSAGE_TYPE_TEXT} = require('../common/const');
const TEXT_MESSAGE_RETURN=Buffer.from([0x02, 0x00, 0x00, 0x00, 0x06, 0x72, 0x65, 0x73,0x75,0x6c,0x74]);

const util = require('util');
const EventEmitter = require('events').EventEmitter;

function TextMessage(text){

    if(!(this instanceof TextMessage))
        return new TextMessage(text);

    this.type = MESSAGE_TYPE_TEXT;
    this.text = text; 

}

TextMessage.prototype.toBuffer=function(){
    const header = Buffer.allocUnsafe(5);
    header.writeUInt8(MESSAGE_TYPE_TEXT,0); //1
    var body = new Buffer.from(this.text);
    header.writeUInt32BE(body.length, 1); //4
    return Buffer.concat([ header, body ], 5 + body.length);
}

util.inherits(TextMessage, EventEmitter);

function parse(buffer){
    return buffer.slice(5).toString();
}

module.exports={
    TextMessage,
    parse,
    TEXT_MESSAGE_RETURN
};

