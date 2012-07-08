var EventEmitter = require('events').EventEmitter
   ,Lobby = require('./lobby')
   ,_ = require('underscore')
   ,config = require('./config')
   ,TimedGameEnder = require('./timedgameender')
   ,FixedWordSource = require('./fixedwordsource')
   ,cookie = require('connect').utils
   , MemoryStore = require('connect').middleware.session.MemoryStore 
   
var GameServer = function() {
  EventEmitter.call(this)
  this.app = null
  this.lobby = null
  this.sessions = new MemoryStore()
}

GameServer.prototype = {
  bootstrap: function(app) {
    this.app = app
    this.lobby = new Lobby(this.app, this.createSessionStore(), this.createWordSource())
    this.gametimer = this.createGameTimer()
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
  },
  createGameTimer: function() {
    if(process.env.test)
      return new ManualGameEnder(this.lobby)
    else
      return new TimedGameEnder(this.lobby, config.roundtime, config.intervalTime)
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
          user: { id:  username, displayName: username + 'display' }
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

SequentialWordSource.prototype.next = function() {
  return this.words.shift()
}

var ManualGameEnder = function(lobby) {
  process.on('message', function(m) {
    if(m === 'next-game')
      lobby.nextGame(0)
  })
}

ManualGameEnder.prototype = {

}
