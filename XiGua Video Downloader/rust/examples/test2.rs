use std::path::{PathBuf, Path};
use bytes::{BytesMut, BufMut};
use std::io;
use std::fs::File;
use encoding::all::{GB18030, GBK, UTF_16LE, UTF_16BE};
use encoding::{DecoderTrap, EncoderTrap, Encoding};
use std::io::Read;
use std::fmt::{self, Formatter, Display, UpperHex};
use std::process::{Command,Stdio};

struct MyString {
    data: Vec<u8>,
}

impl fmt::Display for MyString {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let mut hex = String::new();
        for i in self.data.iter() {
            hex.push_str(&*format!("{:X} ", i));
        }
        write!(f, "{}", hex)
    }
}


fn main() {
    //let cmd_str = " -c:v copy -c:a copy ".to_string();
    let aa = &["ffmpeg.exe", "-i", "video_temp.mp4", "-i", "audio_temp.mp4", "-c:v", "copy", "-c:a", "copy", "《舞女》--- 火遍大街.mp4"];
    let mut child =
        Command::new("cmd")
            .arg("/c")
            .args(aa)
            .stdout(Stdio::piped())
            .spawn()
            .expect("Failed to execute command");    ;


     let ecode = child.wait()
                      .expect("failed to wait on child");

     assert!(ecode.success());
    //Command::new("cmd").arg("/c").arg(cmd_str).output().expect("cmd exec error!");

    //let output_str = String::from_utf8_lossy(&output.stdout);
    //println!("{}", output_str);
}


//#[tokio::main]
/*
async fn main_22() {
    let (mut tx, mut rx) = mpsc::channel::<String>(100);
    let w1 = tokio::spawn(async move {
        let mut reader = BufReader::new(stdin());
        let mut buffer = String::new();
        loop {
            reader.read_line(&mut buffer).await;
            tx.send(buffer.clone()).await;
            buffer.clear();
        }
    });

    let w2 = tokio::spawn(async move {
        loop {
            match rx.recv().await {
                None => break,
                Some(res) => {
                    let now = res.replace("\r\n", "");
                    println!("{}", now);
                    tokio::spawn(async move {
                        //run(now.as_str()).await;
                    });
                }
            }
        }
    });

    futures::join!(w1,w2);

    /*if let Err(err) = run().await {
        println!("{}", err)
    }*/
}*/


fn tt() {
    let mut buf = BytesMut::with_capacity(1024);
    buf.put_slice("中国".as_bytes());
    println!("{:X}", buf);

    let mut reult: Vec<u8> = Vec::new();
    GBK.encode_to("中国", EncoderTrap::Strict, &mut reult).unwrap();
    for i in reult.iter() {
        println!("{:X}", i);
    }
    println!("-----------------");
    let mut f = File::open("ab.txt").unwrap();
    let mut reader: Vec<u8> = Vec::new();
    f.read_to_end(&mut reader).ok().expect("can not read file");

    //println!("{}", String::from_utf8_lossy(&reader[..]));
    for i in reader.iter() {
        //  println!("{:X}", i);
    }
    // E4 B8 AD E5 9B BD       utf-8
    // D6 D0 B9 FA             GBK       ANSI(跟操作系统代码页有关),中文windows 默认代码页936
    // 2D 4E FD 56             UTF_16LE  Unicode little endian
    // 4E 2D 56 FD             UTF_16LE  Unicode big endian
    let content = "中国";
    for i in content.as_bytes().iter() {
        println!("{:X}", i);
    }
    println!("---------GBK--------");
    let gbk = GBK.encode(content, EncoderTrap::Strict).unwrap();
    for i in gbk.iter() {
        println!("{:X}", i);
    }
    println!("---------Unicode little endian--------");
    let utf16 = UTF_16LE.encode(content, EncoderTrap::Strict).unwrap();
    for i in utf16.iter() {
        println!("{:X}", i);
    }

    println!("---------Unicode big endian--------");
    let utf16 = UTF_16BE.encode(content, EncoderTrap::Strict).unwrap();
    for i in utf16.iter() {
        println!("{:X}", i);
    }

    let content: String = GB18030.decode(&reader, DecoderTrap::Ignore).unwrap();
    println!("content:{}", content);
    let cmd_str: String;
}

fn file_read(path: &str) -> io::Result<String> {
    let mut f = File::open(path)?;
    let mut reader: Vec<u8> = Vec::new();
    f.read_to_end(&mut reader).ok().expect("can not read file");
    let content: String = GB18030.decode(&reader, DecoderTrap::Strict).unwrap();
    println!("content:{}", content);
    Ok(content)
}

fn test() {
    let mut path = PathBuf::from("c:\\");

    path.push("windows");
    path.push("system32");

    path.set_extension("dll");
    println!("{}", "hello");
    let path: PathBuf = [r"c:\", "windows", "system32.dll"].iter().collect();

    //ffmpeg::to_mp3();
    let path = Path::new("F:/AUPMODEL/1156668/1156668.blend");
    println!("{:?}", path);


    let mut buf = BytesMut::with_capacity(1024);
    buf.put(&b"ab"[..]);
    for i in buf {
        println!("{:x}", i);
    }
}