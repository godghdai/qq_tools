const fs = require('fs');
const PacketExtractor = require('../common/packet_extractor');
const { MESSAGE_TYPE_TEXT, MESSAGE_TYPE_FILE } = require('../common/const');
const {"parse":file_message_parse} = require('../message/file_message');
const {TextMessage,"parse":textPacketParse,TEXT_MESSAGE_RETURN} = require('../message/text_message');

function handler(socket) {

    if(!(this instanceof handler))
        return new handler(socket);

    this.socket = socket;
    this.init_packet_extractor();
}

handler.prototype.init_packet_extractor=function() {
    var self=this;    
    self.extractor = new PacketExtractor();
    self.socket.on("data",function(data){
        self.extractor.push_data(data);
    })
    self.extractor.on("packet",function(packet){
        self.on_packet(packet);
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