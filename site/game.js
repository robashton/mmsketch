(function(exports) {
  var Game = function() {
    Eventable.call(this)
    this.socket = null
    this.started = false
    this.status = 'waiting'
  }

  Game.prototype = {
    start: function() {
      this.socket = io.connect()
      this.socket.on('status', _.bind(this.onServerStatus, this))
      this.socket.on('wrong', _.bind(this.onWrongGuess, this))
      this.socket.on('endround', _.bind(this.onRoundEnded, this))
      this.socket.on('reject', _.bind(this.onReject, this))
      this.socket.on('error', _.bind(this.onError, this))
    },
    stop: function() {
      this.socket.disconnect()
    },
    submitWord: function(word) {
      this.socket.emit('guess', word)
    },
    onReject: function() {
      this.raise('Rejected')
      this.status = 'rejected'
    },
    onError: function() {
      this.raise('NeedAuth')
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
    onRoundEnded: function(data) {
      if(this.status === 'guessing')
        this.raise('CorrectGuess', data)
      else if(this.status === 'drawing')
        this.raise('GoodDrawing', data)
    }
  }
  _.extend(Game.prototype, Eventable.prototype)

  exports.Game = Game
})(this)
