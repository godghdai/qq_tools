const Base = require("./BaseParser");
import Base from "./BaseParser"
class MeiziParser extends Base {
    constructor() {
        super();
    }
    registerRules() {
        //https://www.mzitu.com/227284/2
        this.rule(/^https:\/\/www.mzitu.com\/\d*\/\d*$/, this.parse1);
        ////https: //www.mzitu.com/210338
        this.rule(/^https:\/\/www.mzitu.com\/\d*$/, this.parse2);
    }
    parse1(engine, req, $) {
        var titleReg = /(.*)（(\d+)）/;
        var groups = $(".main-title").text().match(titleReg);
        engine.submit({
            "url": $(".main-image img").attr("src"),
            "type": "image",
            "path": groups[1],
            "name": groups[2]
        });
    }

    parse2(engine, req, $) {

        var res = $(".pagenavi span")
            .filter((i, e) => /\d+/.test($(e).text())) //文本只要数字
            .map((i, e) => +($(e).text())) //文本转数字
            .get()
            .reduce((a, c) => Math.max(a, c), 0);

        var _arr = [];
        for (var i = 2; i <= res; i++) {
            _arr.push({
                "url": `${req.url}/${ i}`,
                "type": "html",
            });
        }

        res = $(".main-image img").attr("src");
        if (res != "") {
            _arr.push({
                "url": res,
                "type": "image",
                "path": $(".main-title").text(),
                "name": 1
            });
        }
        engine.submit(_arr);

    }
    parse3() {


        // https://www.mzitu.com/xinggan/
        var res = $("#pins li:not(.box) span a").map((i, e) => {
            return {
                "title": $(e).text(),
                "url": $(e).attr("href")
            }
        }).get();

        console.log(res);

        res = $(".pagination .page-numbers")
            .filter((i, e) => /\d+/.test($(e).text())) //文本只要数字
            .map((i, e) => +($(e).text())) //文本转数字
            .get()
            .reduce((a, c) => Math.max(a, c), 0)

        console.log(res);


    }
}
module.exports = MeiziParser;