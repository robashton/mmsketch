(function(exports) {

  var Game = function() {
    Eventable.call(this)
    this.socket = null
    this.started = false
    this.roundstarted = false
    this.status = 'waiting'
  }

  Game.prototype = {
    start: function() {
      this.socket = io.connect()
      this.socket.on('status', _.bind(this.onServerStatus, this))
      this.socket.on('wrong', _.bind(this.onWrongGuess, this))
      this.socket.on('correct', _.bind(this.onCorrectGuess, this))
      this.socket.on('startround', _.bind(this.onRoundStarted, this))
      this.socket.on('endround', _.bind(this.onRoundEnded, this))
      this.socket.on('reject', _.bind(this.onReject, this))
      this.socket.on('error', _.bind(this.onError, this))
      this.socket.on('drawingstart', _.bind(this.onDrawingStart, this))
      this.socket.on('drawingmove', _.bind(this.onDrawingMove, this))
      this.socket.on('drawingend', _.bind(this.onDrawingEnd, this))
      this.socket.on('countdown', _.bind(this.onCountdown, this))
      this.socket.on('selectbrush', _.bind(this.onBrushSelected, this))
      this.socket.on('selectcolour', _.bind(this.onColourSelected, this))
      this.socket.on('you', _.bind(this.onPersonalInfoReceived, this))
      this.socket.on('globalscorechanged', _.bind(this.onGlobalScoreChanged, this))
      this.socket.on('playerjoined', _.bind(this.onPlayerJoined, this))
      this.socket.on('playerleft', _.bind(this.onPlayerLeft, this))
      this.socket.on('scorechanges', _.bind(this.onScoreChanges, this))
      this.socket.on('lastroundid', _.bind(this.onLastRoundId, this))
      this.socket.on('joinedgame', _.bind(this.onJoinedGame, this))
    },
    stop: function() {
      this.socket.disconnect()
    },
    submitWord: function(word) {
      this.socket.emit('guess', word)
    },
    onLastRoundId: function(id) {
      this.raise('LastRoundId', id)
    },
    onPlayerJoined: function(player) {
      this.raise('PlayerJoined', player)
    },
    onPlayerLeft: function(player) {
      this.raise('PlayerLeft', player)
    },
    onJoinedGame: function(data) {
      this.raise('JoinedGame', data)
    },
    onPersonalInfoReceived: function(player) {
      this.raise('PersonalInfoReceived', player)
    },
    onGlobalScoreChanged: function(data) {
      this.raise('GlobalScoreChanged', data)
    },
    onScoreChanges: function(changes) {
      this.raise('ScoresUpdated', changes)
    },
    onReject: function() {
      this.raise('Rejected')
      this.status = 'rejected'
    },
    onError: function(msg) { 
      if(msg === 'handshake error')
        this.raise('NeedAuth')
    },
    onCountdown: function(time) {
      this.raise('Countdown', time)
    },
    onServerStatus: function(data) {
      this.status = data.status
      this.clientCount = data.clientCount
      this.raise('StatusUpdate', data)
      if(!this.started) {
        this.started = true
        this.raise('Started')
      }
    },
    onWrongGuess: function(word) {
      this.raise('WrongGuess', word)
    },
    onCorrectGuess: function(data) {
      if(data.win) {
        this.status = 'waiting'
        this.raise('MyCorrectGuess', data)
      } else 
        this.raise('OtherCorrectGuess', data)
    },
    onRoundStarted: function() {
      this.raise('RoundStarted')
      if(this.status === 'drawing') {
        this.sendSelectColour('#000')
        this.sendSelectBrush('brush')
      }
    },
    onRoundEnded: function(data) {
      this.raise('RoundEnded', data)
    },
    isDrawing: function() {
      return this.status === 'drawing'
    },
    sendDrawingStart: function(position) {
      if(!this.isDrawing()) return
      this.onDrawingStart(position)
      this.socket.emit('drawingstart', position)
    },
    sendDrawingMove: function(position) {
      if(!this.isDrawing()) return
      this.onDrawingMove(position)
      this.socket.emit('drawingmove', position)
    },
    sendDrawingEnd: function(position) {
      if(!this.isDrawing()) return
      this.onDrawingEnd(position)
      this.socket.emit('drawingend', position)
    },
    sendSelectBrush: function(brush) {
      if(!this.isDrawing()) return
      this.onBrushSelected(brush)
      this.socket.emit('selectbrush', brush)
    },
    sendSelectColour: function(colour) {
      if(!this.isDrawing()) return
      this.onColourSelected(colour)
      this.socket.emit('selectcolour', colour)
    },
    onDrawingStart: function(position) {
      this.raise('DrawingStart', position)
    },
    onDrawingMove: function(position) {
      this.raise('DrawingMove', position)
    },
    onDrawingEnd: function(position) {
      this.raise('DrawingEnd', position)
    },
    onBrushSelected: function(brush) {
      this.raise('BrushSelected', brush)
    },
    onColourSelected: function(colour) {
      this.raise('ColourSelected', colour)
    }
  }
  _.extend(Game.prototype, Eventable.prototype)

  exports.Game = Game
}(this));
