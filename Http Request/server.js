
const Koa = require('koa');
const serve = require('koa-static');
var range = require('koa-range');

const Router = require('koa-router') 
const router = new Router();

const koaBody = require('koa-body');

const fs = require('fs');
const path = require('path');

const app = new Koa();


app.use(range);
app.use(serve(__dirname + '/test'));
app.use(router.routes());


router.post('/upload',koaBody({
  multipart: true,
  formidable: {
      maxFileSize: 200*1024*1024,
      multiples:true    // 设置上传文件大小最大限制，默认2M
  }
}), async (ctx, next) => {
    var files = ctx.request.files.files;

    if(!Array.isArray(files))
    files=[files];

    // 创建可读流
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const render = fs.createReadStream(file.path);

      let filePath = path.join('upload/',file.name);
      const upStream = fs.createWriteStream(filePath);
      render.pipe(upStream);
    }

 
   
    // const fileDir = path.join('upload/');
    // if (!fs.existsSync(fileDir)) {
    //   fs.mkdirSync(fileDir, err => {
    //     console.log(err)
    //     console.log('创建失败')
    //   });
    // }
    // 创建写入流
   // const upStream = fs.createWriteStream(filePath);
   
    ctx.body = '上传成功'
});






app.listen(3000);
 
console.log('listening on port 3000');