const request = require("request");
const cp = require('child_process');
const fs = require('fs-extra');

function retryPromise(time,delay,jspath,...args){
    return new Promise(function(resolve,reject){
        function next(){
            const child=cp.fork(jspath,[...args]);
            child.on("error",err=>{
                console.log(err);            
            })
        
            child.on("exit",code=>{                
                if(code==1&&time>1) {
                    console.log(time);       
                    time--;
                    setTimeout(function() {
                        next();
                    }, delay)
                }else reject(new Error("exit"));
            })
        
            child.on("message",data=>{    
                 resolve(data);
            })
        }
        next();
     });   
    
}

function download(ts_links,limit,time){
    return new Promise(function(resolve,reject){
        var _limit=limit;
        var _finish=0;
        var _total=ts_links.length;
        var is_cancel=false;
        function _run(){
    
            if(_limit>0&&ts_links.length>0){
                var link=ts_links.pop();
                _limit--;
                do_work(time,link);           
            }
        }
        
        function on_complete(){
            _limit++;
            _finish++;  
            console.log(_finish/_total*100);
            if(_finish==_total) return resolve(true);        
            _run();
        }
    
        function on_err(link){
            console.log(link);
            is_cancel=true;
            reject(new Error("download failed"))
        }
    
        function do_work(time,link) {  

            if(is_cancel) return;

            request({
                url: link.url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
                }
            }, function(err, response, body) {
                if (err) {
                    console.log(link.path + "__" + time + "  retry");
                    if (time > 1) {
                        setTimeout(function() {
                            do_work(--time,link);
                        }, 1000)
                    } else {
                        on_err(link);
                    }
                }
            }).pipe(fs.createWriteStream(link.path)).on('finish', function() {
                on_complete();
            })
    
        }

        for(var i=0;i<limit;i++){
            _run();
        }
 
    });
    
}


module.exports = {
    retryPromise,
    download
}