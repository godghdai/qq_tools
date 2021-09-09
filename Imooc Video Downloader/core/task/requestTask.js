const emptyFun = () => { };
function RequestTask(url, callback, type) {
    if (!(this instanceof RequestTask))
        return new RequestTask(url, callback, type);
    this.url = url;
    this.callback = callback || emptyFun;
    this.type = type;
}
RequestTask.prototype.done = function (err, data) {
    if (err) return this.callback(err);

    if (this.type == "json") {
        try {
            var json = JSON.parse(data);
            this.callback(null, json);
        } catch (ex) {
            this.callback(ex);
        }
        return;
    }
    this.callback(null, data);
}
module.exports = RequestTask;