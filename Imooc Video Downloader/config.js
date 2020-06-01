const {join,resolve} = require('path');
module.exports = {
    "cache_path":join(resolve(__dirname, "."), "cache"),
    "data_path":join(resolve(__dirname, "."), "data"),
}