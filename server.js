var express = require('express'),
    socketio = require('socket.io')

var server = express.createServer()
server.configure(function() {
  server.use(express.static('site'))
  server.use(express.bodyParser())
  server.use(express.cookieParser())
  server.use(express.session({secret : 'ssshlol' }))
  server.use(express.methodOverride())
  server.use(passport.initialize())
  server.use(passport.session())
  server.use(server.router)
});
server.listen(8080);

require('./routes/index')(app)
