(function(exports) {
  var Game = function() {
    Eventable.call(this)
    this.socket = null
    this.status = 'waiting'
  }

  Game.prototype = {
    start: function() {
      this.socket = io.connect()
      this.socket.on('status', _.bind(this.onServerStatus, this))
      this.socket.on('wrong', _.bind(this.onWrongGuess, this))
      this.socket.on('endround', _.bind(this.onRoundEnded, this))
    },
    stop: function() {
      this.socket.disconnect()
    },
    submitWord: function(word) {
      this.socket.emit('guess', word)
    }
    onServerStatus: function(data) {
      this.status = data.status
      this.clientCount = data.clientCount
      this.raise('StatusUpdate')
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
