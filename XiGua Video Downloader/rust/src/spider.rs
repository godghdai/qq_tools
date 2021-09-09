use std::sync::Arc;

use headless_chrome::{
    protocol::{
        self,
    }, Browser, LaunchOptionsBuilder, Tab,
};
use failure::{Error, err_msg};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize, Debug)]
pub struct Media {
    pub url: String,
    pub bit: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum ResultType {
    //针对老版本，音视频没分离，只有一个文件 old_ver
    NoSplit,
    //新版本，音视频分离，有音频和视频两个文件 new_ver
    Split,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MediaResult {
    pub videos: Vec<Media>,
    pub audios: Vec<Media>,
    pub types: ResultType,
    pub title: String,
}

fn evaluate(tab: &Arc<Tab>, exp: &str) -> Result<Value, Error> {
    let json = tab.call_method(protocol::runtime::methods::Evaluate {
        expression: exp,
        return_by_value: true,
        generate_preview: true,
        silent: false,
        await_promise: false,
        include_command_line_api: false,
        user_gesture: false,
    });
    Ok(json?.result.value.ok_or(err_msg("evaluate error"))?)
}

pub fn xigua_spider(url: &str) -> Result<MediaResult, Error> {
    let browser = Browser::new(LaunchOptionsBuilder::default().headless(false).build().unwrap())?;
    let tab = browser.wait_for_initial_tab()?;
    tab.navigate_to(url)?;
    tab.wait_for_element("#player_default")?;
    let js = r"
        (function(){
            var result={};
            var dash=window._SSR_HYDRATED_DATA.anyVideo.gidInformation.packerData.video.videoResource.dash;
            if (dash.dynamic_video==undefined){
               result['type']='old_ver';
               let obj=dash.video_list;
               result['data']=Object.keys(obj).map(key=>obj[key]);
               return result;
            }
            result['type']='new_ver';
            result['data']=dash.dynamic_video;
            return result;
        })()
    ";
    let json = evaluate(&tab, js)?;
    let title = evaluate(&tab, "document.querySelector('.videoTitle h1').innerText")?;
    //tab.wait_until_navigated()?;
    let mut res = MediaResult {
        videos: vec![],
        audios: vec![],
        types: ResultType::Split,
        title: title.to_string(),
    };

    if json["type"].as_str() == Some("new_ver") {
        extract_item(&json, "dynamic_video_list", &mut res)?;
        extract_item(&json, "dynamic_audio_list", &mut res)?;
    } else {
        res.types = ResultType::NoSplit;
        let video_list = json["data"].as_array().unwrap();
        for video in video_list {
            let url2 = video["main_url"].to_string();
            res.videos.push(Media {
                url: (&url2[1..url2.len() - 1]).to_string(),
                bit: video["bitrate"].as_i64().unwrap(),
            })
        }
    }
    Ok(res)
}

fn extract_item(json: &serde_json::Value, keynames: &str, res: &mut MediaResult) -> Result<(), Error> {
    let lis = json["data"][keynames].as_array().unwrap();
    let stuffs = if keynames.eq("dynamic_audio_list") {
        &mut res.audios
    } else {
        &mut res.videos
    };
    for x in lis {
        let url2 = x["main_url"].to_string();
        stuffs.push(Media {
            url: (&url2[1..url2.len() - 1]).to_string(),
            bit: x["bitrate"].as_i64().unwrap(),
        })
    }
    Ok(())
}

