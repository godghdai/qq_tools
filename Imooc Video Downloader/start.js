const fs = require('fs-extra');
const path = require('path');
const Imooc = require("./imooc");
const { log } = require("./core/util/log");
const imooc = Imooc({ maxOccurs: 3 });
const { api,downloader } = imooc;
const {cache_path} = require("./config");

const remuxer = require("./core/common/remuxer");
const urlTools = require("./imooc/urlTools");

var start_url = "https://coding.imooc.com/lesson/180.html#mid=10855";
var params = urlTools.params(start_url);
/*
api.get_detail(params.cid, function (err, data) {
    console.log(data)
});
return;
*/

const VIDEO_QUALITY = {
    "HIGTH": 0,
    "MEDIUM": 1,
    "LOW": 2
};


async function get_detail(cid){
    var detail,
    dir_path=path.resolve(cache_path,cid),
    detail_path=path.resolve(dir_path,"data.json");
     
    if(!fs.pathExistsSync(detail_path)){
        fs.ensureDirSync(dir_path);
        detail=await api.get_detail(cid);
        fs.writeFile(detail_path,JSON.stringify(detail,null,2));
        return detail;
    }
    return JSON.parse(fs.readFileSync(detail_path));
}


function get_detail_dic(detail){
    var dic={};
    function _traverse(node,stack){
        stack.push(node.title);
        if(node.mid){
            dic[node.mid]={
                "title":node.title,
                "path":path.join(...stack)
            };
        }
        if(!node.childs) return;      
        for (let i = 0; i < node.childs.length; i++) {
            _traverse(node.childs[i],stack);
            stack.pop();
        }
    }

    var dic_path=path.resolve(cache_path,detail.course_id,"dic.json");
    if(!fs.pathExistsSync(dic_path)){
        _traverse(detail,[]);
        fs.writeFile(dic_path,JSON.stringify(dic,null,2));
        return dic;
    }
    return JSON.parse(fs.readFileSync(dic_path));
   
}

async function main() {

    var m3u8_urls, m3u8_url, m3u8_content, key;
    var {mid,cid}=params;
    var detail=await get_detail(cid);
    var detail_dic=get_detail_dic(detail);
    var saveDir=detail_dic[mid]["path"];
    var saveFileName=detail_dic[mid]["title"];
    console.log(detail_dic[mid]);
  
    m3u8_urls = await api.get_m3u8_urls(cid, mid);

    m3u8_url = m3u8_urls[VIDEO_QUALITY.MEDIUM].url;
    m3u8_content = await api.get_m3u8_content(m3u8_url);
    var { key_url, links } = m3u8_content;
    key = await api.get_m3u8_key(key_url);
    downloader.setDecryptKey(key);
    downloader.setLinks(links);
    var downloadDir=path.resolve(cache_path,saveDir);
    fs.ensureDirSync(downloadDir);
    downloader.setDownloadDirPath(downloadDir);
    downloader.start({"onComplete":function(){
        console.log("download finished");

        remuxer(downloadDir,path.join(path.resolve(downloadDir,"../"),`${saveFileName}.mp4`),function(){
            console.log("remuxer finished")
        })

    },"onProgress":function(progress){
        console.log(progress);
    }})
}

main();

