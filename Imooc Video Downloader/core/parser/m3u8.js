const reg_m3u8 = /\.m3u8/;
const reg_ts = /\.ts/;

function m3u8h5(data) {
    var lines = data.split("\n"), stack = [];
    for (var l = 0; l < lines.length; l++) {
        var line = lines[l];
        if (reg_m3u8.test(line)) {
            stack.push({
                ...stack.pop(),
                "url": line
            });
            continue;
        }
        if (line.startsWith("#EXT-X-STREAM-INF")) {
            stack.push({
                ...line.match(/BANDWIDTH=(?<bandwidth>\w+), RESOLUTION=(?<resolution>\w+)/).groups
            });
        }

    }
    return stack;
}

function m3u8(data) {
    var info, lines = data.split("\n");

    for (var
        index = 0,
        num = 0;
        line = lines[index],
        index < lines.length; index++) {

        if (line.startsWith("#EXT-X-KEY")) {
            info = line.match(/METHOD=(?<algorithm>[^,]+),URI="(?<key_url>[^"]+)"/).groups;
            info["links"] = [];
            continue;
        }
        if (reg_ts.test(line)) {
            info.links.push({
                "num": num++,
                "url": line
            });
        }
    }
    return info;

}
module.exports = {
    m3u8h5,
    m3u8    
};