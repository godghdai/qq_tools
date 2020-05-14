const net = require('net');
const fs = require('fs');

const Cutter = require('./cutter');

const {HOST,PORT,MESSAGE_TYPE_TEXT,MESSAGE_TYPE_FILE,HEADER_LEN} = require('./packet/const');
const {file_packet_parse} = require('./packet/filePacket');
const {getTextPacket,textPacketParse,TEXT_PACKET_TRUE} = require('./packet/textPacket');
const client_manger = require('./client_manger');
const {broadcast}=client_manger;

var server = net.createServer();


function readInput(){
  process.stdin.on('data',(input)=>{
      input=input.toString().trim();
      if(input=="q"){
          console.log("bye!!");
          process.exit(0);
          return;
      }
      if(input.length>0){
        broadcast(null,input)
      }
  
})

}
readInput();


server.on('connection', function(socket) {

    console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
    console.log('LOCAL: ' + socket.localAddress + ':' + socket.localPort);

    client_manger.addClient(socket);

    const cutter = new Cutter(HEADER_LEN, data => {
      return HEADER_LEN +data.readUInt32BE(1);
    });
    cutter.on('packet', packet => {
      var type=packet.readUInt8(0)
      if(type==MESSAGE_TYPE_TEXT){
        var text=textPacketParse(packet);
        console.log(text);
        broadcast(socket,text);
        socket.write(TEXT_PACKET_TRUE);
      } 
      if(type==MESSAGE_TYPE_FILE){
        var fileInfo=file_packet_parse(packet);
       // console.log(fileInfo)
         try{
          fs.appendFileSync(fileInfo.fileName, fileInfo.data)
          socket.write(TEXT_PACKET_TRUE);
         }catch(ex){
          socket.write(getTextPacket(ex.toString()));
         }
        
        
      }

    });
    
    cutter.on('error', err => {
        console.log(err);
    });

    socket.on('data', function(data) {
      cutter.handleData(data);         
    });

    
    socket.on('end', function(data) {
        console.log('END: ' + socket.remoteAddress + ' ' + socket.remotePort);
    });

    socket.on('error', function(error) {
        client_manger.removeClient(socket);
        console.log(error);
    });

});
server.listen(PORT, HOST);
server.on('error', (err) => {
  console.log(err);
});

process.on('uncaughtException', (err, origin) => {
  console.log(err,origin);
});
console.log('Server listening on ' + HOST + ':' + PORT);