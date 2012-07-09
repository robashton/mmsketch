var ScoreKeeper = function(persistence, game) {
  this.game = game
  this.persistence = persistence
}

ScoreKeeper.prototype = {
  onPlayerJoined: function(player) {
    this.persistence.getGlobalScoreForPlayer(player.id(), function(score) {
      player.sendGlobalScore(score)
    })
  },
  onRoundStarted: function() {
    
  },
  onRoundEnded: function() {

  }   
}
