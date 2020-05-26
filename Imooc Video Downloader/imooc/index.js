const ExecutorService = require("../core/executorService");
const FetcherWorker = require("./fetcherWorker");
const RequestTask = require("../core/task/requestTask");
const Downloader = require("./downloader");

const Api = require("./api");
function Imooc(config) {
    if (!(this instanceof Imooc))
        return new Imooc(config);

    this.maxOccurs = config.maxOccurs || 3;
    this.executorService = new ExecutorService(this.maxOccurs, FetcherWorker);
    this.api = new Api(this);
    this.downloader = new Downloader(this);
}
Imooc.prototype.httpGet = function (url, doneFun, type) {
    this.executorService.submit(RequestTask(url, doneFun, type));
}
Imooc.prototype.submit = function (task) {
    this.executorService.submit(task);
}
module.exports = Imooc;

