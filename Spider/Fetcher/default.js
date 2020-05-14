var https = require('https');
var http = require('http');
var iconv = require('iconv-lite');
var EventEmitter = require('events');
const CHARSET_REG = /<meta[^>]*charset="?([^>"]*)"?\s*\/>/i;

function getCharset(str) {
    try {
        var res = str.match(CHARSET_REG)[1] || "utf8";
        return res;
    } catch (e) {
        console.log(str);
        return "utf8"
    }
}


//console.log(getCharset(`<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />`))



class Fetcher extends EventEmitter {
    constructor() {
        super();
        this.referer = null;
    }
    run(req) {
        var _self = this;

        var _http = req.url.startsWith("https:") ? https : http;

        _self.emit("before_request", this, req);

        _http.get(req.url, {
            'headers': {
                "Referer": _self.referer || req.url,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.108 Safari/537.36"
            }
        }, function(res) {

            const { statusCode } = res;
            if (statusCode == "403") {
                console.log(statusCode);
                _self.emit("error", { "error": "403", "req": req });
                return;
            }
            const contentType = res.headers['content-type'] || "";
            var length = 0;
            var chunks = [];

            res.on("data", function(chunk) {
                chunks.push(chunk);
                length += chunk.length;
            });
            res.on("end", function() {
                var response = Buffer.concat(chunks, length);
                if (!contentType.startsWith("image")) {
                    response = iconv.decode(response, getCharset(response.toString()));
                }
                _self.emit("data", { "req": req, "res": response });
                _self.emit("job_done", _self);
            });


        }).on('error', (e) => {
            _self.emit("error", { "error": e, "req": req });
            _self.emit("job_done", _self);
        });


    }
    setReferer(val) {
        this.referer = val;
    }
}

module.exports = Fetcher;