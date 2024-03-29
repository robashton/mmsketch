var ScoreKeeper = function(persistence, game) {
  this.game = game
  this.persistence = persistence
  this.game.autoHook(this)
  this.winners = []
  this.onPlayerLoaded = this.onPlayerLoaded.bind(this)
  this.onPlayerScoreChanged = this.onPlayerScoreChanged.bind(this)
}

ScoreKeeper.prototype = {
  onPlayerJoined: function(player) {
    player.on('Loaded', this.onPlayerLoaded)
    player.on('ScoreChanged', this.onPlayerScoreChanged)
    this.persistence.getGlobalScoreForPlayer(player.id(), function(score) {
      player.sendGlobalScore(score)
    })
  },
  onPlayerLeft: function(player) {
    this.game.broadcast('playerleft', player.getJSON())
    player.off('Loaded', this.onPlayerLoaded)
    player.off('ScoreChanged', this.onPlayerScoreChanged)
  },
  onPlayerLoaded: function(data, player) {
    this.game.broadcast('playerjoined', player.getJSON())
  },
  onRoundStarted: function() {
    this.artist = this.game.currentArtist
    this.winners = [] 
  },
  onCorrectGuess: function(player) {
    this.winners.push(player) 
  },
  onPlayerScoreChanged: function(data, sender) {
    this.persistence.setGlobalScoreForPlayer(sender.id(), sender.globalScore)
  },
  onRoundEnded: function() {
    var scoreChanges = []
    for(var i =0 ; i < this.winners.length; i++) {
      var winner = this.winners[i]
      winner.addToScore(1)
      scoreChanges.push({
        player: winner.id(),
        score: winner.gameScore
      })
    }
    if(this.winners.length > 0) {
      this.artist.addToScore(1)
      scoreChanges.push({
        player: this.artist.id(),
        score: this.artist.gameScore
      })
    }
    this.game.sendScoreUpdate(scoreChanges)
  }   
}

module.exports = ScoreKeeper
