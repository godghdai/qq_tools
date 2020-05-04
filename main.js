
const {resolve}=require('path');
const fs = require('fs-extra');
const merge = require('./merge_to_mp4');

const {load_video_info,get_ts_urls} = require('./video_info');
const {download} = require('./util');

async function main({start_url,base_dir}){
    var num=16;
    var video_info=await load_video_info(start_url);
    if(!base_dir){
        base_dir=resolve(__dirname, ".",video_info.title);
    }
 
    var ts_links=await get_ts_urls(base_dir,video_info.links[num-1]);
    await download(ts_links,5,3);
    
    var ts_file_path = resolve(base_dir, num+"");
    var mp4_file_path = resolve(base_dir, `${num}.mp4`);
    await merge(ts_file_path, mp4_file_path);
    console.log("合并ts成功");
    fs.removeSync(ts_file_path);
    console.log("下载完成");
}

main({
    "start_url":"https://v.qq.com/x/cover/mzc00200q06w7zx/l0033e3vjlf.html"
});



