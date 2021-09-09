const { spawn } = require('child_process');
const iconv = require('iconv-lite');
const path = require('path');
const fs = require('fs');
const {ffmepg_path} = require('./config');

function mergeToMP4(ts_file_path, mp4_file_path) {
    //var ffmepg_path = path.join(path.resolve(__dirname, "."), "ffmpeg.exe");
    //&&rmdir /s/q ${ts_file_path}
    var ffmepg_cmd = `${ffmepg_path} -i "concat:${concatStr(getMaxNum(ts_file_path))}" -acodec copy -vcodec copy -absf aac_adtstoasc ${mp4_file_path}`;
    return new Promise((reslove, reject) => {
        const bat = spawn('cmd.exe', ['/s', '/c', `cd ${ts_file_path}&&${ffmepg_cmd}`], {
            encoding: 'buffer',
            "windowsVerbatimArguments": true,
        });

        bat.stdout.on('data', (data) => {
            console.log(iconv.decode(data, 'cp936'));
        });

        bat.stderr.on('data', (data) => {
            console.log(iconv.decode(data, 'cp936'));
        });

        bat.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
            reslove(true);
        });
    });

}

function getMaxNum(ts_file_path) {
    var files = fs.readdirSync(ts_file_path);
    files = files.filter(name => name.endsWith(".ts"));
    files = files.sort((a, b) => parseInt(a) - parseInt(b));
    return parseInt(files.pop());
}

function concatStr(maxNum) {
    var str = "";
    for (var i = 1; i <= maxNum; i++)
        str += `${i}.ts|`
    return str.substring(0, str.length - 1);
}

module.exports = mergeToMP4