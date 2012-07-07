var express = require('express')
   ,socketio = require('socket.io')
   ,http = require('http')
   ,passport = require('passport')
   ,EventEmitter = require('events').EventEmitter
   ,_ = require('underscore')
   ,Lobby = require('./lobby')
   ,MemoryStore = require('connect').middleware.session.MemoryStore 
   ,cookie = require('connect').utils
   ,config = require('./config')

var GameServer = function() {
  EventEmitter.call(this)
  this.app = null
  this.port = 0
  this.server = null
  this.lobby = null
  this.sessions = new MemoryStore()
}

GameServer.prototype = {
  listen: function(port) {
    var app = express.createServer()
    var self = this
    app.configure(function() {
      app.use(express.bodyParser())
      app.use(express.cookieParser())
      app.use(express.session({ key: 'express.sid', secret: config.secret, store: self.sessions}))
      app.use(express.methodOverride())
      app.use(passport.initialize())
      app.use(passport.session())
      app.use(app.router)
      app.use(express.static('site'))
    })
    require('../routes/index')(app)
    this.app = app
    this.port = port
    this.lobby = new Lobby(this.app, this.createSessionStore(), this.createWordSource())
    this.app.listen(port, this.onStarted.bind(this))
  }
, onStarted: function() {
    this.emit('started')
  }
, createWordSource: function() {
    if(process.env.test)
      return new SequentialWordSource() 
    else
      return new FixedWordSource() 
  },
  createSessionStore: function() {
    if(process.env.test)
      return new TestAuthenticationStore()
    else
      return new ExpressAuthenticationStore(this.sessions)
  }
}
_.extend(GameServer.prototype, EventEmitter.prototype)

module.exports = GameServer 

var TestAuthenticationStore = function() {
  
}

TestAuthenticationStore.prototype = {
  get: function(headers, cb) {
    if(headers.cookie) {
      var cookieData = cookie.parseCookie(headers.cookie)
      var username = cookieData['test.cookie']
      if(!username) return cb(null, null)
      cb(null, {
        passport: {
          user: { id:  username }
        }
      })
    } else {
      cb("No cookie", null)
    }
  }
}

var ExpressAuthenticationStore = function(store) {
  this.store = store;
}

ExpressAuthenticationStore.prototype = {
  get: function(headers, cb) {
    if(headers.cookie) {
      var cookieData = cookie.parseCookie(headers.cookie)
      var sessionID = cookieData['express.sid']
      this.store.get(sessionID, cb)
    } else {
      cb("No cookie", null)
    }
  }
}

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
