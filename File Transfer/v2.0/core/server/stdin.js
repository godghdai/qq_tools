const { exit } = require('../common/util');

const client_manger = require('../server/client_manger');

const {broadcast}=client_manger;

function init() {
    process.stdin.on('data',(input)=>{
        input=input.toString().trim();
        if(input=="q"){
            exit();
            return;
        }
        if(input.length>0){
          broadcast(null,input)
        }
    
  })
}

module.exports = { init };