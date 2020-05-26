const emptyFun = () => { };
function DownloadTask(url, attach, doneFun, progressFun) {
    if (!(this instanceof DownloadTask))
        return new DownloadTask(url, attach, doneFun, progressFun);
    this.url = url;
    this.attach = attach;
    this.doneFun = doneFun || emptyFun;
    this.progressFun = progressFun || emptyFun;
}

DownloadTask.prototype.onProgress = function (progress) {
    this.progressFun(this, progress);
}
DownloadTask.prototype.done = function (err, data) {
    this.doneFun(err, this, data);
}
module.exports = DownloadTask;