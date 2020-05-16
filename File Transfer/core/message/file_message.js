const { MESSAGE_TYPE_FILE } = require('../common/const');

const util = require('util');
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;

function FileMessage(filepath, targetpath, packSize) {

    if (!(this instanceof FileMessage))
        return new FileMessage(filepath, targetpath, packSize);

    this.type = MESSAGE_TYPE_FILE;
    this.text = `upload file from ${filepath} to ${targetpath}!!`
    this.filepath = filepath;
    this.targetpath = targetpath;
    this.packSize = packSize;

    this.fileSize = fs.statSync(filepath).size;
    this.nums = Math.ceil(this.fileSize / packSize);
    this.buffer = new Buffer.allocUnsafe(packSize * 2);
    this.fileName_buffer = new Buffer.from(targetpath, 'utf8');
    this.index = 0;
    
}

FileMessage.prototype.getNextBuffer = function () {
     
    var offset = 0, start, end, file_data_length, total_length;

    var {fileName_buffer,buffer}=this;
    var {index,nums,fileSize,packSize}=this;

    let fd = fs.openSync(this.filepath, 'r');
    buffer[offset++] = MESSAGE_TYPE_FILE;

    start = index * packSize;
    end = Math.min(start + packSize - 1, fileSize - 1);

    file_data_length = end - start + 1;
    total_length = 6 * 4 + fileName_buffer.length + file_data_length;
    offset = buffer.writeUInt32BE(total_length, offset);
    offset = buffer.writeUInt32BE(fileName_buffer.length, offset);
    offset += fileName_buffer.copy(buffer, offset, 0);
    offset = buffer.writeUInt32BE(fileSize, offset);
    offset = buffer.writeUInt32BE(start, offset);
    offset = buffer.writeUInt32BE(end, offset);
    offset = buffer.writeUInt32BE(nums, offset);
    offset = buffer.writeUInt32BE(index + 1, offset);
    fs.readSync(fd, buffer, offset, file_data_length, start);
    fs.closeSync(fd);
    offset += file_data_length;
    this.index++;
    return buffer.slice(0, offset);
}

FileMessage.prototype.getProgress=function() {
    return (this.index/this.nums*100).toFixed(2);
}

FileMessage.prototype.isFinished=function() {
    return this.index > this.nums - 1;
}

util.inherits(FileMessage, EventEmitter);


function parse(buffer){
    var offset=0;
    var res={
        "type":0,
        "length":0,
        "fileName":"",
        "fileSize":0,
        "start":0,
        "end":0,
        "total":0,
        "order":0,
        "data":null
    };
  
    res["type"]=buffer[offset++];
    res["length"]=buffer.readUInt32BE(offset);
    offset+=4;
  
    var fileNameLength=buffer.readUInt32BE(offset);
    offset+=4;
  
    res["fileName"]= buffer.slice(offset,offset+fileNameLength).toString();
    offset+=fileNameLength;
  
    res["fileSize"]=buffer.readUInt32BE(offset);
    offset+=4;
  
    res["start"]=buffer.readUInt32BE(offset);
    offset+=4;
  
    res["end"]=buffer.readUInt32BE(offset);
    offset+=4;
  
    res["total"]=buffer.readUInt32BE(offset);
    offset+=4;
  
    res["order"]=buffer.readUInt32BE(offset);
    offset+=4;
  
    res["data"]=buffer.slice(offset);
    return res;
}


module.exports = {
    FileMessage,
    parse
};

