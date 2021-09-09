const PacketExtractor = require('../common/packet_extractor');
const { MESSAGE_TYPE_TEXT, MESSAGE_TYPE_FILE,MESSAGE_TYPE_RETURN } = require('../common/const');

const STATUS_WAITING_REPLY = 1;
const STATUS_FINISHED = 2;

function dispatcher(socket) {

    if (!(this instanceof dispatcher))
        return new dispatcher(socket);

    this.tasks_text = [];
    this.tasks_file = [];
    this.cur_task;
    this.status = STATUS_FINISHED;
    this.socket = socket;
    this.init_packet_extractor();
   
} 
dispatcher.prototype.init_packet_extractor=function() {
    var self=this;    
    self.extractor = new PacketExtractor();
    self.socket.on("data",function(data){
        self.extractor.push_data(data);
    })
    self.extractor.on("packet",function(packet){
        self.on_packet(packet);
    });
}

dispatcher.prototype.submit=function(task) {
    var self=this;
    if (task.type == MESSAGE_TYPE_TEXT) {
        self.tasks_text.push(task);
    } else if (task.type == MESSAGE_TYPE_FILE) {
        self.tasks_file.push(task);
    }
    if (self.status == STATUS_WAITING_REPLY) return;
    self.send();
}

dispatcher.prototype.send=function() {
    var self=this;
    //优先发文本消息
    if (self.tasks_text.length > 0) {
        self.cur_task = self.tasks_text[0];
        //print("sending:" + cur_task.text)
        self.socket.write(self.cur_task.toBuffer());
        self.status = STATUS_WAITING_REPLY;
        return;
    }

    if (self.tasks_file.length > 0) {
        self.cur_task = self.tasks_file[0];
        //print("sending:" + cur_task.text);
        self.socket.write(self.cur_task.getNextBuffer());
        self.status = STATUS_WAITING_REPLY;
    }
}

dispatcher.prototype.remove_task=function () {
    var cur_task=this.cur_task;
    if (cur_task.type == MESSAGE_TYPE_TEXT) {
        cur_task.emit("finished", cur_task);
        this.tasks_text.shift();
    }

    if (cur_task.type == MESSAGE_TYPE_FILE) {
        cur_task.emit("progress", cur_task);
        if (cur_task.isFinished()) {
            cur_task.emit("finished", cur_task);
            this.tasks_file.shift();
        }
    }
    this.status = STATUS_FINISHED;

}

dispatcher.prototype.on_packet=function (packet) {
    var type = packet.readUInt8(0);     
    
    if(type!=MESSAGE_TYPE_RETURN){
        this.socket.emit("packet",packet);
    }
    
    if(type==MESSAGE_TYPE_RETURN){
        this.remove_task();
        this.send();
    }
}

module.exports =dispatcher