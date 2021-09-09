var Queue = require('../Queue/default');
var Fetcher = require('../../Fetcher/default');
class FetcherPool extends Queue {
    constructor(size) {
        super();
        this.fetchers = [];
        for (var i = 0; i < size; i++) {
            var fetcher = new Fetcher();
            var self = this;
            fetcher.on("job_done", function(_fetcher) {
                self.push(_fetcher);
            })
            this.fetchers.push(fetcher);
            this.push(fetcher);
        }
    }
    getFetchers() {
        return this.fetchers;
    }
}
module.exports = FetcherPool;