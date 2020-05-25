var cheerio = require('cheerio');

function parse(html){
    var $ = cheerio.load(html);
    var a = $(".course-title a"), href = a.attr('href');
    var contents = {
        "course_title": a.text().trim(),
        "url": href,
        ...href.match(/(?<course_id>\d+).html/).groups,
        "childs": []
    };
    $('.learn-course-list .list-item').each(function (i, el) {
        var el = $(el), item = { "childs": [] };
        item["chapter_name"] = el.find("h3").text().trim();
        el.find("ul a").each(function (i, a) {
            var a = $(a), href = a.attr('href');
            item["childs"].push({
                "title": a.find("span").text().trim(),
                "url": href,
                ...href.match(/\/(?<course_id>\d+)\.html#mid=(?<mid>\d+)/).groups
            });
        });
        contents["childs"].push(item);
    }
    );
    return contents;
}

module.exports = parse;
