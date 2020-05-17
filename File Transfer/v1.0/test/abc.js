const net = require('net');
const fs = require('fs');

const Cutter = require('./cutter');

const {HOST,PORT,MESSAGE_TYPE_TEXT,MESSAGE_TYPE_FILE,HEADER_LEN} = require('./packet/const');
const {file_packet_parse} = require('./packet/filePacket');
const {getTextPacket,textPacketParse} = require('./packet/textPacket');

const all_clients={};
var server = net.createServer();

function broadcast(cur_socket,text){
  var keys=Object.keys(all_clients);
  for (let i = 0; i < keys.length; i++) {
    var client = all_clients[keys[i]];
    if(client==cur_socket)
      continue;
      
      client.write(getTextPacket(text));
  }
}

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

    all_clients[`${socket.remoteAddress}:${socket.remotePort}`]=socket;
    
    const cutter = new Cutter(HEADER_LEN, data => {
      return HEADER_LEN +data.readUInt32BE(1);
    });
    cutter.on('packet', packet => {
      var type=packet.readUInt8(0)
      if(type==MESSAGE_TYPE_TEXT){
        var text=textPacketParse(packet);
        console.log(text);
        broadcast(socket,text);
        socket.write(getTextPacket("true"));
      } 
      if(type==MESSAGE_TYPE_FILE){
        var fileInfo=file_packet_parse(packet);
       // console.log(fileInfo)
         fs.appendFileSync(fileInfo.fileName, fileInfo.data)
         socket.write(getTextPacket("true"));
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
        delete all_clients[`${socket.remoteAddress}:${socket.remotePort}`];
        console.log(error);
    });

});
server.listen(PORT, HOST);
process.on('uncaughtException', (err, origin) => {
  console.log(err,origin);
});
console.log('Server listening on ' + HOST + ':' + PORT);const net = require('net');
const fs = require('fs');

const Cutter = require('./cutter');

const {HOST,PORT,MESSAGE_TYPE_TEXT,MESSAGE_TYPE_FILE,HEADER_LEN} = require('./packet/const');
const {file_packet_parse} = require('./packet/filePacket');
const {getTextPacket,textPacketParse} = require('./packet/textPacket');

const all_clients={};
var server = net.createServer();

function broadcast(cur_socket,text){
  var keys=Object.keys(all_clients);
  for (let i = 0; i < keys.length; i++) {
    var client = all_clients[keys[i]];
    if(client==cur_socket)
      continue;
      
      client.write(getTextPacket(text));
  }
}

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

    all_clients[`${socket.remoteAddress}:${socket.remotePort}`]=socket;

    const cutter = new Cutter(HEADER_LEN, data => {
      return HEADER_LEN +data.readUInt32BE(1);
    });
    cutter.on('packet', packet => {
      var type=packet.readUInt8(0)
      if(type==MESSAGE_TYPE_TEXT){
        var text=textPacketParse(packet);
        console.log(text);
        broadcast(socket,text);
        socket.write(getTextPacket("true"));
      } 
      if(type==MESSAGE_TYPE_FILE){
        var fileInfo=file_packet_parse(packet);
       // console.log(fileInfo)
         try{
          fs.appendFileSync(fileInfo.fileName, fileInfo.data)
          socket.write(getTextPacket("true"));
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
        delete all_clients[`${socket.remoteAddress}:${socket.remotePort}`];
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