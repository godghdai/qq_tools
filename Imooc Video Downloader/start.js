const fs = require('fs-extra');
const path = require('path');
const Imooc = require("./imooc");
const { VIDEO_QUALITY_MEDIUM } = require("./imooc/const");
const imooc = Imooc({ maxOccurs: 3 });
const { api, downloader } = imooc;

const remuxer = require("./core/common/remuxer");
const urlTools = require("./imooc/urlTools");

var start_url = "https://coding.imooc.com/lesson/180.html#mid=10847";
var params = urlTools.params(start_url);


async function main() {


    var { mid, cid } = params;
    var { relativeDirPath, mp4FileName } = await api.getMediaInfo(cid, mid);
    var { key, links } = await api.getM3u8Info(cid, mid, VIDEO_QUALITY_MEDIUM);
    var downloadDir = path.resolve(__dirname, relativeDirPath);

    fs.ensureDirSync(downloadDir);
    downloader.setParam({
        "key": key,
        "links": links,
        "downloadDir": downloadDir
    }
    ).start({
        "onComplete": function () {
            console.log("download finished");

            remuxer(downloadDir, path.join(path.resolve(downloadDir, "../"), mp4FileName));
            console.log("remuxer finished");
            fs.removeSync(downloadDir);

        }, "onProgress": function (progress) {
            console.log(progress);
        }
    })
}

main();

