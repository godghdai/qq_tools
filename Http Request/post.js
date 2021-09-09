var net = require('net');
var port = 3000;
var host = '127.0.0.1';
var client= new net.Socket();
var fs=require("fs")


client.connect(port,host,function(){
  var boundary = "------WebKitFormBoundary8xoXoV1pnMP6m0Wt"; 
  var head = 'POST /upload HTTP/1.1\r\n';
  head+='Connection: keep-alive\r\n';
  head+='User-Agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36\r\n'
  head+='Content-Type: multipart/form-data; boundary='+boundary+'\r\n';
 
  var filehead=`--${boundary}\r\n`;
  filehead+=`content-disposition: form-data; name="files"; filename="timg2221.jpg"\r\n`;
  filehead+=`content-Type: application/octet-stream\r\n\r\n`;

  var image=fs.readFileSync(`D:/Pictures/图片/timg (2).jpg`);



  var filehead2=`--${boundary}\r\n`;
  filehead2+=`content-disposition: form-data; name="files"; filename="hello.jpg"\r\n`;
  filehead2+=`content-Type: image/jpeg\r\n\r\n`;

  var image2=fs.readFileSync(`D:/Pictures/图片/20150401110443701.jpg`);



  var tail=`\r\n--${boundary}--\r\n`;
  head+=`content-Length:${filehead.length+image.length+filehead2.length+image2.length+tail.length}\r\n\r\n`;


  client.write(head);

  client.write(filehead);
  client.write(image);
  client.write("\r\n");
  client.write(filehead2);
  client.write(image2);

  client.write(tail);

  
});
client.on('data',function(data){
  console.log(data.toString());

});
client.on('error',function(error){
  console.log('error:'+error);
});
client.on('close',function(){
  console.log('Connection closed');
});