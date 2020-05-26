const {join,resolve} = require('path');
module.exports = {
    cache_path:join(resolve(__dirname, "."), "cache")
}