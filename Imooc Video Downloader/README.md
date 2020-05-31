# 慕课网视频下载脚本
## 如何使用
```
修改config.js配置cookie：
```
## 实现难点
1. ts视频文件解密
```js
const crypto = require("crypto");
function decryptTsFile(crypted, key, num) {
    var vi = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, num]);
    var decipher = crypto.createDecipheriv('aes-128-cbc', key, vi);
    decipher.setAutoPadding(true);
    return Buffer.concat([decipher.update(crypted), decipher.final()]);
}
```

2. 使用mux.js来实现多个ts文件的合并，并转换为MP4
```js
function remuxer(sourse, target) {
    var transmuxer = new mux.mp4.Transmuxer();
    transmuxer.on('data', (segment) => {
        let data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
        data.set(segment.initSegment, 0);
        data.set(segment.data, segment.initSegment.byteLength);
        fs.appendFileSync(target, data);
    })
    var maxIndex = getMaxIndex(sourse);
    for (let index = 0; index <= maxIndex; index++) {
        var bytes = fs.readFileSync(path.resolve(sourse, `${index}.ts`));
        transmuxer.push(new Uint8Array(bytes));
    }
    transmuxer.flush();
}
```


## Demo
```js

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


```
