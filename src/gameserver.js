var EventEmitter = require('events').EventEmitter,
    GameInstance = require('./game'),
    _ = require('underscore'),
    config = require('./config'),
    ScoreKeeper = require('./scorekeeper'),
    GameLogger = require('./gamelogger'),
    ImageGenerator = require('./imagegenerator')
    
var WordSource = null,
    GameEnder = null
   
var GameServer = function(io, sessions, persistence) {
  EventEmitter.call(this)
  this.app = null
  this.game = null
  this.sessions = sessions
  this.io = io
  this.persistence = persistence
  this.scoreKeeper = null
  this.gamelogger = null
  this.imageGenerator = null
  setupOptionalDependencies()
  this.bootstrap()
}

GameServer.prototype = {
  bootstrap: function() {
    this.game = new GameInstance(
        this.io,
        this.createWordSource())
    this.scoreKeeper = new ScoreKeeper(this.persistence, this.game)
    this.gametimer = this.createGameTimer()
    this.gamelogger = new GameLogger(this)
    this.imageGenerator = new ImageGenerator(this)
    this.gamelogger.on('RoundSaved', this.onRoundSaved, this)
  },
  onRoundSaved: function(id) {
    this.game.sendRoundIdToClients(id)
  },
  createWordSource: function() {
    return new WordSource()
  },
  createGameTimer: function() {
    return new GameEnder(this.game)
  }
}
_.extend(GameServer.prototype, EventEmitter.prototype)

module.exports = GameServer 

function setupOptionalDependencies() {
  if(process.env.test) {
    GameEnder = require('./mocks/manualgameender')
    WordSource = require('./mocks/sequentialwordsource')
  } else {
    GameEnder = require('./timedgameender')
    WordSource = require('./fixedwordsource')
  }
}
