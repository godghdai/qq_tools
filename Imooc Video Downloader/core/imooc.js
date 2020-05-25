const Scheduler = require("./scheduler");
const RequestTask = require("./task/requestTask");
const DownloadTask = require("./task/downloadTask");
const Api = require("./api");
function Imooc() {
    if (!(this instanceof Imooc))
        return new Imooc();

    this.scheduler = new Scheduler();
}
Imooc.prototype.httpGet = function (url, callback) {
    this.scheduler.submit(RequestTask(url, callback));
}
Imooc.prototype.download = function (url, path, num, callback) {
    this.scheduler.submit(DownloadTask(url, path, num, callback));
}
const imooc = Imooc();
const httpGet = imooc.httpGet.bind(imooc);
Api.setHttpGet(httpGet);

module.exports = {
    "download": imooc.download.bind(imooc),
    ...Api
};

