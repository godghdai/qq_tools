const net = require('net');

const { HOST, PORT } = require('./config/base');
const { print, exit } = require('./core/common/util');
const client_dispatcher = require('./core/client/dispatcher');
const stdin = require('./core/client/stdin');
const { TextMessage } = require('./core/message/text_message');
const { MESSAGE_TYPE_TEXT} = require('./core/common/const');

var client = new net.Socket();

client.connect(PORT, HOST, function () {
    print('connected to: ' + HOST + ':' + PORT);

    var dispatcher = client_dispatcher(client);
    stdin.init(dispatcher);
   
    dispatcher.submit(TextMessage("hello word").on("finished", function (message) {
        print(message.text, " finished")
    }));


    client.on('error', function (error) {
        console.log(error);
        exit();
    });

    client.on('packet', packet => {
        var type = packet.readUInt8(0);
        if (type == MESSAGE_TYPE_TEXT) {
            var body = packet.slice(5);
            console.log(body.toString());
        }
    });

    client.on('end', function () {
        print('connection end');
    })
})
