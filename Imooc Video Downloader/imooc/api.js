const destm = require("./crypto/destm");
const m3u8Parser = require("./parser/m3u8");
const detailParser = require("./parser/detail");
const urlTools = require("./urlTools");

function Api(imooc) {
    this.imooc = imooc;
}

Api.prototype.get_m3u8_urls = async function (cid, mid) {
    return new Promise((resolve, reject) => {
        this.imooc.httpGet(urlTools.m3u8_urls(cid, mid), function (err, json) {
            if (!err)
                return resolve(
                    m3u8Parser.m3u8_urls(
                        destm(json.data.info)
                    )
                );
            reject(err);
        }, "json");
    });
}

Api.prototype.get_m3u8_content = async function (url) {
    return new Promise((resolve, reject) => {
        this.imooc.httpGet(url, function (err, json) {
            if (!err)
                return resolve(
                    m3u8Parser.m3u8_content(
                        destm(json.data.info)
                    )
                );
            reject(err);
        }, "json");
    });
}

Api.prototype.get_m3u8_key = async function (url) {
    return new Promise((resolve, reject) => {
        this.imooc.httpGet(url, function (err, json) {
            if (!err)
                return resolve(
                    destm(json.data.info)
                );
            reject(err);
        }, "json");
    });
}

Api.prototype.get_detail = async function (cid) {
    return new Promise((resolve, reject) => {
        this.imooc.httpGet(urlTools.detail_url(cid), function (err, data) {
            if (!err)
                return resolve(
                    detailParser(data)
                );
            reject(err);
        }, "html");
    });
}
module.exports = Api
