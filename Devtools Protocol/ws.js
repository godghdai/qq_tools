const WebSocket = require('ws');
const fs = require('fs');
//https://chromedevtools.github.io/devtools-protocol/tot/Input/
const ws = new WebSocket('ws://localhost:9222/devtools/page/2569466171FD0851F1845F3B3AD90BAD');
//https://div.io/topic/1464
ws.on('open', function open() {
    //Network.requestWillBeSent 
    //Network.responseReceived
    var json = { "id": 4, "method": "Network.enable", "params": { "maxTotalBufferSize": 10240 } };
    ws.send(JSON.stringify(json));
    ws.send('{"id": 41, "method": "Network.setCacheDisabled", "params": { "cacheDisabled": true }}')

    //ws.send('{"id": 2, "method": "Page.navigate", "params": { "url": "http://www.163.com" }}')


    json = {
        "id": 14,
        "method": "Page.captureScreenshot",
        "params": {
            "format": "png",
            "clip": {
                x: 100,
                y: 100,
                width: 400,
                height: 500,
                scale: 1
            }
        }
    };

    json = { "id": 334, "method": "Fetch.enable", "params": { "handleAuthRequests": false } };
    ws.send(JSON.stringify(json));
    ws.send('{"id": 3, "method": "Page.navigate", "params": { "url": "https://www.baidu.com" }}')

    //
});

var __id = 1000;

function sfdsdsfdsfdsf(data) {
    var requestId;
    if (data.method == "Fetch.requestPaused") {
        requestId = data.params.requestId;
        if (data.params.request.url == "https://www.baidu.com/content-search.xml") {
            var json = {
                "id": 14555,
                "method": "Fetch.fulfillRequest",
                "params": {
                    "requestId": requestId + "",
                    "responseCode": 200,
                    "body": Buffer.from("hellodddddd word dsfdsfsd!!").toString('base64')
                }
            };
            ws.send(JSON.stringify(json));
        } else {
            json = { "id": __id++, "method": "Fetch.continueRequest", "params": { "requestId": requestId + "" } };
            ws.send(JSON.stringify(json));
        }

    }

}

//chrome.exe --remote-debugging-port=9222 --enable-automation --no-first-run
ws.on('message', function incoming(data) {
    var data = JSON.parse(data);
    console.dir(data)
    sfdsdsfdsfdsf(data);
    return;
    if (data.id == 445) save(data.result.body, "./445.png");
    if (data.id == 14) save(data.result.data, "./14.png")
    if (data.method) {
        if (data.method == "Network.loadingFinished") {
            console.log(data)
            var requestId = data.params.requestId;
            var json = { "id": 445, "method": "Network.getResponseBody", "params": { "requestId": requestId + "" } };
            ws.send(JSON.stringify(json));
        }
    }

});
//4AD96A939EFA789532648F73AC222210
//
//--remote-debugging-port=9222 --user-data-dir="C:\selenum\AutomationProfile"
//chrome.exe --remote-debugging-port=9222 --user-data-dir=<some directory>
//打开http://loacalhost:9222
//http://loacalhost:9222/json
// 新建一个标签页，空白页或者带参数默认加载URL，返回创建之后该页面信息的json对象，格式同上。
// http://localhost:9222/json/new
// http://localhost:9222/json/new?http://www.baidu.com
// 关闭一个标签页，传入该页面的id。
// http://localhost:9222/json/close/477810FF-323E-44C5-997C-89B7FAC7B158
// 激活标签页。
// http://localhost:9222/json/activate/477810FF-323E-44C5-997C-89B7FAC7B158
// 查看chrome和协议的版本信息。
// http://localhost:9222/json/version

function save(base64, path) {
    var dataBuffer = new Buffer(base64, 'base64'); //把base64码转成buffer对象，
    console.log('dataBuffer是否是Buffer对象：' + Buffer.isBuffer(dataBuffer));
    fs.writeFile(path, dataBuffer, function(err) { //用fs写入文件
        if (err) {
            console.log(err);
        } else {
            console.log('写入成功！');
        }
    })
}