use chrono::Utc;
use crate::cmdparser::CliParams;
use humansize::{FileSize, file_size_opts};
use std::path::{Path, PathBuf};


fn sends(title: &String, param: &CliParams) {
    let dt = Utc::now();
    println!("{}", dt.format("%Y-%m-%d %H:%M:%S").to_string());

    let mut title = title.replace("\"", "");
    println!("title:{}", title);
    if let Some(filename) = &param.filename {
        title = filename.clone();
    }
}

fn filesize() {
    let size = 1000;
    println!("Size is {}", size.file_size(file_size_opts::DECIMAL).unwrap());
    println!("Size is {}", size.file_size(file_size_opts::BINARY).unwrap());
    println!("Size is {}", size.file_size(file_size_opts::CONVENTIONAL).unwrap());
}