use std::process::{Command, Stdio};

pub fn merge(filename: String) -> bool {
    let args = &["ffmpeg.exe", "-i", "video_temp.mp4", "-i", "audio_temp.mp4", "-c:v", "copy", "-c:a", "copy", filename.as_str()];
    run(args)
}

pub fn to_mp3(source_file_name: &String, filename: &String) -> bool {
    let args = &["ffmpeg.exe", "-i", source_file_name.as_str(), "-codec:a", "libmp3lame", "-b:a", "320k", "-f", "mp3", "-vn", filename.as_str()];
    run(args)
}

fn run(args: &[&str]) -> bool {
    let mut child =
        Command::new("cmd")
            .arg("/c")
            .args(args)
            .stdout(Stdio::piped())
            .spawn()
            .expect("Failed to execute command");

    let status = child.wait()
        .expect("failed to wait on child");

    status.success()
}