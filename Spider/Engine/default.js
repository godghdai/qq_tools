const MeiziParser = require("../Parser/MeiziParser");
const meiziParser = new MeiziParser();

const fs = require('fs-extra');
const path = require('path');

class Engine {
    constructor({ scheduler }) {
        this.scheduler = scheduler;
        var fetchers = scheduler.getFetchePool().getFetchers();
        for (var i = 0; i < fetchers.length; i++) {
            fetchers[i].on("data", this.dispatch.bind(this));
            fetchers[i].on("error", this.dispatch_error.bind(this));
            fetchers[i].on("before_request", this.before_request.bind(this));
        }
    }
    before_request(fetcher, req) {
        console.log(req.url);
        fetcher.setReferer("https://www.mzitu.com");
    }
    dispatch_error({ error, req }) {
        console.log(error, req);
    }
    dispatch({ req, res }) {
        if (req.type == "image") {

            var saveDir = path.join("./mezi", req.path);
            fs.ensureDir(saveDir, function(err) {
                fs.writeFile(path.join(saveDir, `${req.name}.jpg`), res, function(err) {
                    if (err) console.log(err)
                    else {
                        console.log('保存图片成功')
                    }

                })
            })
            return;
        }
        meiziParser._parse(this, req, res);
    }
    submit(req) {

        if (!Array.isArray(req)) {
            this.scheduler.submit(req);
            return this;
        }
        req.forEach(r => {
            this.scheduler.submit(r);
        })
        return this;
    }
    static getInstance() {

        (function() {

        })()
    }
}
module.exports = Engine;