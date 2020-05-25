const util = require('util');
const FetcherWorker = require("./fetcherWorker");
const DownloadTask = require("./task/downloadTask");
function scheduler() {
    if (!(this instanceof scheduler))
        return new scheduler();

    this.num = 3;
    this.fetcherWorkers = [];
    this.requestTasks = [];
    this.init();
}
scheduler.prototype.run = function () {
    if (this.requestTasks.length > 0 && this.fetcherWorkers.length > 0) {
        this.fetcherWorkers.pop().httpGet(this.requestTasks.pop());
    }
}
scheduler.prototype.onFetcher = function (err, fetcherWorker, requestTask, data) {
    this.fetcherWorkers.push(fetcherWorker);

    if (requestTask instanceof DownloadTask) {

        requestTask.done(err, requestTask, data);

    } else {
        requestTask.done(err, data);
    }
    this.run();
}

scheduler.prototype.init = function () {
    for (let i = 0; i < this.num; i++) {
        var fetcherWorker = FetcherWorker(this.onFetcher.bind(this));
        this.fetcherWorkers.push(fetcherWorker);
    }
}
scheduler.prototype.submit = function (requestTask) {
    this.requestTasks.push(requestTask);
    this.run();
}
module.exports = scheduler
