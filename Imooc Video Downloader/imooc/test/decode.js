const { decryptTsFile } = require('../../core/crypto/hls');
const fs = require('fs-extra');
const path = require('path');
const remuxer = require("../../core/common/remuxer");
/*
var out = decryptTsFile(Buffer.from(respone, "binary"), key, attach.num);
fs.writeFileSync(attach.path, out);
*/

var base_dir = "F:/puppeteer/tencentTools/muke/cache/Google资深工程师深度讲解Go语言/第4章 面向“对象”/4-2 包和封装";
/*
var key = fs.readFileSync(path.resolve(base_dir, `m3u8_key.bin`), "binary");
var key_buffer = Buffer.from(key, "binary");
for (let index = 0; index < 91; index++) {
    var encryptData = fs.readFileSync(path.resolve(base_dir, `${index}.ts`));
    var out = decryptTsFile(Buffer.from(encryptData, "binary"), key_buffer, 0);
    fs.writeFileSync(path.resolve(base_dir,"abc", `${index}.ts`), out);
}
*/
remuxer(path.resolve(base_dir,"abc"),path.resolve(base_dir,"abc","all.mp4"),function(){});

function writeToFile(downloadDir, fileName, buf) {
    var savePath = path.resolve(downloadDir, fileName);
    if (fileName == "m3u8_key.bin") {
        fs.writeFileSync(savePath, buf, "binary");
    } else fs.writeFileSync(savePath, buf);

}