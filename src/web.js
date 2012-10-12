define(function(require) {
  var express = require('express'),
      stylus = require('stylus'),
      app = express()

  return function(dir) {
    app.set('view engine', 'jade')
    app.set('views', 'views')
    app.engine('jade', require('jade').__express)
    app.use(stylus.middleware({
      src: dir + '/src/frontend',
      dest: 'site',
      debug: true}))
    app.use(express.static(dir + '/site'));
    app.listen(8080)
  }
})
