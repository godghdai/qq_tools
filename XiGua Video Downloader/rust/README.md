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
