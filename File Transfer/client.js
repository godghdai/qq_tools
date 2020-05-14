const net = require('net');
const Cutter = require('./cutter');
const {HOST,PORT,MESSAGE_TYPE_TEXT,MESSAGE_TYPE_FILE,HEADER_LEN} = require('./packet/const');
const {get_filepacket_by_index} = require('./packet/filePacket');
const {getTextPacket} = require('./packet/textPacket');

var textQuere=[];
var fileQuere=[];

var client = new net.Socket();

function iter_quere(){     
    if(textQuere.length>0){
        client.write(getTextPacket(textQuere.pop()));
        return;
    }
    if(fileQuere.length>0){
        var last=fileQuere[fileQuere.length-1];
        var buffer=last.get_packet();
        if(buffer!=null){
            client.write(buffer);
            return;
        }
        console.log(last.toString()); 
        fileQuere.pop();
        iter_quere();
     }
}
       

const cutter = new Cutter(HEADER_LEN, data => {
    return HEADER_LEN +data.readUInt32BE(1);
});

cutter.on('packet', packet => {
    var type=packet.readUInt8(0)
    if(type==MESSAGE_TYPE_TEXT){
        var body=packet.slice(5);
        if(body!="true")
          console.log(body.toString()); 
        iter_quere() 
    }
});


client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);          
    client.on('data', function(data) {
       cutter.handleData(data);         
     });

    
    client.on('error', function(error) {
        console.log(error);
        exit();
    });

    client.on('end', function() {
        console.log('Connection end');
    })
})



function readInput(){
    process.stdin.on('data',(input)=>{
        input=input.toString().trim();
        if(input=="q"){
            exit();
            return;
        }
        if(input.startsWith("-fm")){
            for (let index = 1; index <=6; index++) {
                fileQuere.push(get_filepacket_by_index(`./${index}.dt`,`./test/${index}.dt`,1024*320));
                
            }
             iter_quere();
        }
        if(input.startsWith("-f")){
            var parms=input.split(" ")
            if(parms.length<2){
                console.log("参数不匹配!!");
                return;
            } 
            parms.shift();
            
           //fileQuere.push(get_filepacket_by_index("./com.js","./comddd.js",1024));
            fileQuere.push(get_filepacket_by_index(`./${parms[0]}`,`./${parms[1]}`,1024*320));
            iter_quere();
            return;
        }
        if(input.length>0){
            textQuere.push(input);
            iter_quere();
        }
    
})

}
readInput();

function exit(){
    console.log("bye!!");
    process.exit(0);
}
