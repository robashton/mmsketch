var socketio = require('socket.io')
,   util = require('util')
,   Player = require('./player')
,   Eventable = require('./eventable')
,   _ = require('underscore')

var Lobby = function(server, authentication, wordSource) {
  Eventable.call(this)

  this.server = server
  this.players = {}
  this.wordSource = wordSource
  this.playerCount = 0
  this.gamestarted = false
  this.currentArtist = null
  this.firstCorrectGuesser = null
  this.currentWord = ''
  this.authentication = authentication
  this.startListening()
}


Lobby.prototype = {
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
  nextGame: function(delay) {
    var nextPlayer = null
    var winner = null
    if(this.firstCorrectGuesser) {
      nextPlayer = this.firstCorrectGuesser
      winner = this.firstCorrectGuesser.displayName()
      this.firstCorrectGuesser = null
    }
    this.io.sockets.emit('endround', {
      winner: winner,
      word: this.currentWord
    })
    this.raise('RoundEnded')
    var self = this
    setTimeout(function() {
      self.startGameWithArtist(nextPlayer || self.chooseNewArtist())
    }, delay)
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
  handleAuthorization: function(data, accept) {
    this.authentication.get(data.headers, function(err, session) {
      if(err || !session) {
        return accept("Couldn't find session, please re-login", false)
      }
      if(!session.passport.user)
        return accept('Not logged in yet, please log in!', false)
      data.user = session.passport.user
      accept(null, true)
    })
  },
  sendScoreUpdate: function(changes) {
    this.io.sockets.emit('scorechanges', changes)
  },
  notifyOfCorrectGuess: function(player) {
    if(this.firstCorrectGuesser === null) {
      this.firstCorrectGuesser = player
    }
    this.raise('CorrectGuess', player)
  },
  handleNewSocket: function(socket) {
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
  },
  startListening: function() {
    var io = socketio.listen(this.server)
    this.io = io
    io.set('log level', 0)
    io.set('authorization', this.handleAuthorization.bind(this))
    io.on('connection', this.handleNewSocket.bind(this))
  }
}
_.extend(Lobby.prototype, Eventable.prototype)

module.exports = Lobby
