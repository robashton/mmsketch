
var socketio = require('socket.io')
,   util = require('util')

var Lobby = function(server) {
  this.server = server
  this.players = {}
  this.playerCount = 0
  this.gamestarted = false
  this.currentArtist = null
  this.currentWord = ''
  this.startListening()
}

var Player = function(lobby, socket) {
  this.lobby = lobby
  this.socket = socket
}

Player.prototype = {
  startDrawing: function(word) {
    this.socket.emit('status', {
      clientCount: this.lobby.playerCount,
      status: 'drawing',
      word: word
    })
    this.socket.broadcast.emit('status', {
      clientCount: this.lobby.playerCount,
      status: 'guessing'
    })
  },
  startWaiting: function() {
    this.socket.emit('status', {
      clientCount: this.lobby.playerCount,
      status: 'waiting'
    })
  },
  startGuessing: function() {
    this.socket.emit('status', {
      clientCount: this.lobby.playerCount,
      status: 'guessing'
    })
  },
  id: function() {
    return this.socket.id
  }
}

Lobby.prototype = {
  addPlayer: function(player) {
    this.players[player.id()] = player
    this.updatePlayerCount(this.playerCount+1)
    if(this.gamestarted) {
      player.startGuessing()
    }
    else {
      player.startWaiting()
      this.evaluateGameStatus()
    }
  },
  removePlayer: function(player) {
    delete this.players[player.id()]
    this.updatePlayerCount(this.playerCount-1)
    this.evaluateGameStatus()
    if(this.gamestarted && player === this.currentArtist) {
      this.currentArtist = this.chooseNewArtist()
      this.currentArtist.startDrawing(this.currentWord)
    }
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
      if(current++ === index) 
         return this.players[id];
    }
  },
  chooseNewWord: function() {

  },
  evaluateGameStatus: function() {
    if(this.playerCount < 2 && this.gamestarted)
      this.endCurrentGame()
    else if (this.playerCount >= 2 && !this.gamestarted) 
      this.startGame()
  },
  endCurrentGame: function() {
    this.currentArtist = null
    this.currentWord = null
    this.gamestarted = false
    this.io.sockets.emit('status', {
      clientCount: this.playerCount,
      status: 'waiting'
    })
  },
  startGame: function() {
    this.currentArtist = this.chooseNewArtist()
    this.currentWord = this.chooseNewWord()
    this.currentArtist.startDrawing(this.currentWord)
    this.gamestarted = true
  },
  startListening: function() {
    var io = socketio.listen(this.server)
       ,self = this
    this.io = io
    io.set('log level', 0)
    io.on('connection', function(socket) {
      var player = new Player(self, socket)
      self.addPlayer(player)
      socket.on('disconnect', function(){ 
        self.removePlayer(player)
      })
    })
  }
}

module.exports = Lobby
