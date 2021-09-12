#### 下载地址

https://share.weiyun.com/bqtqYOyQ

####  查看命令帮助

```shell
C:\Users\yzd\CLionProjects\xigua\target\release>xigua -h
西瓜视频下载工具 0.1.0
godghdai@gmail.com
https://github.com/godghdai

USAGE:
    xigua [FLAGS] [OPTIONS] <URL>

FLAGS:
    -h, --help       命令使用说明
    -n, --novideo    只下载音频文件
    -V, --version    版本信息

OPTIONS:
    -o, --output <FILENAME>                保存的文件名
    -a, --audio_quality <audio_quality>    设置下载的音频质量 [default: high]  [values: high, medium, low]
    -t, --thread_nums <thread_nums>        设置并发数 [default: 3]
    -v, --video_quality <video_quality>    设置下载的视频质量 [default: medium]  [values: high, medium, low]

ARGS:
    <URL>    需要下载的网址
```
####  默认以画质中，音质最高下载视频

```shell
xigua https://www.ixigua.com/6996982502242189831
```
####  下载最高画质的视频
```shell
xigua -v high https://www.ixigua.com/6996982502242189831
```
####  以5个并发数下载视频
```shell
xigua -t 5 high https://www.ixigua.com/6996982502242189831
```
####  单独下载音频并转为mp3
```shell
xigua -n https://www.ixigua.com/6996982502242189831
```



#### 参考

- https://lib.rs/crates/hyper 
 
  Hyper 是一个偏底层的http库，支持HTTP/1和HTTP/2，支持异步Rust，并且同时提供了服务端和客户端的API支持。

- https://tokio.rs/
 
  Tokio 提供了用于执行异步函数的运行时和一系列支持协程的IO操作（网络、文件系统）等，从而大幅度简化了基于异步函数的程序的开发。

- https://github.com/atroche/rust-headless-chrome/
 
  A high-level API to control headless Chrome or Chromium over the DevTools Protocol. It is the Rust equivalent of [Puppeteer](https://github.com/GoogleChrome/puppeteer), a Node library maintained by the Chrome DevTools team.

- https://github.com/clap-rs/clap
 
  Command Line Argument Parser for Rust
  
- https://ffmpeg.org/ffmpeg.html 
