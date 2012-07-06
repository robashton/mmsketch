(function(exports) {
  var StatusDisplay = function(game) {
    this.clientCount = $('#client-count')
    this.clientStatus = $('#client-status')
    this.clientFeedback = $('#client-feedback')
    game.autoHook(this)
  }
  StatusDisplay.prototype = {
    onStatusUpdate: function(data) {
      this.updateStatusMessage(data)
      this.updatePlayerCount(data)
    },
    updateStatusMessage: function(data) {
      switch(data.status) {
        case 'drawing':
          return this.setStatusMessageTo('Drawing the word ' + data.word)
        case 'guessing':
          return this.setStatusMessageTo('Guessing what the other player is drawing')
        case 'waiting':
          return this.setStatusMessageTo('Waiting for other players to join')
      }
    },
    updatePlayerCount: function(data) {
      if(data.clientCount === 1)
        this.setCountMessageTo('You are the only player, invite your friends to join')
      else
        this.setCountMessageTo('There are ' + data.clientCount + ' players connected')
    },
    onWrongGuess: function(word) {
      this.addMessage(word + ' is not the word')
    },
    onCorrectGuess: function(data) {
      this.addMessage(data.word + ' was correct!')
    },
    onGoodDrawing: function(data) {
      this.addMessage(data.word + ' was guessed correctly')
    },
    addMessage: function(message) {
      this.clientFeedback.append($('<p/>').text(message))
    },
    setCountMessageTo: function(message) {
      this.clientCount.text(message)
    },
    setStatusMessageTo: function(message) {
      this.clientStatus.text(message)
    }
  }
  exports.StatusDisplay = StatusDisplay
}).call(this, this)

