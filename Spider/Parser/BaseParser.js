const Rule = require("./Rule");
const cheerio = require('cheerio');
class Base {
    constructor() {
        this.rules = [];
        this.registerRules();
    }
    registerRules() {

    }
    rule(regexp, parser) {
        this.rules.push(new Rule(regexp, parser));
    }
    _parse(engine, req, body) {
        var rule, self = this;
        for (var i = 0; i < self.rules.length; i++) {
            rule = self.rules[i];
            if (rule.regexp.test(req.url)) {
                rule.parser(engine, req, cheerio.load(body));
            }
        }
    }
}
module.exports = Base;