var fs = require("fs");
var path = require("path");

function load(filepath) {
    return fs.readFileSync(path.resolve(__dirname, "../resourse/", filepath));

}
module.exports = {
    load
};

