const fs = require('fs-extra');
const path = require('path');
const Imooc = require("./imooc");
const { VIDEO_QUALITY_MEDIUM } = require("./imooc/const");
const imooc = Imooc({ maxOccurs: 3 });
const { api, downloader } = imooc;
const remuxer = require("./core/common/remuxer");
const urlTools = require("./imooc/urlTools");

function getDownloaderPromise(downloadDir, key, links) {
    return new Promise((resolve, reject) => {
        fs.ensureDirSync(downloadDir);
        downloader.setParam({
            "key": key,
            "links": links,
            "downloadDir": downloadDir
        }
        ).start({
            "onComplete": function (err) {
                if (err) {
                    console.log(err);
                    reject(err);
                    return;
                }
                resolve(true);
            }, "onProgress": function (progress) {
                console.log(progress);
            }
        })
    });
}

async function downloadOneMedia(cid, mid) {
    var { relativeDirPath, mp4FileName } = await api.getMediaInfo(cid, mid);
    var { key, links } = await api.getM3u8Info(cid, mid, VIDEO_QUALITY_MEDIUM);
    var downloadDir = path.resolve(__dirname, relativeDirPath);
    await getDownloaderPromise(downloadDir, key, links);
    console.log("download finished");
    remuxer(downloadDir, path.join(path.resolve(downloadDir, "../"), mp4FileName));
    console.log("remuxer finished");
    fs.removeSync(downloadDir);
}

async function main(url) {

    var params = urlTools.params(url);
    var { cid } = params;
    var detail = await api.get_detail_cache(cid);
    var medias = api.filterMediaInfo(detail, item => /第2章 基础语法/.test(item.spath));
  
    if (medias.length == 0) {
        console.log("medias length must be >0");
        return;
    }

    for (let i = 0; i < medias.length; i++) {
        const { cid, mid, spath } = medias[i];
        console.log(`start download ${spath}`);
        await downloadOneMedia(cid, mid);
        console.log(`${spath} download finished`);
    }
    console.log("all download finished");
}

main("https://coding.imooc.com/lesson/180.html#mid=10847");



