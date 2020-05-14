const {getTextPacket} = require('./packet/textPacket');

const all_clients={};

function broadcast(cur_socket,text){
    var keys=Object.keys(all_clients);
    var packet=getTextPacket(text);
    for (let i = 0; i < keys.length; i++) {
      var client = all_clients[keys[i]];
      if(client==cur_socket)
        continue;      
        client.write(packet);
    }
}

module.exports = {
    addClient:function(socket){
        all_clients[`${socket.remoteAddress}:${socket.remotePort}`]=socket;
    },
    removeClient:function(socket){
        delete all_clients[`${socket.remoteAddress}:${socket.remotePort}`];
    },
    broadcast 
}