use clap::{App, Arg};
use std::str::FromStr;

#[derive(Debug)]
pub enum Quality {
    HIGH,
    MEDIUM,
    LOW,
}

impl Quality {
    pub fn get_index(&self, len: usize) -> usize {
        match self {
            Quality::HIGH => len - 1,
            Quality::LOW => 0,
            Quality::MEDIUM => len / 2
        }
    }
}

impl From<String> for Quality {
    fn from(key: String) -> Self {
        if key.eq("high") {
            Quality::HIGH
        } else if key.eq("low") {
            Quality::LOW
        } else {
            Quality::MEDIUM
        }
    }
}

#[derive(Debug)]
pub struct CliParams {
    pub url: String,
    pub only_audio: bool,
    pub filename: Option<String>,
    pub video_quality: Quality,
    pub audio_quality: Quality,
    pub thread_nums: i32,
}

impl Default for CliParams {
    fn default() -> Self {
        CliParams {
            url: "".to_string(),
            only_audio: false,
            filename: None,
            video_quality: Quality::MEDIUM,
            audio_quality: Quality::HIGH,
            thread_nums: 3,
        }
    }
}

fn is_number(v: String) -> Result<(), String> {
    match i32::from_str(&*v){
        Ok(_) => {return Ok(());}
        Err(_) => {
            Err(String::from("必须为数字！！"))
        }
    }
}

pub fn cli() -> CliParams {
    let mut params = CliParams::default();
    let matches = App::new("西瓜视频下载工具")
        .help_message("命令使用说明")
        .version_message("版本信息")
        .version("0.1.0")
        .author("godghdai@gmail.com")
        .about("https://github.com/godghdai")
        .arg(Arg::with_name("URL")
            .required(true)
            .index(1)
            .help("需要下载的网址"))
        .arg(Arg::with_name("FILENAME")
            .long("output")
            .short("o")
            .takes_value(true)
            .help("保存的文件名"))
        .arg(Arg::with_name("novideo")
            .long("novideo")
            .short("n")
            .help("只下载音频文件"))
        .arg(Arg::with_name("video_quality")
            .long("video_quality")
            .short("v")
            .possible_values(&["high", "medium", "low"])
            .takes_value(true)
            .default_value("medium")
            //.hide_possible_values(true)
            .help("设置下载的视频质量"))
        .arg(Arg::with_name("audio_quality")
            .long("audio_quality")
            .short("a")
            .possible_values(&["high", "medium", "low"])
            .takes_value(true)
            .default_value("high")
            .help("设置下载的音频质量"))
        .arg(Arg::with_name("thread_nums")
            .long("thread_nums")
            .short("t")
            .takes_value(true)
            .validator(is_number)
            .default_value("3")
            .help("设置并发数"))
        .get_matches();

    if let Some(url) = matches.value_of("URL") {
        params.url = url.to_string();
    }
    if let Some(filename) = matches.value_of("FILENAME") {
        params.filename = Some(filename.to_string());
    }

    if let Some(quality) = matches.value_of("video_quality") {
        params.video_quality = quality.to_string().into();
    }

    if let Some(quality) = matches.value_of("audio_quality") {
        params.audio_quality = quality.to_string().into();
    }

    if let Some(count) = matches.value_of("thread_nums") {
        params.thread_nums=i32::from_str(count).unwrap();
    }

    if matches.is_present("novideo") {
        params.only_audio = true;
    }
    params
}