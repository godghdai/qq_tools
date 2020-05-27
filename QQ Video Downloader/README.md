# 腾讯视频下载脚本
## 如何使用
1. 修改config里面chrome路径
2. 修改config里面ffmpeg路径

## config.js
```js
const {join,resolve} = require('path');
module.exports = {
    chrome_path:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ffmepg_path:join(resolve(__dirname, "."), "ffmpeg.exe"),
    cache_data_path:join(resolve(__dirname, "."), "cache","data.json"),
    cache_info_path:join(resolve(__dirname, "."), "cache","info")
}
```

## 抓取动态网页
```
用puppeteer来操控chrome来实现抓取
```

## 使用ffmpeg来合并所有ts文件，并生成mp4 
```
ffmpeg -i "concat:1.ts|2.ts" -acodec copy -vcodec copy -absf aac_adtstoasc all.mp4
```




