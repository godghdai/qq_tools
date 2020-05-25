const BitMap = require("./common/bitmap");
const fs = require("fs");
const crypto = require("crypto");
const { download } = require("./imooc");

function Downloader(links, key, callback) {

    if (!(this instanceof Downloader))
        return new Downloader(links, key, callback);

    this.links = links;
    this.key = Buffer.from(key, "binary");;
    this.bitmap = BitMap(links.length - 1);
    this.callback = callback;
}

Downloader.prototype.start = function () {
    var self = this;
    var {links,key} = this;
    for (var index = 0; index < links.length; index++) {
        var { url, num } = links[index];
        download(url, `./download/10943/${num}.ts`, num, function (err, task, respone) {

            if (err) {
                console.log(err);
                return;
            }

            var crypted = Buffer.from(respone, "binary");;
            //fs.writeFileSync("./1_2222444.ts", crypted,"binary");
            var vi = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, num]);
            var decipher = crypto.createDecipheriv('aes-128-cbc', key, vi);
            decipher.setAutoPadding(true);
            var out = Buffer.concat([decipher.update(crypted), decipher.final()]);
            fs.writeFileSync(task.path, out);
            self.bitmap.set(task.num);
            if (self.bitmap.isAllSet()) {
                self.callback();
            }
        })
    }
}
module.exports = Downloader;
