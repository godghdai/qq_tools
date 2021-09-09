var net = require('net');
var port = 3000;
var host = '127.0.0.1';
var client= new net.Socket();
var fs=require("fs")

function download(start,end){


    var total=22294251;    
    var threads=10;
    var blocksize=Math.floor(total/threads);
    var start=0;
    var end=0;
  

    var fd=fs.openSync("./12456_ddd.rar","w+");
    fs.truncateSync("./12456_ddd.rar",total);
    //fd.close();

    

    for (let index = 0; index <threads; index++) {  
        start=index*blocksize;
        end=index==threads-1?total:index*blocksize+blocksize-1;
        console.log(start,end);
        (function(start,end){
            var client= new net.Socket();
            var w_pos=start;            
            var reg=/\r\n\r\n/;
            var isheader=true;
            client.connect(port,host,function(){
                var head = 'GET /1.rar HTTP/1.1\r\n';
                head+='User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36\r\n';
                head+=`Range: bytes=${start}-${end}\r\n\r\n`;
                client.write(head);
              });
              client.on('data',function(data){
                
                if(isheader&&reg.test(data)){
                    data=data.slice(data.toString().match(reg).index+4);
                    isheader=false;
                 }
   
                fs.write(fd, data, 0, data.length, w_pos,function(err){
                    console.log(err);
                });
                w_pos+=data.length;                       
              
              });
              client.on('error',function(error){
                console.log('error:'+error);
              });
              client.on('close',function(){
                console.log('Connection closed');
              });
              client.on('end', () => {
                console.log('已没有数据');
              });
        })(start,end);
    }
        
    return;




   
}

download();

function head(){
    var client= new net.Socket();
    client.connect(port,host,function(){
        var head = 'HEAD /1.rar HTTP/1.1\r\n';
        head+='User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36\r\n\r\n';
        client.write(head);
      });
      client.on('data',function(data){

        var sfds=data.toString();//.split("\r\n")
        console.log(sfds);
      
      });
      client.on('error',function(error){
        console.log('error:'+error);
      });
      client.on('close',function(){
        console.log('Connection closed');
      });
}