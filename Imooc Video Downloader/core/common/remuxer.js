var mux = require("mux.js");
var fs = require("fs");
var path = require("path");

function getMaxIndex(sourse) {
    let ts_files = fs.readdirSync(sourse).filter((item, idx) => {
        return path.extname(item) == ".ts";
    });
    ts_files = ts_files.map(filename => parseInt(filename)).sort((a, b) => {
        return a - b;
    })
    if (ts_files.length == 0) return -1;
    return ts_files.pop();
}

function remuxer(sourse, target, callback) {
    var transmuxer = new mux.mp4.Transmuxer();
    transmuxer.on('data', (segment) => {
        let data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
        data.set(segment.initSegment, 0);
        data.set(segment.data, segment.initSegment.byteLength);
        fs.appendFileSync(target, data);
    })
    var maxIndex = getMaxIndex(sourse);
    for (let index = 0; index <= maxIndex; index++) {
        var bytes = fs.readFileSync(path.resolve(sourse, `${index}.ts`));
        transmuxer.push(new Uint8Array(bytes));
    }
    transmuxer.flush();
    callback();
}

module.exports = remuxer

