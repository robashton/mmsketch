var EventEmitter = require('events').EventEmitter
    Lobby = require('./lobby'),
    _ = require('underscore'),
    config = require('./config'),
    MemoryStore = require('connect').middleware.session.MemoryStore 
    
var WordSource = null,
    AuthStore = null,
    GameEnder = null
   
var GameServer = function() {
  EventEmitter.call(this)
  this.app = null
  this.lobby = null
  this.sessions = new MemoryStore()
  setupOptionalDependencies()
}

GameServer.prototype = {
  bootstrap: function(app) {
    this.app = app
    this.lobby = new Lobby(
        this.app, 
        this.createSessionStore(), 
        this.createWordSource())
    this.gametimer = this.createGameTimer()
  }
, createWordSource: function() {
    return new WordSource()
  },
  createSessionStore: function() {
    return new AuthStore(this.sessions)
  },
  createGameTimer: function() {
    return new GameEnder(this.lobby)
  }
}
_.extend(GameServer.prototype, EventEmitter.prototype)

module.exports = GameServer 


function setupOptionalDependencies() {
  if(process.env.test) {
    AuthStore = require('./mocks/testauthenticationstore')
    GameEnder = require('./mocks/manualgameender')
    WordSource = require('./mocks/sequentialwordsource')
  } else {
    AuthStore = require('./expressauthenticationstore')
    GameEnder = require('./timedgameender')
    WordSource = require('./fixedwordsource')
  }
}




