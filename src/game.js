var socketio = require('socket.io')
,   util = require('util')
,   Player = require('./player')
,   Eventable = require('./eventable')
,   _ = require('underscore')
,   config = require('./config')

var Game = function(io, index, wordSource) {
  Eventable.call(this)

  this.players = {}
  this.io = io
  this.index = index
  this.wordSource = wordSource
  this.playerCount = 0
  this.gamestarted = false
  this.currentArtist = null
  this.firstCorrectGuesser = null
  this.correctGuesserCount = 0 
  this.currentWord = ''
}


Game.prototype = {
  getPlayers: function() {
    return this.players
  },
  addPlayer: function(player) {
    if(this.players[player.id()])
      return player.rejectAsDuplicate()

    this.players[player.id()] = player
    this.updatePlayerCount(this.playerCount+1)

    if(this.gamestarted) {
      player.startGuessing()
    }
    else {
      player.startWaiting()
      this.evaluateGameStatus()
    }
    this.raise('PlayerJoined', player)
  },
  removePlayer: function(player) {
    delete this.players[player.id()]
    this.updatePlayerCount(this.playerCount-1)
    this.evaluateGameStatus()
    if(this.gamestarted && player === this.currentArtist) {
      this.currentArtist = this.chooseNewArtist()
      this.currentArtist.startDrawing(this.currentWord)
    }
    this.raise('PlayerLeft', player)
  },
  updatePlayerCount: function(count) {
    this.playerCount = count
    this.io.sockets.emit('status', {
      clientCount: this.playerCount
    })
  },
  chooseNewArtist: function() {
    var index = Math.floor(Math.random() * this.playerCount) 
       ,current = 0
       
    for(var id in this.players) {
      if(current++ >= index) {
        var player = this.players[id]
        if(player === this.currentArtist)
          continue;
         return this.players[id];
      }
    }
    return this.chooseNewArtist()
  },
  evaluateGameStatus: function() {
    if(this.playerCount < 2 && this.gamestarted)
      this.suspendGaming()
    else if (this.playerCount >= 2 && !this.gamestarted) 
      this.startGame()
  },
  suspendGaming: function() {
    this.currentArtist = null
    this.currentWord = null
    this.gamestarted = false
    this.io.sockets.emit('status', {
      clientCount: this.playerCount,
      status: 'waiting'
    })
    this.raise('RoundEnded')
  },
  startGame: function() {
    this.startGameWithArtist(this.chooseNewArtist())
  },
  nextGame: function() {
    var nextPlayer = null
    var winner = null
    if(this.firstCorrectGuesser) {
      nextPlayer = this.firstCorrectGuesser
      winner = this.firstCorrectGuesser.displayName()
      this.firstCorrectGuesser = null
    }
    var data = {
      winner: winner,
      word: this.currentWord
    }
    this.io.sockets.emit('endround', data)
    this.raise('RoundEnded', data)
    var self = this
    setTimeout(function() {
      self.startGameWithArtist(nextPlayer || self.chooseNewArtist())
    }, config.roundIntervalTime)
  },
  notifyClientsOfTimeLeft: function(timeLeft) {
    this.io.sockets.emit('countdown', timeLeft)
  },
  startGameWithArtist: function(artist) {
    this.currentArtist = artist 
    this.currentWord = this.wordSource.next() 
    this.currentArtist.startDrawing(this.currentWord)
    this.gamestarted = true
    this.io.sockets.emit('startround')
    this.raise('RoundStarted')
  },
  sendRoundIdToClients: function(id) {
    this.io.sockets.emit('lastroundid', id)
  },
  sendScoreUpdate: function(changes) {
    this.io.sockets.emit('scorechanges', changes)
  },
  notifyOfCorrectGuess: function(player) {
    if(this.firstCorrectGuesser === null) {
      this.firstCorrectGuesser = player
    }
    this.correctGuesserCount++
    this.raise('CorrectGuess', player)
    if((this.correctGuesserCount / (this.playerCount-1)) > 0.60)
      this.nextGame()
  },
  newSocket: function(socket) {
    var player = new Player(this, socket)
    this.addPlayer(player)
    this.hookDisconnection(socket, player)
  },
  hookDisconnection: function(socket, player) {
    var self = this
    socket.on('disconnect', function(){ 
      self.removePlayer(player)
    })
  },
  broadcast: function(msg, data) {
    this.io.sockets.emit(msg, data)
  }
}
_.extend(Game.prototype, Eventable.prototype)

module.exports = Game
