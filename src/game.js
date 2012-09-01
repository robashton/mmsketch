var socketio = require('socket.io')
,   util = require('util')
,   Player = require('./player')
,   Eventable = require('./eventable')
,   _ = require('underscore')
,   config = require('./config')
,   winston = require('winston')

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
  winston.log('Creating game with id of ', this.index)
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

    winston.info('Adding player ' + player.id() + 
      ' to game ' + this.index + 
      ' now there are ' + this.playerCount + ' players')

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

    winston.info('Removing player ' + player.id() + 
      ' from game ' + this.index + 
      ' now there are ' + this.playerCount + ' players')

    this.updatePlayerCount(this.playerCount-1)
    this.evaluateGameStatus()
    if(this.gamestarted && player === this.currentArtist) {
      this.currentArtist = this.chooseNewArtist()
      this.currentArtist.startDrawing(this.currentWord)
      winston.info('Artist left game, choosing new artist')
    }
    this.raise('PlayerLeft', player)
  },
  updatePlayerCount: function(count) {
    this.playerCount = count
    this.broadcast('status', {
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
    winston.info('Suspending game ' + this.index + 
      ' due to lack of players')
    this.currentArtist = null
    this.currentWord = null
    this.gamestarted = false
    this.broadcast('status', {
      clientCount: this.playerCount,
      status: 'waiting'
    })
    this.raise('RoundEnded')
  },
  startGame: function() {
    winston.info('Starting game ' + this.index + 
      ' now it has some players in it')
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
    this.broadcast('endround', data)
    this.raise('RoundEnded', data)
    var self = this
    setTimeout(function() {
      self.startGameWithArtist(nextPlayer || self.chooseNewArtist())
    }, config.roundIntervalTime)
  },
  notifyClientsOfTimeLeft: function(timeLeft) {
    winston.info('time left in game ' + this.index + 
      ' ' + timeLeft)
    this.broadcast('countdown', timeLeft)
  },
  startGameWithArtist: function(artist) {
    winston.log('starting game ' + this.index + 
      ' with artist ' + artist.id())
    this.currentArtist = artist 
    this.currentWord = this.wordSource.next() 
    this.currentArtist.startDrawing(this.currentWord)
    this.gamestarted = true
    this.broadcast('startround')
    this.raise('RoundStarted')
  },
  sendRoundIdToClients: function(id) {
    this.broadcast('lastroundid', id)
  },
  sendScoreUpdate: function(changes) {
    this.broadcast('scorechanges', changes)
  },
  notifyOfCorrectGuess: function(player) {
    if(this.firstCorrectGuesser === null) {
      this.firstCorrectGuesser = player
    }
    this.correctGuesserCount++
    this.raise('CorrectGuess', player)
    if((this.correctGuesserCount / (this.playerCount-1)) > 0.60) {
      winston.info('Enough players have guessed, starting game ' + this.index)
      this.nextGame()
    }
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
  broadcast: function(msg, data, sender) {
    for(var i in this.players) {
      var player = this.players[i]
      if(player === sender) continue
      player.send(msg, data)
    }
  }
}
_.extend(Game.prototype, Eventable.prototype)

module.exports = Game
