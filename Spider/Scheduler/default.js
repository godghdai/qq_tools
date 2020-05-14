const Queue = require("./Queue/default");
const UrlFilter = require("./UrlFilter/default");
const FetchePool = require("./FetchePool/default");

class Scheduler {
    constructor({ limit }) {
        this.limit = limit || 3;
        this.init();
    }
    init() {
        var _ = this;
        _.queue = new Queue();
        _.fetchePool = new FetchePool(_.limit);
        _.urlFilter = new UrlFilter();
        _.queue.on("incomimg", _.next.bind(_));
        _.fetchePool.on("incomimg", _.next.bind(_));
    }
    next() {
        var { "fetchePool": w, "queue": q } = this;
        if (w.len() > 0 && q.len() > 0) {
            w.get().run(q.get());
        }
    }
    submit(url) {
        if (!this.urlFilter.has(url)) {
            this.urlFilter.push(url);
            this.queue.push(url);
        }
    }
    getFetchePool() {
        return this.fetchePool;
    }
}
module.exports = Scheduler;