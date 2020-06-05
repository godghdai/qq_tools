## 慕课网视频下载命令行工具
#### 安装
```sh
npm i imooc_downloader -g
```

#### 如何使用
```js
F:\bin>imooc -h
```

#### 查看命令帮助
```js
F:\bin>imooc -h
```
```
Usage: cli <url> [options]
Options:
  -V, --version              output the version number
  -q, --quality <quality>    视频质量（h=好,m=中,l=差) (default: "m")
  -o, --download_dir <path>  下载后保存的文件夹 (default: "")
  -f, --filter <regex>       设置过滤条件 (default: "")
  -nd, --no_download         显示过滤结果,不下载 (default: false)
  -c, --cookie_text <text>   设置cookie (default: "")
  -h, --help                 display help for command
```

#### 打开慕课网,用chrome调试工具打开NetWork面板,随便找一个ajax请求,查看http请求头,找到cookie
```js
POST /learn/ajaxteachercourse HTTP/1.1
Host: coding.imooc.com
Connection: keep-alive
Pragma: no-cache
Cache-Control: no-cache
Accept: text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01
User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36
X-Requested-With: XMLHttpRequest
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: cors
Sec-Fetch-Dest: empty
Referer: Referer: https://coding.imooc.com/learn/list/180.html
Cookie: imooc_uuid=abcdef......
```

#### 配置cookie
```js
F:\bin>imooc -c "imooc_uuid=abcdef......"
```

#### 查看过滤结果
```js
F:\bin>imooc https://coding.imooc.com/learn/list/180.html -f "12-" -nd
```
```js
12-1 迷宫_算法
12-2 迷宫代码实现
```

#### 下载过滤结果
```js
F:\bin>imooc https://coding.imooc.com/learn/list/180.html -f "12-"
```
```
【Google资深工程师深度讲解Go语言\第12章 迷宫的广度优先搜索\12-1 迷宫_算法】 下载中......
下载进度: 100.00% ██████████████████████████████ 163/163
【Google资深工程师深度讲解Go语言\第12章 迷宫的广度优先搜索\12-1 迷宫_算法】 下载完成

【Google资深工程师深度讲解Go语言\第12章 迷宫的广度优先搜索\12-2 迷宫代码实现】 下载中......
下载进度: 100.00% ██████████████████████████████ 343/343
【Google资深工程师深度讲解Go语言\第12章 迷宫的广度优先搜索\12-2 迷宫代码实现】 下载完成
all download finished

```

## 实现难点
1. ts视频文件解密
```js
const crypto = require("crypto");
function decryptTsFile(crypted, key, num) {
    var vi = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, num]);
    var decipher = crypto.createDecipheriv('aes-128-cbc', key, vi);
    decipher.setAutoPadding(true);
    return Buffer.concat([decipher.update(crypted), decipher.final()]);
}
```

2. 使用mux.js来实现多个ts文件的合并，并转换为MP4
```js
function remuxer(sourse, target) {
    var transmuxer = new mux.mp4.Transmuxer();
    transmuxer.on('data', (segment) => {
        let data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
        data.set(segment.initSegment, 0);
        data.set(segment.data, segment.initSegment.byteLength);
        fs.appendFileSync(target, data);
    })
    var maxIndex = getMaxIndex(sourse);
    for (let index = 0; index <= maxIndex; index++) {
        var bytes = fs.readFileSync(path.resolve(sourse, `${index}.ts`));
        transmuxer.push(new Uint8Array(bytes));
    }
    transmuxer.flush();
}
```


