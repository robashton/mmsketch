define(function(require) {
  var express = require('express'),
      stylus = require('stylus'),
      app = express(),
      routes = require('./routes/index'),
      config = require('./config'),
      winston = require('winston'),
      passport = require('passport'),
      sessions = require('./sessions')
  
  return function(dir, cb) {
    app.set('view engine', 'jade')
    app.set('views', 'views')
    app.engine('jade', require('jade').__express)
    app.use(express.bodyParser())
    app.use(express.cookieParser())
    app.use(express.session({ 
      key: 'express.sid', 
      secret: config.secret, 
      store: sessions.store}))
    app.use(express.methodOverride())
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(stylus.middleware({
      src: dir + '/src/frontend',
      dest: 'site',
      debug: true}))
    app.use(app.router)
    app.use(express.static(dir + '/site'));
    routes(app)
    app.listen(config.port, cb)
  }
})
