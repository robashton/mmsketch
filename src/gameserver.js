var EventEmitter = require('events').EventEmitter,
    Lobby = require('./lobby'),
    _ = require('underscore'),
    config = require('./config'),
    MemoryStore = require('connect').middleware.session.MemoryStore,
    ScoreKeeper = require('./scorekeeper')
    
var WordSource = null,
    AuthStore = null,
    GameEnder = null,
    Persistence = null
   
var GameServer = function() {
  EventEmitter.call(this)
  this.app = null
  this.lobby = null
  this.sessions = new MemoryStore()
  this.persistence = null
  this.scoreKeeper = null
  setupOptionalDependencies()
}

GameServer.prototype = {
  bootstrap: function(app) {
    this.app = app
    this.persistence = new Persistence()
    this.lobby = new Lobby(
        this.app, 
        this.createSessionStore(), 
        this.createWordSource())
    this.scoreKeeper = new ScoreKeeper(this.persistence, this.lobby)
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
    Persistence = require('./mocks/inmemorypersistence')
  } else {
    AuthStore = require('./expressauthenticationstore')
    GameEnder = require('./timedgameender')
    WordSource = require('./fixedwordsource')
    Persistence = require('./redispersistence')
  }
}
