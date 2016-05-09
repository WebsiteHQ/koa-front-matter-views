var koa = require('koa');
var app = koa();
var views = require('../index')

app.use(views({
  contents: __dirname + '/pages',
  layouts: __dirname + '/templates'
}))

app.use(function *(){

  switch( this.path.toLowerCase() ) {
    case '/':
      this.body = this.render('index')
      return
    case '/page1':
      this.body = this.render('page1')
      return
    case '/page2':
      this.body = this.render('page2', {
        items: ['one', 'two', 'three']
      })
      return
    default:
      this.status = 404
      this.body = this.render('404')
  }

});

app.listen(3000);
console.log('listening on 3000')
