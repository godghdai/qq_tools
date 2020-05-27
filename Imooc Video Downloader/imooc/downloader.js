const BitMap = require("../core/common/bitmap");
const DownloadTask = require("../core/task/downloadTask");
const fs = require('fs-extra');
const { decryptTsFile } = require('../core/crypto/hls');
const path = require('path');

function Downloader(imooc) {

    if (!(this instanceof Downloader))
        return new Downloader();

    this.imooc = imooc;
    this.links = null;
    this.count = 0;
    this.total = 0;
    this.key = null;
    this.downloadDirPath = null;
    this.bitmap = null;
}


Downloader.prototype.setParam = function ({ key, links, downloadDir }) {

    this.key = Buffer.from(key, "binary");

    this.links = links;
    this.total = links.length;
    this.count = 0;
    this.bitmap = BitMap(links.length - 1);

    this.downloadDirPath = downloadDir;
    return this;
}

Downloader.prototype.start = function ({ onComplete, onProgress }) {
    var self = this;
    var { links, key, downloadDirPath } = this;

    if (!key) return;
    if (!links) return;
    if (!downloadDirPath) return;

    for (var index = 0; index < links.length; index++) {
        var { url, num } = links[index];
        var attach = {
            "path": path.join(downloadDirPath, `${num}.ts`),
            "num": num
        }
        var task = DownloadTask(url, attach,
            function (err, task, respone) {
                if (err) {
                    console.log(err);
                    return;
                }
                var attach = task.attach;
                var out = decryptTsFile(Buffer.from(respone, "binary"), key, attach.num);
                fs.writeFileSync(attach.path, out);
                self.bitmap.set(attach.num);
                self.count++;
                if (self.bitmap.isAllSet()) {
                    onComplete();
                }
                onProgress((self.count / self.total).toFixed(2) * 100);
            });
        self.imooc.submit(task);

    }
}

module.exports = Downloader;
