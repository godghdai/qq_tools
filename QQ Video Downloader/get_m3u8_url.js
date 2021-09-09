const puppeteer = require('puppeteer-core');
const {chrome_path} = require('./config');

async function open_chrome(){
    var browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        executablePath: chrome_path,
        defaultViewport: null,
    });
    return browser;
}

function extract_info(text) {
    var json = JSON.parse(text),
    vinfo = JSON.parse(json["vinfo"]),
    ui = vinfo.vl.vi[0].ul.ui;
    return ui;
}

async function get_m3u8_urls(episode_url) {
    var browser=await open_chrome();
    var page = await browser.newPage();
    var promise = new Promise(function(reslove, reject) {
        page.on('response', async(res) => {
            if (res.url().startsWith("https://vd.l.qq.com/proxyhttp")) {
                var text = await res.text();
                reslove(extract_info(text));
            }
        });

    });
    await page.goto(episode_url);
    var m3u8_urls = await promise;
    await browser.close();
    return m3u8_urls;
}

async function start(){
    var [,,url]=process.argv;
    var info=await get_m3u8_urls(url);
    process.send(info);
    process.exit(0);
}

start().catch(err=>{
    console.log(err);
    process.exit(1);  
});

