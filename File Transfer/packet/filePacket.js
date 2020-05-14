const fs = require('fs');
const {MESSAGE_TYPE_FILE} = require('./const');

function get_filepacket_by_index(filepath,targetpath,packSize){

    var  fileInfo = fs.statSync(filepath);
    var  fileSize = fileInfo.size;

    var nums = Math.ceil(fileSize / packSize);
  
    var buffer = new Buffer.allocUnsafe(packSize*2);
    var offset=0,start,end,file_data_length,total_length;
 
    var fileName_buffer = new Buffer.from(targetpath,'utf8');
    var index=0;
    function get_packet (){
        if(index>nums-1){    
            return null;
        }
        let fd = fs.openSync(filepath, 'r'); 
        offset=0;
        buffer[offset++]=MESSAGE_TYPE_FILE;

        start=index*packSize;
        end=Math.min(start+packSize-1,fileSize-1);

        file_data_length=end-start+1;
        total_length=6*4+fileName_buffer.length+file_data_length;
        offset=buffer.writeUInt32BE(total_length,offset);
        offset=buffer.writeUInt32BE(fileName_buffer.length,offset);
        offset+=fileName_buffer.copy(buffer,offset,0);
        offset=buffer.writeUInt32BE(fileSize,offset);
        offset=buffer.writeUInt32BE(start,offset);
        offset=buffer.writeUInt32BE(end,offset);
        offset=buffer.writeUInt32BE(nums,offset);
        offset=buffer.writeUInt32BE(index+1,offset);
        fs.readSync(fd, buffer, offset, file_data_length, start);
        fs.closeSync(fd);
        offset+=file_data_length;
       // let res=Buffer.allocUnsafe(offset);
        //buffer.copy(res,0);
        index++;
        return buffer.slice(0,offset);
        
    }
    return {
        "nums":nums,
        "get_packet":get_packet,
        "toString":function(){
            return `upload file from ${filepath} to ${targetpath} finished!!`
        }
    }
     
}

function file_packet_parse(buffer){
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
    get_filepacket_by_index,
    file_packet_parse
}