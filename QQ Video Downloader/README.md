# 腾讯视频下载脚本
## 如何使用
1. 修改config里面chrome路径
    - 用chrome来抓取动态网页信息
2. 修改config里面ffmpeg路径 ：
    - 用ffmpeg来连接所有ts文件生成mp4 
    
```js
const {join,resolve} = require('path');
module.exports = {
    chrome_path:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ffmepg_path:join(resolve(__dirname, "."), "ffmpeg.exe"),
    cache_data_path:join(resolve(__dirname, "."), "cache","data.json"),
    cache_info_path:join(resolve(__dirname, "."), "cache","info")
}
```
