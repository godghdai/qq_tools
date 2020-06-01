# 慕课网视频下载脚本
## 如何使用
```
修改config.js配置cookie：
```

## 查看过滤结果
```js
F:\bin>imooc https://coding.imooc.com/learn/list/180.html -f "12-" -nd
```
```js
12-1 迷宫_算法
12-2 迷宫代码实现
```

## 下载过滤结果
```js
F:\bin>imooc https://coding.imooc.com/learn/list/180.html -f "12-"
```
```js
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


