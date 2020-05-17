function m_socket() {

    var data = [
        8, 80, 81, 82, 83, 84, 85, 86, 87, 6, 60, 61,
        62, 63, 64, 65, 4, 40, 41, 42, 43, 9, 90, 91,
        92, 93, 94, 95, 96, 97, 98, 5, 50, 51, 52, 53,
        54, 9, 90, 91, 92, 93, 94, 95, 96, 97, 98, 1,
        10, 5, 50, 51, 52, 53, 54, 6, 60, 61, 62, 63,
        64, 65
    ];
    var data_index = 0;
    var interval = null;
    var events = {};

    function random(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function gen_data() {
        for (var i = 1; i < 10; i++) {
            var r = random(1, 10);
            data.push(r);
            for (var o = 0; o < r; o++) {
                data.push(r * 10 + o);
            }
        }
    }

    function connect() {
        interval = setInterval(function () {
            var r = random(1, 10);
            var temp = [];
            while (r > 0 && data_index < data.length) {
                temp.push(data[data_index++]);
                r--;
            }
            if (data_index > data.length - 1) {
                clearInterval(interval);
            }
            emit("data", temp);

        }, 100)
    }

    function on(event, fun) {
        var funs = events[event] || [];
        funs.push(fun);
        events[event] = funs;
    }

    function emit(event, ...args) {
        var funs = events[event] || [];
        for (let i = 0; i < funs.length; i++) {
            funs[i].apply(null, args);
        }
    }

    return {
        connect,
        on,
        emit
    }
}


function decorator(socket) {
    var buffer = [];
    var head_len=1;
    function extract_packet() {

        if (buffer.length < head_len) return;

        var len = buffer[0];

        while (buffer.length >= head_len + len) {
            //console.log(buffer.slice(0,1+len));
            socket.emit("packet", buffer.slice(head_len, head_len + len));
            buffer = buffer.slice(head_len + len);
            len = buffer[0];
        }
    }

    socket.on("data", function (data) {
        buffer.push(...data);
        extract_packet();
    });

    return socket;

}

var socket = decorator(m_socket());
socket.on("packet", function (packet) {
    console.log(packet);
});
socket.connect();
