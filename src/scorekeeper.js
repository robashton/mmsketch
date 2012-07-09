var ScoreKeeper = function(persistence, game) {
  this.game = game
  this.persistence = persistence
  this.game.autoHook(this)
  this.winners = []
}

ScoreKeeper.prototype = {
  onPlayerJoined: function(player) {
    this.persistence.getGlobalScoreForPlayer(player.id(), function(score) {
      player.sendGlobalScore(score)
    })
  },
  onRoundStarted: function() {
    this.artist = this.game.currentArtist
    this.winners = [] 
  },
  onCorrectGuess: function(player) {
    this.winners.push(player) 
  },
  onRoundEnded: function() {
    for(var i =0 ; i < this.winners.length; i++) {
      var winner = this.winners[i]
      winner.addToScore(1)
    }
    if(this.winners.length > 0)
      this.artist.addToScore(1)
  }   
}

module.exports = ScoreKeeper
