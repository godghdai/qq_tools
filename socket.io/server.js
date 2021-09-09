var io = require('socket.io')(8080,{
    path: '/yzd'
});

const fs = require('fs');
io.set('log level', 1);

const adminNamespace=io.of('/admin');
adminNamespace.use((socket, next) => {
    let handshake = socket.handshake;
    let token = socket.handshake.query.token;
    console.dir(handshake);
    console.dir(token);
    next();
});


adminNamespace.on('connection', function (socket) {
    let token = socket.handshake.query.token;
    console.log("connection "+token)

    adminNamespace.emit('connect', { hell: 'boy' });

    setInterval(function () {
        socket.emit('tick', Date.now());
    }, 2000)


    socket.on("message", function (message) {
        console.log(message);
    })


    socket.on("send", function (form) {

        fs.writeFileSync("./dfsdf.png", form);
        console.log(form);
    })

    socket.on('disconnect', function () {
        io.emit('user disconnected');
    });
});