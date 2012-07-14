var GameLogger = function(game) {
  this.game = game
  this.persistence = this.game.persistence
  this.lobby = this.game.lobby
  this.lobby.autoHook(this)
  this.currentRoundId = null
  this.currentArtist = null
  this.onPlayerDrawEvent = this.onPlayerDrawEvent.bind(this)
}

GameLogger.prototype = {
  onRoundStarted: function() {
    this.currentArtist = this.lobby.currentArtist
    this.persistence.createRound(this.currentArtist.id(),
                                 this.lobby.currentWord,
                                 function(roundId) {
      this.currentRoundId = roundId
      this.currentArtist.on('DrawingEvent', this.onPlayerDrawEvent) 
  }.bind(this))
  },
  onRoundEnded: function() {
    this.currentArtist.off('DrawingEvent', this.onPlayerDrawEvent) 
  },
  onPlayerDrawEvent: function(ev) {
    this.persistence.logDrawEvent(this.currentRoundId, ev)
  }
}

module.exports = GameLogger
