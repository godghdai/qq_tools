const base_url = "https://coding.imooc.com/lesson/";
const reg_learn_list = /https:\/\/coding\.imooc\.com\/learn\/list\/(?<cid>\d+)\.html/;
const reg_lesson = /https:\/\/coding\.imooc\.com\/lesson\/(?<cid>\d+)\.html#mid=(?<mid>\d+)/;

function m3u8_urls(cid, mid, ssl = 1, cdn = "aliyun1") {
    return `${base_url}m3u8h5?mid=${mid}&cid=${cid}&ssl=${ssl}&cdn=${cdn}`;
}
function mediainfo(cid, mid, ) {
    return `${base_url}ajaxmediainfo?mid=${mid}&cid=${cid}`;
}
function chapterlist(v, mid) {
    return `${base_url}ajaxchapterlist?v=${v}&mid=${mid}`;
}

function detail_url(cid){
    return `https://coding.imooc.com/learn/list/${cid}.html`;
}

function params(url) {
    if (reg_learn_list.test(url)) {
        return {
            ...url.match(reg_learn_list).groups
        };
    }
    if (reg_lesson.test(url)) {
        return {
            ...url.match(reg_lesson).groups
        };
    }
}

function checkUrlType(url){
    
}

module.exports = {
    m3u8_urls,
    mediainfo,
    chapterlist,
    detail_url,
    params
};