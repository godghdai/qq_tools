const { get_m3u8_urls, get_m3u8_content, get_m3u8_key } = require("./core/imooc");
const Downloader = require("./core/downloader");
const remuxer = require("./core/common/remuxer");
const urlTools = require("./core/util/urlTools");

//var start_url = "https://coding.imooc.com/lesson/228.html#mid=16322";
var start_url = "https://coding.imooc.com/lesson/180.html#mid=10943";
var params = urlTools.params(start_url);

get_m3u8_urls(params.cid, params.mid, function (err, data) {
    if (err) {
        console.log(err);
        return;
    }

    get_m3u8_content(data[1].url, function (err, data) {

        if (err) {
            console.log(err);
            return;
        }

        var key_url = data["key_url"];
        var links = data["links"];

        get_m3u8_key(key_url, function (err, key) {
            if (err) {
                console.log(err);
                return;
            }
            
            Downloader(links, key, function () {
                
                console.log("下载完成!!")
                remuxer(`./download/10943/`,`./download/10943/all.mp4`,function(){
                    console.log("合并完成!!")
                });
                
            }).start();

        });



    })
});
return;

