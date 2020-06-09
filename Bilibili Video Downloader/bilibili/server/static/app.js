function main() {
    var app;
    const url = "ws://127.0.0.1:8080/echo";
    const STATUS_RUNNING = 1;
    const STATUS_STOP = 0;
    var APP_STATUS = STATUS_STOP;
    var VideoInfoDic = {};

    function onTaskList(json) {
        VideoInfoDic = {};
        var videos = json.data;
        for (var i = 0; i < videos.length; i++) {
            videos[i].checked = false;
            videos[i].chunks = [];
            videos[i].finished = false;
            VideoInfoDic[videos[i].cid] = videos[i];
        }
        app.$data.videos = videos;
    }

    function downloadFinished(json) {
        VideoInfoDic[json.cid].finished = true;
        app.$data.downloadStatus = !app.$data.downloadStatus;
        APP_STATUS = STATUS_STOP;
    }

    function onMessage(data) {
        var json = JSON.parse(data);
        switch (json.mtype) {
            case "tick":
                console.log(json);
                break;
            case "taskList":
                onTaskList(json.data);
                break;
            case "chunks":
                VideoInfoDic[json.cid].chunks = json.value;
                break;
            case "startDownloadRes":
                console.log(json);
                break;
            case "downloadFinished":
                downloadFinished(json);
                break;
        }
    }

    function startWebSocket() {
        var ws = new WebSocket(url);
        ws.onopen = function (evt) {
            print("OPEN");
        };
        ws.onclose = function (evt) {
            print("CLOSE");
            ws = null;
        };
        ws.onmessage = function (evt) {
            onMessage(evt.data);
            //console.log(evt.data);
        };
        ws.onerror = function (evt) {
            print("ERROR: " + evt.data);
        };
        return ws
    }

    var print = function (message) {
        console.log(message)
    };

    var ws = startWebSocket();

    Vue.component('progress-bar', {
        props: ['chunk'],
        template: `<div class="bar">
                              <div class="step" v-bind:style="{  width:  chunk.p+\'%\' }"></div>
                              <div class="info">{{chunk.p}}%</div>
                   </div>`
    });

    Vue.component('video-chunk', {
        props: ['chunks'],
        template: `<div class="chunks">
                        <progress-bar v-for="chunk in chunks" v-bind:key="chunk.i" v-bind:chunk="chunk"></progress-bar>
                   </div>`
    });

    app = new Vue({
        el: '#main_app',
        data() {
            return {
                downloadUrl: "https://www.bilibili.com/video/BV17t411C7GX",
                videos: [],
                checkValues: [],
                downloadStatus: 0
            }
        },

        watch: {
            // 如果 `downloadUrl` 发生改变，这个函数就会运行
            downloadUrl: function (newQuestion, oldQuestion) {
                //ws.send(newQuestion);
                // this.startDownload();
            },
            downloadStatus: function (newQuestion, oldQuestion) {
                if (APP_STATUS == STATUS_RUNNING) return;
                //ws.send(newQuestion);
                this.startDownload();
            }
        },
        methods: {
            getSelectDic:function(){
                var selectDic = {};
                for (var i = 0; i < this.checkValues.length; i++) {
                    selectDic[this.checkValues[i]] = true;
                }
                return selectDic;
            },
            selectAll: function (event) {

                var checkValues = [];
                var selectDic=this.getSelectDic();
                for (var i = 0; i < this.videos.length; i++) {
                    if (selectDic.hasOwnProperty(this.videos[i].cid))
                        continue;
                    checkValues.push(this.videos[i].cid);
                }
                this.checkValues = checkValues;
            },
            getLinks: function (event) {
                var data = {
                    "mtype": "taskList",
                    "url": this.downloadUrl
                };
                ws.send(JSON.stringify(data));
            },
            selectVideo: function (event) {

                var cid = event.currentTarget.attributes["cid"].value;
                var findindex = -1;
                for (var i = 0; i < this.checkValues.length; i++) {
                    if (this.checkValues[i] == cid) {
                        findindex = i;
                        break;
                    }
                }
                if (findindex != -1) {
                    this.checkValues.splice(findindex, 1);
                } else {
                    this.checkValues.push(cid);
                }
            },
            nextVideoCid: function () {
                if (this.checkValues.length > 0) {
                    var selectDic=this.getSelectDic();
                    for (var i = 0; i < this.videos.length; i++) {
                        //没有完成
                        if (!this.videos[i].finished) {
                            //并且要选中
                            if (selectDic.hasOwnProperty(this.videos[i].cid)) {
                                return +this.videos[i].cid;
                            }
                        }
                    }
                }
                return -1;
            },
            startDownload: function () {

                var cid = this.nextVideoCid();
                if (cid == -1) return;

                APP_STATUS = STATUS_RUNNING;
                var data = {
                    "mtype": "startDownload",
                    "url": this.downloadUrl,
                    "cids": [cid]
                };
                ws.send(JSON.stringify(data));
            }
        }
    })
}


window.addEventListener("load", main);