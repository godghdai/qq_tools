## B站视频下载工具

#### 配置api/api.go
```js
var DefaultHeaders = map[string]string{
	"cookie":  "SESSDATA=b55c1692%2C1605985036%2C73ead*51",
	"Referer": "https://www.bilibili.com/video/BV1N7411f7Mo?p=57",
}
```

#### 安装ffmpeg
http://ffmpeg.org/

#### 编译
```sh
go build -o bd.exe main.go
```

#### 下载单个视频
```js
F:\bin>bd.exe https://www.bilibili.com/video/BV1XW411o7iX?p=30
```
```sh
[罗文、甄妮——《铁血丹心》超清舞台版_video.m4s] 00.00 %
[罗文、甄妮——《铁血丹心》超清舞台版_video.m4s] 30.00 %

......
......

[罗文、甄妮——《铁血丹心》超清舞台版_video.m4s] 100.00 %
罗文、甄妮——《铁血丹心》超清舞台版_video.m4s 视频下载完成
罗文、甄妮——《铁血丹心》超清舞台版_audio.m4s 正在下载音频
罗文、甄妮——《铁血丹心》超清舞台版_audio.m4s 音频下载完成
罗文、甄妮——《铁血丹心》超清舞台版.mp4 合并完成
```
