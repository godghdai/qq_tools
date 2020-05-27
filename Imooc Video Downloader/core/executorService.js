const util = require('util');
function executorService(maxOccurs, fetcherWorkerFactory) {
    if (!(this instanceof executorService))
        return new executorService(maxOccurs);

    if (!fetcherWorkerFactory) {
        throw new Error("The parameter 'fetcherWorkerFactory' is not allowed to be null ");
    }

    this.num = maxOccurs || 5;
    this.fetcherWorkers = [];
    this.requestTasks = [];
    this.fetcherWorkerFactory = fetcherWorkerFactory;
    this.init();
}
executorService.prototype.run = function () {
    if (this.requestTasks.length > 0 && this.fetcherWorkers.length > 0) {
        this.fetcherWorkers.pop().httpGet(this.requestTasks.pop());
    }
}

executorService.prototype.onFetcher = function (fetcherWorker) {
    this.fetcherWorkers.push(fetcherWorker);
    this.run();
}

executorService.prototype.init = function () {
    var FetcherWorkerFactory=this.fetcherWorkerFactory;
    for (let i = 0; i < this.num; i++) {
        var fetcherWorker = FetcherWorkerFactory(this.onFetcher.bind(this));
        this.fetcherWorkers.push(fetcherWorker);
    }
}
executorService.prototype.submit = function (requestTask) {
    this.requestTasks.push(requestTask);
    this.run();
}
module.exports = executorService
