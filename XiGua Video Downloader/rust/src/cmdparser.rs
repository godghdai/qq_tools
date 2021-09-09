use clap::{App, Arg};

#[derive(Debug)]
pub enum Quality {
    HIGH,
    MEDIUM,
    LOW,
}
impl Quality{
    pub fn get_index(&self,len:usize)->usize{
        match self {
            Quality::HIGH => len - 1,
            Quality::LOW => 0,
            Quality::MEDIUM => len / 2
        }    }
}

impl From<String> for Quality{
    fn from(key: String) -> Self {
        if key.eq("high"){
            Quality::HIGH
        }else if key.eq("low"){
            Quality::LOW
        }else{
            Quality::MEDIUM
        }
    }
}

#[derive(Debug)]
pub struct CliParams {
    pub url: String,
    pub only_audio: bool,
    pub filename: Option<String>,
    pub quality: Quality,
}

impl Default for CliParams {
    fn default() -> Self {
        CliParams {
            url: "".to_string(),
            only_audio: false,
            filename: None,
            quality: Quality::MEDIUM,
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
            .short("a")
            .help("只下载音频文件"))
        .arg(Arg::with_name("quality")
            .long("quality")
            .short("q")
            .possible_values(&["high", "medium", "low"])
            .takes_value(true)
            .default_value("medium")
            //.hide_possible_values(true)
            .help("设置下载的视频质量"))
        .get_matches();

    if let Some(url) = matches.value_of("URL") {
        params.url = url.to_string();
    }

    if matches.is_present("novideo"){
        params.only_audio=true;
    }

    if let Some(filename) = matches.value_of("FILENAME") {
        params.filename = Some(filename.to_string());
    }
    if let Some(quality) = matches.value_of("quality") {
        params.quality = quality.to_string().into();
    }
    params
}