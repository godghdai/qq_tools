use chrono::Utc;
use humansize::{FileSize, file_size_opts};
use std::path::{Path, PathBuf};

#[derive(Debug)]
pub struct FilePaths {
    title: String,
    base_dir: String,
    mp3: String,
    audio_track: String,
    video_track: String,
    save: String,
}

fn main() {
    let title = "中国要".to_string();
    let base_dir=r"D:\temp".to_string();
    let rand=Utc::now().format("%Y%m%d%H%M%S").to_string();
    let jjj = FilePaths {
        title: format!("{}",title),
        base_dir: format!("{}",base_dir),
        mp3: format!(r"{}.mp3",title),
        audio_track: format!(r"{}\{}audio.mp4",base_dir,title),
        video_track: format!(r"{}\{}",base_dir,title),
        save: format!(r"{}\{}",base_dir,title),
    };

    let dt = Utc::now();
    println!("{}", dt.format("%Y%m%d%H%M%S").to_string());

    let mut title = title.replace("\"", "");
    println!("title:{}", title);
}

