var koa = require('koa');
var app = new koa();
var serveViews = require('../index');

console.log(__dirname);

app.use(serveViews());

app.listen(3000);
console.log('listening on 3000');
