var GameLogger = function(game) {
  this.game = game
  this.persistence = this.game.persistence
  this.lobby = this.game.lobby
  this.lobby.autoHook(this)
  this.currentRoundId = null
}

GameLogger.prototype = {
  onRoundStarted: function() {

  },
  onRoundEnded: function() {

  }
}
