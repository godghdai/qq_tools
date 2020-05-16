const net = require('net');
const { HOST, PORT} = require('./config/base');

var server = net.createServer();
const server_handler = require('./core/server/handler');

server.on('connection', function(socket) {

    console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
    console.log('LOCAL: ' + socket.localAddress + ':' + socket.localPort);

   // client_manger.addClient(socket);

    var handler=server_handler(socket);
    
    socket.on('end', function(data) {
        console.log('END: ' + socket.remoteAddress + ' ' + socket.remotePort);
    });

    socket.on('error', function(error) {
      //  client_manger.removeClient(socket);
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