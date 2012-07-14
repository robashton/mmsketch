var Eventable = require('./eventable'),
    _ = require('underscore')

var GameLogger = function(game) {
  Eventable.call(this)
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
    this.raise('RoundSaved', this.currentRoundId)
  },
  onPlayerDrawEvent: function(ev) {
    this.persistence.logDrawEvent(this.currentRoundId, ev)
  }
}

_.extend(GameLogger.prototype, Eventable.prototype)

module.exports = GameLogger
