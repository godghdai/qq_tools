const emptyFun = () => { };
function DownloadTask(url, path, num, callback) {
    if (!(this instanceof DownloadTask))
        return new DownloadTask(url, path, num, callback);
    this.url = url;
    this.path = path;
    this.num = num;
    this.callback = callback || emptyFun;
}
DownloadTask.prototype.done = function (err, requestTask, data) {
    this.callback(err, requestTask, data);
}
module.exports = DownloadTask;