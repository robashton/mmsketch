var Player = function(lobby, socket) {
  this.lobby = lobby
  this.socket = socket
  this.socket.on('guess', this.onGuess.bind(this))
  this.socket.on('drawingstart', this.onDrawingStart.bind(this))
  this.socket.on('drawingmove', this.onDrawingMove.bind(this))
  this.socket.on('drawingend', this.onDrawingEnd.bind(this))
  this.socket.on('selectbrush', this.onBrushSelected.bind(this))
  this.socket.on('selectcolour', this.onColourSelected.bind(this))
}

Player.prototype = {
  isDrawing: function() {
    return this === this.lobby.currentArtist 
  },
  startDrawing: function(word) {
    this.socket.emit('status', {
      clientCount: this.lobby.playerCount,
      status: 'drawing',
      word: word,
      player: this.getJSON()
    })
    this.socket.broadcast.emit('status', {
      clientCount: this.lobby.playerCount,
      status: 'guessing',
      player: this.getJSON()
    })
  },
  startWaiting: function() {
    this.socket.emit('status', {
      clientCount: this.lobby.playerCount,
      status: 'waiting',
    })
  },
  startGuessing: function() {
    this.socket.emit('status', {
      clientCount: this.lobby.playerCount,
      status: 'guessing',
      player: this.lobby.currentArtist.getJSON()
    })
  },
  rejectAsDuplicate: function() {
    this.socket.emit('reject', 'duplicate');
    this.socket.disconnect()
  },
  id: function() {
    return this.socket.handshake.user.id
  },
  getJSON: function() {
    return {
      displayName: this.displayName(),
      displayPicture: this.displayPicture()
    }
  },
  displayName: function() {
    return this.socket.handshake.user.displayName
  },
  displayPicture: function() {
    return 'https://graph.facebook.com/' + 
            this.socket.handshake.user.username + '/picture'
  },
  onGuess: function(word) {
    if(word === this.lobby.currentWord) {
      this.lobby.notifyOfCorrectGuess(this)
      this.socket.emit('correct', {
        word: word,
        player: this.getJSON(),
        win: true
      })
      this.socket.broadcast.emit('correct', {
        player: this.getJSON(),
        win: false
      })
    }
    else
      this.socket.emit('wrong', word)
  },
  onDrawingStart: function(position) {
    if(!this.isDrawing()) return
    this.socket.broadcast.emit('drawingstart', position)
  },
  onDrawingMove: function(position) {
    if(!this.isDrawing()) return
    this.socket.broadcast.emit('drawingmove', position)
  },
  onDrawingEnd: function(position) {
    if(!this.isDrawing()) return
    this.socket.broadcast.emit('drawingend', position)
  },
  onBrushSelected: function(brush) {
    if(!this.isDrawing()) return
    this.socket.broadcast.emit('selectbrush', brush)
  },
  onColourSelected: function(colour) {
    if(!this.isDrawing()) return
    this.socket.broadcast.emit('selectcolour', colour)
  }
}
module.exports = Player
