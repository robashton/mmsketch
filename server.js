var express = require('express'),
    socketio = require('socket.io')
    passport = require('passport')

var app = express.createServer()
app.configure(function() {
  app.use(express.static('site'))
  app.use(express.bodyParser())
  app.use(express.cookieParser())
  app.use(express.session({secret : 'ssshlol' }))
  app.use(express.methodOverride())
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(app.router)
})
app.listen(8080);

require('./routes/index')(app)
