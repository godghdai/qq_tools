use std::fs::{remove_file};
use std::cmp::Ordering;
use failure::{Error};
use tokio::runtime::Runtime;

use crate::cmdparser::{cli, CliParams};
use crate::downloader::download;
use xigua::{spider::{
    self, Media, ResultType,
}, ffmpeg, downloader, cmdparser};

enum MediaType{
    VIDEO,
    AUDIO,
}

fn compare_fun(a: &Media, b: &Media) -> Ordering {
    a.bit.cmp(&b.bit)
}

fn get_download_url(medias: &mut Vec<Media>, param: &CliParams, media_type:MediaType) -> String {
    medias.sort_by(compare_fun);
    let quality=match media_type {
        MediaType::VIDEO => &param.video_quality,
        MediaType::AUDIO => &param.audio_quality
    };
    let index = quality.get_index(medias.len());
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
            let video_url = get_download_url(&mut result.videos, &param,MediaType::VIDEO);
            println!("video_url::{}", video_url);
            let save_filename = format!("{}.mp4", title);
            let mp3_filename = format!("{}.mp3", title);
            download(&video_url,param.thread_nums, &save_filename).await?;
            if param.only_audio {
                ffmpeg::to_mp3(&save_filename, &mp3_filename);
                remove_file(&save_filename)?;
            }
        }
        ResultType::Split => {
            let video_url = get_download_url(&mut result.videos, &param,MediaType::VIDEO);
            let audio_url = get_download_url(&mut result.audios, &param,MediaType::AUDIO);
            println!("video_url::{}", video_url);
            println!("audio_url::{}", audio_url);

            let video_temp_name=String::from("video_temp.mp4");
            let audio_temp_name=String::from("audio_temp.mp4");
            if !param.only_audio {
                download(&video_url,param.thread_nums, &video_temp_name).await?;
            }

            download(&audio_url,param.thread_nums, &audio_temp_name).await?;

            if !param.only_audio {
                ffmpeg::merge(title + ".mp4");
                remove_file(&video_temp_name)?;
                remove_file(&audio_temp_name)?;
            } else {
                let mp3_filename = format!("{}.mp3", title);
                ffmpeg::to_mp3(&audio_temp_name, &mp3_filename);
                remove_file(&audio_temp_name)?;
            }
        }
    }
    Ok(())
}


fn main() {
    let params = cli();
    match Runtime::new() {
        Ok(runtime) => {
            runtime.block_on(async move {
                if let Err(err) = run(params).await {
                    println!("{}", err);
                };
            });
        }
        Err(err) =>  println!("{}", err)
    }
}


