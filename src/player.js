var Eventable = require('./eventable')
var _ = require('underscore')
var config = require('./config')
var winston = require('winston')

var Player = function(game, socket) {
  Eventable.call(this)
  this.game = game
  this.socket = socket
  this.user = socket.handshake.user
  this.gameIndex = game.index
  this.globalScore = null
  this.gameScore = 0
  this.socket.on('guess', this.onGuess.bind(this))
  this.socket.on('drawingstart', this.onDrawingStart.bind(this))
  this.socket.on('drawingmove', this.onDrawingMove.bind(this))
  this.socket.on('drawingend', this.onDrawingEnd.bind(this))
  this.socket.on('selectbrush', this.onBrushSelected.bind(this))
  this.socket.on('selectcolour', this.onColourSelected.bind(this))
  this.on('DrawingEvent', this.onDrawingEvent.bind(this))
}

Player.prototype = {
  sendPlayerList: function() {
    var playerData = []
    for(var i in this.game.players) {
      playerData.push(this.game.players[i].getJSON())
    }
    this.send('joinedgame', playerData) 
  },
  isDrawing: function() {
    return this === this.game.currentArtist 
  },
  addToScore: function(amount) {
    this.globalScore += amount
    this.gameScore += amount
    this.raise('ScoreChanged', this.gameScore)
    this.send('globalscorechanged', {
        score: this.globalScore,
        gameScore: this.gameScore
     })
   this.log('Score changed ' + this.gameScore)
  },
  startDrawing: function(word) {
    this.send('status', {
      clientCount: this.game.playerCount,
      status: 'drawing',
      word: word,
      player: this.getJSON()
    })
    this.game.broadcast('status', {
      clientCount: this.game.playerCount,
      status: 'guessing',
      player: this.getJSON()
    }, this)
    this.log('Started drawing')
  },
  startWaiting: function() {
    this.send('status', {
      clientCount: this.game.playerCount,
      status: 'waiting',
    })
   this.log('Started waiting')
  },
  startGuessing: function() {
    this.send('status', {
      clientCount: this.game.playerCount,
      status: 'guessing',
      player: this.game.currentArtist.getJSON()
    })
    this.log('Started guessing')
  },
  sendGlobalScore: function(score) {
    this.globalScore = score
    this.send('you', this.getJSON())
    this.raise('Loaded')
    this.sendPlayerList()
  },
  rejectAsDuplicate: function() {
    this.send('reject', 'duplicate');
    this.socket.disconnect()
    this.log('Rejecting duplicate player')
  },
  id: function() {
    return this.user.id
  },
  getJSON: function() {
    return {
      id: this.id(),
      displayName: this.displayName(),
      displayPicture: this.displayPicture(),
      globalScore: this.globalScore,
      gameScore: this.gameScore
    }
  },
  displayName: function() {
    return this.user.displayName
  },
  displayPicture: function() {
    return 'https://graph.facebook.com/' + 
            this.user.username + '/picture'
  },
  onGuess: function(word) {
    if(word.toUpperCase() === this.game.currentWord.toUpperCase()) {
      this.game.notifyOfCorrectGuess(this)
      this.send('correct', {
        word: this.game.currentWord,
        player: this.getJSON(),
        win: true
      })
      this.game.broadcast('correct', {
        player:  this.getJSON(),
        win: false
      }, this)
      this.log('Guessing correctly')
    }
    else { 
      this.game.broadcast('wrong', {
        word: word,
        player: this.getJSON()
      })
    }

  },
  onDrawingStart: function(position) {
    if(!this.isDrawing()) return
    this.raise('DrawingEvent', {
      event: 'drawingstart',
      data: position
    })
  },
  onDrawingMove: function(position) {
    if(!this.isDrawing()) return
    this.raise('DrawingEvent', {
      event: 'drawingmove',
      data: position
    })
  },
  onDrawingEnd: function(position) {
    if(!this.isDrawing()) return
    this.raise('DrawingEvent', {
      event: 'drawingend',
      data: position
    })
  },
  onBrushSelected: function(brush) {
    if(!this.isDrawing()) return
    this.raise('DrawingEvent', {
      event: 'selectbrush',
      data: brush
    })
  },
  onColourSelected: function(colour) {
    if(!this.isDrawing()) return
    this.raise('DrawingEvent', {
      event: 'selectcolour',
      data: colour
    })
  },
  onDrawingEvent: function(ev) {
    this.game.broadcast(ev.event, ev.data, this)
  },
  send: function(msg, data) {
    this.socket.emit(msg, data)
  },
  log: function(msg) {
    winston.info('Player: ' + this.id() +
      ' : ' + this.gameIndex + ': ' + msg)
  }
}

_.extend(Player.prototype, Eventable.prototype)
  
module.exports = Player
