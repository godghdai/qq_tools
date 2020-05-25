const emptyFun = () => { };
const CONTENT_TYPE_JSON = 1;
function RequestTask(url, callback, type = CONTENT_TYPE_JSON) {
    if (!(this instanceof RequestTask))
        return new RequestTask(url, callback);
    this.url = url;
    this.callback = callback || emptyFun;
    this.type = type;
}
RequestTask.prototype.done = function (err, data) {
    if (!err) {
        if (this.type == CONTENT_TYPE_JSON) {
            try {
                var json = JSON.parse(data);
                this.callback(null, json);
            } catch (ex) {
                this.callback(ex);
            }
        }
    } else this.callback(err, data);
}
module.exports = RequestTask;