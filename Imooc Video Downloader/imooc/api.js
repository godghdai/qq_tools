const fs = require('fs-extra');
const path = require('path');

const destm = require("./crypto/destm");
const m3u8Parser = require("./parser/m3u8");
const detailParser = require("./parser/detail");
const urlTools = require("./urlTools");

const { cache_path } = require("../config");

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

Api.prototype.get_detail_cache = async function (cid) {
    var detail,
        dir_path = path.resolve(cache_path, cid),
        detail_path = path.resolve(dir_path, "data.json");

    if (!fs.pathExistsSync(detail_path)) {
        fs.ensureDirSync(dir_path);
        detail = await this.get_detail(cid);
        fs.writeFile(detail_path, JSON.stringify(detail, null, 2));
        return detail;
    }
    return JSON.parse(fs.readFileSync(detail_path));
}

Api.prototype.get_detail_cache_dic = function (detail) {
    var dic = {};
    function _traverse(node, stack) {
        stack.push(node.title);
        if (node.mid) {
            dic[node.mid] = {
                "title": node.title,
                "path": path.join(...stack)
            };
        }
        if (!node.childs) return;
        for (let i = 0; i < node.childs.length; i++) {
            _traverse(node.childs[i], stack);
            stack.pop();
        }
    }

    var dic_path = path.resolve(cache_path, detail.course_id, "dic.json");
    if (!fs.pathExistsSync(dic_path)) {
        _traverse(detail, []);
        fs.writeFile(dic_path, JSON.stringify(dic, null, 2));
        return dic;
    }
    return JSON.parse(fs.readFileSync(dic_path));
}


Api.prototype.filterMediaInfo = function (detail, filterFun) {
    var list = [];
    function _traverse(node, stack) {
        stack.push(node.title);
        if (node.mid) {
            var item = {
                "title": node.title,
                "spath": path.join(...stack),
                "depth":stack.length,
                "mid": node.mid,
                "cid": node.course_id
            }
            if (filterFun(item))
                list.push(item);
        }
        if (!node.childs) return;
        for (let i = 0; i < node.childs.length; i++) {
            _traverse(node.childs[i], stack);
            stack.pop();
        }
    }
    _traverse(detail, []);
    return list;
}


Api.prototype.getMediaInfo = async function (cid, mid) {
    var detail = await this.get_detail_cache(cid);
    var detail_dic = this.get_detail_cache_dic(detail);
    return {
        "relativeDirPath": detail_dic[mid]["path"],
        "mp4FileName": `${detail_dic[mid]["title"]}.mp4`
    }
}

Api.prototype.getM3u8Info = async function (cid, mid, video_quality) {
    var m3u8_urls = await this.get_m3u8_urls(cid, mid);
    var m3u8_content = await this.get_m3u8_content(m3u8_urls[video_quality].url);
    var key = await this.get_m3u8_key(m3u8_content["key_url"]);
    return {
        "key": key,
        "links": m3u8_content["links"]
    }
}

module.exports = Api
