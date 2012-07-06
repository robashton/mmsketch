var express = require('express')
   ,socketio = require('socket.io')
   ,http = require('http')
   ,passport = require('passport')
   ,EventEmitter = require('events').EventEmitter
   ,_ = require('underscore')
   ,Lobby = require('./lobby')

var GameServer = function() {
  EventEmitter.call(this)
  this.app = null
  this.port = 0
  this.server = null
  this.lobby = null
}

GameServer.prototype = {
  listen: function(port) {
    var app = express()
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
    this.port = port
    this.server = http.createServer(app)
    this.lobby = new Lobby(this.server, this.createWordSource())
    this.server.listen(port, this.onStarted.bind(this))
  }
, close: function(cb) {
    this.server.close(cb)
  }
, onStarted: function() {
    this.emit('started')
  }
, createWordSource: function() {
    if(process.env.test)
      return new SequentialWordSource() 
    else
      return new FixedWordSource() 
  }
}
_.extend(GameServer.prototype, EventEmitter.prototype)

module.exports = GameServer 

var SequentialWordSource = function() {
  this.words = process.env.words.split(',')
}
var FixedWordSource = function() {
  this.words = [ 'orange', 'blue', 'green' ] 
}

SequentialWordSource.prototype.next = 
FixedWordSource.prototype.next = function() {
  return this.words.shift()
}
