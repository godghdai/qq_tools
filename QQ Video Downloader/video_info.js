const fs = require('fs-extra');
const path = require('path');
const {retryPromise} = require('./util');
const rp = require('request-promise');

const {cache_data_path,cache_info_path} = require('./config');

function read_video_info(url){
    var data = JSON.parse(fs.readFileSync(cache_data_path));
    var video_data_path=data[url]||"";
    if(video_data_path!=""){
        var info_path=path.join(cache_info_path,video_data_path);
        if(fs.existsSync(info_path)){
            return {
                "success":true,
                "data":JSON.parse(fs.readFileSync(info_path))
            };
        }
    }
    return {
        "success":false,
        "data":{}
    };
}

function write_video_info(url,new_data){
    var data = JSON.parse(fs.readFileSync(cache_data_path));
    var video_data_path=`${new Date().getTime()}.json`;
    data[url]=video_data_path;
    fs.writeFileSync(cache_data_path, JSON.stringify(data, null, 5));
    fs.writeFileSync(path.join(cache_info_path,video_data_path), JSON.stringify(new_data, null, 5));
}

async function load_video_info(start_url){
    var {success,data}=read_video_info(start_url);
    if(!success){
       data= await retryPromise(3,1000,path.resolve(__dirname,"./get_video_info.js"),start_url);
       write_video_info(start_url,data);
    }
    return data;    
}

async function get_ts_urls(base_dir,link){
    var m3u8_urls,base_dir_one=path.resolve(base_dir,"./",link.num+"");
    await fs.ensureDir(base_dir_one);
    var m3u8_urls = await retryPromise(3,1000,path.resolve(__dirname,"./get_m3u8_url.js"),link.url);
    var ts_urls= await parse_m3u8(base_dir_one,m3u8_urls.pop().url);
    return ts_urls.sort((a,b)=>{
        if(a.num>b.num) return -1;
        if(a.num<b.num) return 1;
        return 0;
    })
}


async function parse_m3u8(base_dir, m3u8_url) {
    var RegTs = /\d+\.ts/;
    var m3u8_text = await rp.get(m3u8_url);
    var ts_baseUrl = m3u8_url.substring(0, m3u8_url.lastIndexOf("/") + 1);
    return m3u8_text.trim().split("\n").filter(a => RegTs.test(a)).map((item, index) => {
        return {
            url: ts_baseUrl + item,
            path:path.resolve(base_dir,"./",(index + 1) + ".ts"),
            num: index + 1
        };
    });
}

module.exports = {
    load_video_info,
    get_ts_urls
}