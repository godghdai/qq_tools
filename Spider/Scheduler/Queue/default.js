var EventEmitter = require('events');
class Queue extends EventEmitter {
    constructor() {
        super();
        this.q = [];
        this._len = 0;
    }
    get() {
        var self = this;
        if (self._len > 0) {
            self._len--;
            return self.q.pop();
        } else return null;
    }
    push(value) {
        this.q.push(value);
        this._len++;
        this.emit("incomimg");
    }
    len() {
        return this._len;
    }
}
module.exports = Queue;