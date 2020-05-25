var https = require('https');
var http = require('http');
/*
const request = require("request").defaults({
     ca: fs.readFileSync(path.resolve(__dirname,"./imoke.pem"), {encoding: "utf-8"}),
  })*/

const DEFAULT_HEADER = { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36' };

function Fetcher({ headers } = {}) {
    if (!(this instanceof Fetcher))
        return new Fetcher(headers);

    this.time = 3;
    this._time = 3;
    this.delay = 1000;

    if (headers)
        this.setHeader(headers);
}

Fetcher.prototype.httpGet = function (url, callback) {
    var self = this;
    var _http = url.startsWith("https:") ? https : http;
    _http.get(url, {
        'headers': self.headers
    }, function (res) {

        const { statusCode } = res;
        if (statusCode == "403") {
            callback("403");
            return;
        }
        var length = 0;
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
            length += chunk.length;
        });
        res.on("end", function () {
            var response = Buffer.concat(chunks, length);
            callback(null, response);
        });


    }).on('error', (err) => {
        if (self.time > 1) {
            self.time--;
            setTimeout(function () {
                self.httpGet(url);
            }, self.delay);
        } else
            callback(err);
    });


    return self;
}
Fetcher.prototype.setHeader = function (headers) {
    this.headers = {
        ...DEFAULT_HEADER,
        ...headers
    };
    return this;
}
Fetcher.prototype.setRetry = function (time, delay) {
    this.time = time;
    this._time = time;
    this.delay = delay;
    return this;
}
module.exports = Fetcher;