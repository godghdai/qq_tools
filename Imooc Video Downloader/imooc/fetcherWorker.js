const util = require('util');
const Fetcher = require("../core/common/fetcher");
const EventEmitter = require('events').EventEmitter;
function FetcherWorker(nextRequestTask) {
    if (!(this instanceof FetcherWorker))
        return new FetcherWorker(nextRequestTask);

    this.fetcher = new Fetcher();
    this.fetcher.setHeader({
        'origin': 'https://coding.imooc.com',
        //'Host': 'coding.imooc.com',
        //'Referer': 'https://coding.imooc.com/lesson/228.html',
        'Cookie': 'completeuinfo:3728202=%7B%22type%22%3A0%2C%22time%22%3A1590305340%7D; imooc_uuid=d4399ba9-4203-48e6-a6f9-ca8382e40c5d; imooc_isnew_ct=1573369371; imooc_isnew=2; adv_#globalTopBanner_2847=1585392197331; adv_#globalTopBanner_2853=1585980463031; UM_distinctid=171585f9dbc2c-02040450bc16d-3a36510f-1fa400-171585f9dbd730; adv_#globalTopBanner_2860=1586862613502; adv_#globalTopBanner_2881=1587109467687; adv_#globalTopBanner_2886=1587482352232; zg_did=%7B%22did%22%3A%20%22166ed6808f0439-040496b58a08bd-5c11301c-1fa400-166ed6808f13c%22%7D; zg_f375fe2f71e542a4b890d9a620f9fb32=%7B%22sid%22%3A%201589130487009%2C%22updated%22%3A%201589130589571%2C%22info%22%3A%201589130487013%2C%22superProperty%22%3A%20%22%7B%5C%22%E5%BA%94%E7%94%A8%E5%90%8D%E7%A7%B0%5C%22%3A%20%5C%22%E5%AE%9E%E6%88%98%E6%95%B0%E6%8D%AE%E7%BB%9F%E8%AE%A1%5C%22%2C%5C%22Platform%5C%22%3A%20%5C%22web%5C%22%7D%22%2C%22platform%22%3A%20%22%7B%7D%22%2C%22utm%22%3A%20%22%7B%7D%22%2C%22referrerDomain%22%3A%20%22www.imooc.com%22%2C%22cuid%22%3A%20%22_pNv3c7Xd1c%2C%22%2C%22zs%22%3A%200%2C%22sc%22%3A%200%2C%22firstScreen%22%3A%201589130487009%7D; adv_#globalTopBanner_2911=1589180957672; IMCDNS=0; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%223728202%22%2C%22first_id%22%3A%22171ff8e8587652-0415fcdd3ef4ed-3c3f5807-2073600-171ff8e85888e1%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22%24device_id%22%3A%22171ff8e8587652-0415fcdd3ef4ed-3c3f5807-2073600-171ff8e85888e1%22%7D; loginstate=1; apsid=I3NGY0NDU1NmZjMWIwYmM4M2E0OTgyZGI5ZmFhMTMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMzcyODIwMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxNjc0NTI3QHFxLmNvbQAAAAAAAAAAAAAAAAAAAAAAAGJhNGRlOGEyNGFhNDdjYzcyMDc0MWUwM2NhMmEwZDRkBRrKXj1bYFo%3DMD; last_login_username=1674527%40qq.com; Hm_lvt_f0cfcccd7b1393990c78efdeebff3968=1590226618,1590234784,1590255801,1590303235; Hm_lpvt_f0cfcccd7b1393990c78efdeebff3968=1590303243; Hm_lvt_c1c5f01e0fc4d75fd5cbb16f2e713d56=1590264905,1590264955,1590303217,1590303250; Hm_lpvt_c1c5f01e0fc4d75fd5cbb16f2e713d56=1590305356; cvde=5eca19f9798fa-23',
        // 'X-Requested-With': 'XMLHttpRequest'
        // rejectUnauthorized: false,
        // requestCert: true
    });
    this.fetcher.setRetry(3, 1000);
    this.nextRequestTask = nextRequestTask;

}

FetcherWorker.prototype.httpGet = function (requestTask) {
    var self = this;

    self.fetcher.httpGet(requestTask.url, {
        "onDone": function (err, data) {
            requestTask.done(err, data);
            self.nextRequestTask(self);
        },
        "onProgress": function (progress) {
            if (requestTask.onProgress)
                requestTask.onProgress(progress);
        }
    })

}
util.inherits(FetcherWorker, EventEmitter);
module.exports = FetcherWorker;