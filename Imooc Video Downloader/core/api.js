const destm = require("./common/destm");
const m3u8Parser = require("./parser/m3u8");
const detail_parse = require("./parser/detail");
const urlTools = require("./util/urlTools");

function Api() { 
    
}
var httpGet = null;
Api.setHttpGet = function (_httpGet) {
    httpGet = _httpGet;
}
Api.get_m3u8_urls = function (cid, mid, callback) {
    httpGet(urlTools.m3u8h5(cid, mid), function (err, json) {
        if (!err) {
            callback(null, m3u8Parser.m3u8h5(destm(json.data.info)));
        } else callback(err);
    });
}
Api.get_m3u8_content = function (url, callback) {
    httpGet(url, function (err, json) {
        if (!err) {
            callback(null, m3u8Parser.m3u8(destm(json.data.info)));
        } else callback(err);
    });
}

Api.get_m3u8_key = function (url, callback) {
    httpGet(url, function (err, json) {
        if (!err) {
            callback(null, destm(json.data.info));
        } else callback(err);
    });
}

module.exports = Api
