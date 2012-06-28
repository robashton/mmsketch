var express = require('express'),
    socketio = require('socket.io')
    passport = require('passport')
    EventEmitter = require('events').EventEmitter
    _ = require('underscore')

var GameServer = function() {
  EventEmitter.call(this)
  this.app = null
}

GameServer.prototype = {
  listen: function(port) {
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
    require('../routes/index')(app)
    this.app = app
    this.app.on('listening', this.onStarted.bind(this))
    this.app.listen(port)
  }
, onStarted: function() {
    this.emit('started')
  }
}
_.extend(GameServer.prototype, EventEmitter.prototype)

module.exports = GameServer 
