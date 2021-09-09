const fs = require('fs');
const Cutter = require('../common/cutter');
const { MESSAGE_TYPE_TEXT, MESSAGE_TYPE_FILE, HEADER_LEN } = require('../common/const');
const {"parse":file_message_parse} = require('../message/file_message');
const {TextMessage,"parse":textPacketParse,TEXT_MESSAGE_RETURN} = require('../message/text_message');

function handler(socket) {

    if(!(this instanceof handler))
        return new handler(socket);

    this.socket = socket;
    this.init_cutter();
}

handler.prototype.init_cutter=function() {    
    var self=this;
    const cutter = new Cutter(HEADER_LEN, data => {
        return HEADER_LEN + data.readUInt32BE(1);
    });
    self.cutter=cutter;

    cutter.on('packet', packet => {
        self.on_packet(packet);
    });
    
    cutter.on('error', err => {
        console.log(err);
    });

    self.socket.on('data', function (data) {
        cutter.handleData(data);
    });
}

handler.prototype.on_packet = function (packet) {

    var type = packet.readUInt8(0)
    if (type == MESSAGE_TYPE_TEXT) {
        var text = textPacketParse(packet);
        console.log(text);
        //broadcast(socket, text);
        this.socket.write(TEXT_MESSAGE_RETURN);
    }
    if (type == MESSAGE_TYPE_FILE) {
        var fileInfo = file_message_parse(packet);
        try {
            fs.appendFileSync(fileInfo.fileName, fileInfo.data)
            this.socket.write(TEXT_MESSAGE_RETURN);
        } catch (ex) {
            this.socket.write(TextMessage(ex.toString()).toBuffer());
        }
    }
}

module.exports =handler;