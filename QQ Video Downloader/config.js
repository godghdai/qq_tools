const {join,resolve} = require('path');
module.exports = {
    chrome_path:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ffmepg_path:join(resolve(__dirname, "."), "ffmpeg.exe"),
    cache_data_path:join(resolve(__dirname, "."), "cache","data.json"),
    cache_info_path:join(resolve(__dirname, "."), "cache","info")
}
