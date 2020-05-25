const {join,resolve} = require('path');
module.exports = {
    cache_data_path:join(resolve(__dirname, "."), "cache","data.json"),
    cache_info_path:join(resolve(__dirname, "."), "cache","info")
}