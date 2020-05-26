const crypto = require("crypto");
function decryptTsFile(crypted, key, num) {
    var vi = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, num]);
    var decipher = crypto.createDecipheriv('aes-128-cbc', key, vi);
    decipher.setAutoPadding(true);
    return Buffer.concat([decipher.update(crypted), decipher.final()]);
}
module.exports = { decryptTsFile };