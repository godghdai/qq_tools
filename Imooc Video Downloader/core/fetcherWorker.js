const util = require('util');
const Fetcher = require("./common/fetcher");
const EventEmitter = require('events').EventEmitter;
function FetcherWorker(callback) {
    if (!(this instanceof FetcherWorker))
        return new FetcherWorker(callback);

    this.fetcher = new Fetcher();
    this.fetcher.setHeader({
        'origin': 'https://coding.imooc.com',
        //'Host': 'coding.imooc.com',
        //'Referer': 'https://coding.imooc.com/lesson/228.html',
        'Cookie': 'completeuinfo:3728202'  // 'X-Requested-With': 'XMLHttpRequest'
        // rejectUnauthorized: false,
        // requestCert: true
    });
    this.callback = callback;

}

FetcherWorker.prototype.httpGet = function (requestTask) {
    var self = this;
    self.fetcher.httpGet(requestTask.url, function (err, data) {
        if (err) {
            self.callback(err, self, requestTask);
        } else self.callback(null, self, requestTask, data);

    })
}
util.inherits(FetcherWorker, EventEmitter);
module.exports = FetcherWorker;