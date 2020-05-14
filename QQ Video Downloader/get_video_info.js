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

async function get_video_info(url){
    var browser=await open_chrome();
    var page = await browser.newPage();
    await page.goto(url);
    var info = await page.evaluate(() =>({
        "vid":COVER_INFO.id,
        "ids":COVER_INFO.video_ids,
        "title":document.title
    }));
    
    var baseUrl = url.substring(0, url.lastIndexOf("/") + 1);

    await page.close();
    await browser.close();

    return {
        "vid":info.vid,
        "title":info.title,
        "links":info.ids.map((id, index) => {
            return {
                "num": index + 1,
                "url": baseUrl + id + ".html"
            }
        })
    };
    
}

async function get_video_info_ver2(url){
    var browser=await open_chrome();
    var page = await browser.newPage();
    await page.goto(url);
    var info = await page.evaluate(() =>{

        var result=[];
        var tabs=Array.from(document.querySelectorAll(".episode_filter_items .item"));

        var title=document.querySelector(".player_title").innerText;
        var host_url=window.location.origin;
        var num=1;
        function extract_data(){
            var items=Array.from(document.querySelectorAll(".mod_episode span"));
            for (let item_index = 0; item_index < items.length; item_index++) {
                var a=items[item_index].querySelector("a");
                result.push({
                    "num":num++,
                    "url": `${host_url}${a.getAttribute("href")}`,
                    "title":a.innerText
                })
               
            }
        }
    
        if(tabs.length==0){
            extract_data();
            return {
                "title":title,
                "links":result
            };
        }
       
        for (let tab_index = 0; tab_index < tabs.length; tab_index++) {
            var tab = tabs[tab_index];
            tab.click();
            extract_data();
        }
        return {
            "title":title,
            "links":result
        };

    });
    
    
    await page.close();
    await browser.close();

    return info;    
    
}


async function start(){
    var [,,url]=process.argv;
    var info=await get_video_info_ver2(url);
    process.send(info);
    process.exit(0);
}

start().catch(err=>{
    console.log(err);
    process.exit(1);  
});

