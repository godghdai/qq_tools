const { data_path } = require("../../config");
const path = require("path");
const fs = require('fs-extra');
function Cookies() {
    this.savePath = path.resolve(data_path, "cookies.txt");
}
Cookies.prototype.save = function (cookie) {
    fs.writeFileSync(this.savePath, cookie);
}
Cookies.prototype.get = function () {
    return fs.readFileSync(this.savePath);
}
var instance = new Cookies();
module.exports = instance;