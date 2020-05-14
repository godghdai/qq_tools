var fc = require('filecompare');
var path = require('path');
var cb = function(isEqual) {
  console.log("equal? :" + isEqual);
}
fc(path.resolve(__dirname,"./gequ.mp4"),path.resolve(__dirname,"./14.mp4"),cb);