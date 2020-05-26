const util = require('util');
const Fetcher = require("../core/common/fetcher");
const EventEmitter = require('events').EventEmitter;
function FetcherWorker(nextRequestTask) {
    if (!(this instanceof FetcherWorker))
        return new FetcherWorker(nextRequestTask);

    this.fetcher = new Fetcher();
    this.fetcher.setHeader({
        'origin': 'https://coding.imooc.com',
        //'Host': 'coding.imooc.com',
        //'Referer': 'https://coding.imooc.com/lesson/228.html',
        'Cookie': 'completeuinfo:'    // 'X-Requested-With': 'XMLHttpRequest'
        // rejectUnauthorized: false,
        // requestCert: true
    });
    this.fetcher.setRetry(3, 1000);
    this.nextRequestTask = nextRequestTask;

}

FetcherWorker.prototype.httpGet = function (requestTask) {
    var self = this;

    self.fetcher.httpGet(requestTask.url, {
        "onDone": function (err, data) {
            requestTask.done(err, data);
            self.nextRequestTask(self);
        },
        "onProgress": function (progress) {
            if (requestTask.onProgress)
                requestTask.onProgress(progress);
        }
    })

}
util.inherits(FetcherWorker, EventEmitter);
module.exports = FetcherWorker;