const VALUE_DIC = [128, 192, 224, 240, 248, 252, 254, 255];
function Bitmap(maxValue) {

    if (!(this instanceof Bitmap))
        return new Bitmap(maxValue);

    //0~9
    this.buf = new Uint8Array(Math.ceil(maxValue / 8));
    this.last_index = Math.floor(maxValue / 8);
    this.last_pos = maxValue - this.last_index * 8;
}

Bitmap.prototype.set = function (index) {
    var out = Math.floor(index / 8),
        pos = index - out * 8;
    this.buf[out] |= (1 << 7 - pos);
}

Bitmap.prototype.zero = function (index) {
    var out = Math.floor(index / 8),
        pos = index - out * 8;
    this.buf[index] &= (~(1 << 7 - pos));
}

Bitmap.prototype.get = function (index) {
    var out = Math.floor(index / 8),
        pos = index - out * 8;
    return (this.buf[out] >> (7 - pos)) & 0x1;
}

Bitmap.prototype.isAllSet = function () {
    var index = this.last_index;
    var buf = this.buf;
    for (let i = 0; i < index; i++) {
        if (buf[i] != 0xff)
            return false;

    }
    return buf[index] == VALUE_DIC[this.last_pos];
}
module.exports = Bitmap;
