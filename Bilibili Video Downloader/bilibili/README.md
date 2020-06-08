## B站视频下载命令行工具

#### 配置api/api.go
```js
var DefaultHeaders = map[string]string{
	"cookie":  "SESSDATA=b55c1692%2C1605985036%2C73ead*51",
	"Referer": "https://www.bilibili.com/video/BV1N7411f7Mo?p=57",
}
```

#### 编译
```sh
go build -o bd.exe main.go
```

#### 下载单个视频
```js
F:\bin>bd.exe https://www.bilibili.com/video/BV1XW411o7iX?p=35
```
