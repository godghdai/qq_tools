class SetFilter {
    constructor() {
        this.set = new Set();
    }
    has(value) {
        return this.set.has(value);
    }
    push(value) {
        this.set.add(value);
    }
    len() {
        return this.set.size;
    }
}
module.exports = SetFilter;