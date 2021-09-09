const { print, exit } = require('../common/util');
const { TextMessage } = require('../message/text_message');
const { FileMessage } = require('../message/file_message');

function init(dispatcher) {
    var submit=dispatcher.submit.bind(dispatcher);
    process.stdin.on('data', (input) => {
        input = input.toString().trim();
        if (input == "q") {
            exit();
            return;
        }
        if (input.startsWith("-f")) {
            var parms = input.split(" ")
            if (parms.length < 2) {
                print("参数不匹配!!");
                return;
            }
            parms.shift();
            submit(FileMessage(`./${parms[0]}`, `./${parms[1]}`, 1024).on("progress", function (task) {
                //print(task.getProgress(), " finished")
            }).on("finished", function (task) {
               // print(task.text, "finished")
            }));

            return;
        }
        if (input.length > 0) {
            submit(TextMessage(input).on("finished", function (message) {
                print(message.text, " finished")
            }));
        }

    })

}

module.exports = { init };