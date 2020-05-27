const emptyFun = () => { };
function DownloadTask(url, attach, doneFun) {
    if (!(this instanceof DownloadTask))
        return new DownloadTask(url, attach, doneFun);
    this.url = url;
    this.attach = attach;
    this.doneFun = doneFun || emptyFun;
}
DownloadTask.prototype.done = function (err, data) {
    this.doneFun(err, this, data);
}
module.exports = DownloadTask;