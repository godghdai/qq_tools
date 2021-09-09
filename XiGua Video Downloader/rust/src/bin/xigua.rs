use std::fs::{remove_file};
use std::cmp::Ordering;
use failure::{Error};
use tokio::runtime::Runtime;

use crate::cmdparser::{cli, CliParams};
use crate::downloader::download;
use xigua::{spider::{
    self, Media,ResultType
}, ffmpeg, downloader, cmdparser};


fn compare_fun(a: &Media, b: &Media) -> Ordering {
    a.bit.cmp(&b.bit)
}

fn get_download_url(medias: &mut Vec<Media>, param: &CliParams) -> String {
    medias.sort_by(compare_fun);
    let index = param.quality.get_index(medias.len());
    let url = &medias.get(index).unwrap().url;
    if url.starts_with("http") {
        return url.clone();
    }
    format!("https:{}", url)
}

async fn run(param: CliParams) -> Result<(), Error> {
    let mut result = spider::xigua_spider(&param.url.as_str())?;
    let mut title = result.title.replace("\"", "");
    println!("title:{}", title);
    if let Some(filename) = &param.filename {
        title = filename.clone();
    }
    println!("filename:{}", title);
    println!("{:#?}", param);
    match result.types {
        ResultType::NoSplit => {
            let video_url = get_download_url(&mut result.videos, &param);
            println!("video_url::{}", video_url);
            let save_filename = format!("{}.mp4", title);
            let mp3_filename = format!("{}.mp3", title);
            download(&video_url, &save_filename).await?;
            if param.only_audio {
                ffmpeg::to_mp3(&save_filename, &mp3_filename);
                remove_file(&save_filename)?;
            }
        }
        ResultType::Split => {
            let video_url = get_download_url(&mut result.videos, &param);
            let audio_url = get_download_url(&mut result.audios, &param);
            println!("video_url::{}", video_url);
            println!("audio_url::{}", audio_url);
            if !param.only_audio {
                download(&video_url, &"video_temp.mp4".to_string()).await?;
            }

            download(&audio_url, &"audio_temp.mp4".to_string()).await?;

            if !param.only_audio {
                ffmpeg::merge(title + ".mp4");
                remove_file("video_temp.mp4")?;
                remove_file("audio_temp.mp4")?;
            } else {
                let mp3_filename = format!("{}.mp3", title);
                ffmpeg::to_mp3(&"audio_temp.mp4".to_string(), &mp3_filename);
                remove_file("audio_temp.mp4")?;
            }
        }
    }
    Ok(())
}


fn main() {
    let params = cli();
    let rt = Runtime::new().unwrap();
    rt.block_on(async move {
        run(params).await.unwrap();
    });
}


