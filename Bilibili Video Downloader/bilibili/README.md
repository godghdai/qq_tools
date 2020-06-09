## B站视频下载工具

#### 程序目录创建sessdata.txt

```js
SESSDATA=b55c1692%2C1605985036%2C73ead*51,
```

#### 安装ffmpeg
http://ffmpeg.org/


#### 下载单个视频

1 编译 cli/cli.go
```sh
go build -o cli.exe cli.go
```

```js
F:\bin>cli.exe https://www.bilibili.com/video/BV1XW411o7iX?p=30
```

```sh
[罗文、甄妮——《铁血丹心》超清舞台版_video.m4s] 100.00 %
罗文、甄妮——《铁血丹心》超清舞台版_video.m4s 视频下载完成
罗文、甄妮——《铁血丹心》超清舞台版_audio.m4s 正在下载音频
罗文、甄妮——《铁血丹心》超清舞台版_audio.m4s 音频下载完成
罗文、甄妮——《铁血丹心》超清舞台版.mp4 合并完成
```

#### 下载多个视频

#### 编译 server/server.go
```sh
go build -o server.exe server.go
```

```js
F:\bin>server.exe
```

#### 打开程序管理界面
```sh
http://127.0.0.1:8080/start.html
```
