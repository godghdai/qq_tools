function EventBus() {
    this.dic = {};

    if (!(this instanceof EventBus))
        return new EventBus();
}
EventBus.prototype = {
    on: function (name, fun) {
        var funs = this.dic[name] || [];
        funs.push(fun);
        this.dic[name] = funs;
    },
    emit: function (name, ...args) {
        var funs = this.dic[name] || [];
        for (var i = 0; i < funs.length; i++) {
            funs[i].apply(null, args);
        }
    },
    off: function (name) {
        delete this.dic[name];
    }
}
module.exports = EventBus;
