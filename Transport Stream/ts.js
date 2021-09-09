const fs = require("fs");
const path = require("path");
function read() {
    let buffer = new Buffer.alloc(188);

    let fd = fs.openSync(path.resolve(__dirname, "./output000.ts"), 'r');
    let len, offset = 0;
    var nextPid = null;
    while (len = fs.readSync(fd, buffer, 0, 188) > 0) {
        var pid = ((buffer[1] & 0x1f) << 8) | buffer[2];
        var continuity_counter = buffer[3] & 0x0f;
        var payload_unit_start_indicator = (buffer[1] & 0x40) >> 6;
        //console.log(pid,"payload_unit_start_indicator:",payload_unit_start_indicator);
        if (pid == 0 && nextPid == null) {
            // parse_pat(buffer.slice(4 + payload_unit_start_indicator));
            // break;
        }

        if (pid == 4096) {
            console.log(buffer);
            parse_pmt(buffer.slice(4 + payload_unit_start_indicator))
            break;
        }
        //console.log(pid,continuity_counter);
        //00 00 00 00
        offset += len;
    }
    fs.closeSync(fd)
}
read();

function parse_pmt(buf) {
    var pmt = {"name": "Program Map Table"}, len, pi = 0;
    pmt.table_id = buf[0];//8b
    pmt.section_syntax_indicator = (buf[1] >> 7) & 0x1;//1b
    pmt.zero = (buf[1] >> 6) & 0x1;//1b
    pmt.reserved1 = (buf[1] >> 4) & 0x3;//2b
    len = (buf[1] & 0xf << 8) | buf[2];//12b
    pmt.section_length = len;
    pmt.program_number = buf[3] << 8 | buf[4];//16b

    pmt.reserved3 = (buf[8] >> 5) & 0x7;
    pmt.PCR_PID = (buf[8] & 0x1f) << 8 | buf[9];

    pmt.reserved4 = (buf[10] >> 4) & 0xf;
    var program_info_length = (buf[10] & 0xf) << 8 | buf[11];
    pmt.program_info_length = program_info_length;

    pmt.CRC32 = buf.slice(len - 1, 3 + len).toString("hex");
    p_buf = buf.slice(12 + program_info_length, len - 1);
    pmt.programs = [];
    while (pi < p_buf.length) {
        var ES_info_length = (p_buf[pi + 3] & 0xf) << 8 | p_buf[pi + 4];
        var item = {
            //流类型，标志是Video还是Audio还是其他数据，h.264编码对应0x1b，aac编码对应0x0f，mp3编码对应0x03
            "stream_type": p_buf[pi].toString(16),
            "reserved": (p_buf[pi + 1] >> 5) & 0x7,
            "elementary_PID": ((p_buf[pi + 1] & 0x1f) << 8) | p_buf[pi + 2],
             ES_info_length,
            "descriptors": []
        }
        if (ES_info_length > 0) {
            item.descriptors=ISO_639_language_descriptor(p_buf.slice(pi+5));
            pi += ES_info_length;
        }
        pmt.programs.push(item);
        pi += 5;

    }

    //console.log(len);
   // console.log(buf);
    console.log(JSON.stringify(pmt, null, 2));
}

//descriptor_tag 10
function ISO_639_language_descriptor(buf){
    var descriptor_tag=buf[0];//8b
    if(descriptor_tag!=10) return [];
    var descriptor_length=buf[1];//8b
    var pi=2;
    var res=[];
    while (pi <descriptor_length+2 ) {
        res.push({
            "ISO_639_language_code":buf.slice(pi,pi+3).toString(),
            "audio_type":buf[pi+3]
        })        
        pi+=4;
      }
    return res;
}



function parse_pat(buf) {

    var pat = { "name": "Program Association Table", programs: [] }, len, p_buf, pi = 0;
    pat.table_id = buf[0];//8b
    pat.section_syntax_indicator = (buf[1] >> 7) & 0x1;//1b
    pat.zero = (buf[1] >> 6) & 0x1;//1b
    pat.reserved = (buf[1] >> 4) & 0x3;//2b
    len = (buf[1] & 0xf << 8) | buf[2];//12b
    pat.section_length = len;
    pat.transport_stream_id = buf[3] << 8 | buf[4];//16b
    pat.CRC32 = buf.slice(len - 1, 3 + len).toString("hex");
    p_buf = buf.slice(8, len - 1);
    while (pi < p_buf.length) {
        var program_number = p_buf[pi] << 8 | p_buf[pi + 1];
        var key = program_number == 0 ? "network_PID" : "program_map_PID";
        pat.programs.push({
             program_number,
            "reserved": (p_buf[pi + 2] >> 5) & 0x7,
            [key]: ((p_buf[pi + 2] & 0x1f) << 8) | p_buf[pi + 3],
        });
        pi += 4;
    }
    console.log(pat);
    console.log(buf);

}
return;
//ts 188
//var buffer=Buffer.from([0x47, 0x40, 0x11, 0x10]);
//var buffer=Buffer.from([0x47, 0x50, 0x00, 0x10]);
var buffer = Buffer.from([0x47, 0x40, 0x00, 0x10, 0x00, 0x00, 0xB0, 0x0D, 0x00, 0x01, 0xC1, 0x00, 0x00, 0x00, 0x01, 0xF0, 0x00, 0x2A, 0xB1, 0x04, 0xB2])
//ts header 4个字节
// 0100 0001
// 0000 0000
// 0 0001 0000 0000

//var pid=((buffer[1]&0x1f)<<8)| buffer[2];
//console.log(pid)

//00 00 b0  0d 00 01 c1 00
var pat = Buffer.from[0x00, 0xB0, 0x0D, 0x00, 0x01, 0xC1, 0x00];
console.log(0x0b)
//1010 a(10) 1011 b(11) 1100 c(12) 1101 d(13)
//0xB0 0x0D
//1011 0000 0000 1101

/*
payload_unit_start_indicator  “1” 在前4个字节后会有一个调整字节。所以实际数据应该为去除第一个字节后的数据。即上面数据中红色部分不属于有效数据包。

1.5.es层
es层就是音视频裸数据了，常用的音频编码格式为AAC，视频编码格式为H.264

2.打包H.264和AAC为TS
对于H.264视频而言，每一帧的时间长度为

 frame_duration = 1000/fps

当fps为25时，一帧时间为40ms

对于AAC音频而言，每一帧的时间长度为

音频帧的播放时间=一个AAC帧对应的采样样本的个数/采样频率(单位为s)
一帧 1024个 sample。采样率 Samplerate 44100KHz，每秒44100个sample, 所以根据公式   音频帧的播放时间=一个AAC帧对应的采样样本的个数/采样频率
当前AAC一帧的播放时间是= 1024*1000000/44100= 22.32ms(单位为ms)

理论上的音视频(播放)同步是这样的：
由此得到了每一帧数据的持续时间，音视频交叉存储在容器中：一个时间轴：
时间轴：0   22.32   40     44.62    66.96    80     89.16      111.48    120       ................
音   频 ：0  22.32           44.62   66.96             89.16     111.48                ................
视  频 ：0              40                              80                                   120       ................
即视频的持续时间相加 和音频的持续时间相加作比较，谁小写入哪个。
(自己的方法)
音频数据（AAC 48k）       21.33     42.44  63.99        85.32
视频数据（H264 25fps）            40                   80
时间轴                      ------------------------------------------->
（ts容器）循环做（写一帧视频，然后写一帧音频，然后视频的时间减去音频的时间，如果大于一帧音频的时间，就多写一帧音频，知道视频多出来的时间小于一帧音频）

*/


var section_length = 1;
/*

1   table_id	8b	PAT表固定为0x00
    section_syntax_indicator	1b	固定为1
    zero	1b	固定为0
    reserved	2b	固定为11
2   section_length	12b	后面数据的长度
2   transport_stream_id	16b	传输流ID，固定为0x0001
    reserved	2b	固定为11
    version_number	5b	版本号，固定为00000，如果PAT有变化则版本号加1
1   current_next_indicator	1b	固定为1，表示这个PAT表可以用，如果为0则要等待下一个PAT表
1   section_number	8b	固定为0x00
1   last_section_number	8b	固定为0x00


https://blog.csdn.net/u013354805/article/details/51578457

*/
