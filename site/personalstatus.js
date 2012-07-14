(function(exports) {

  var PersonalStatusDisplay = function(game) {
    this.game = game;
    this.score = $('#player-score')
    this.gameScore = $('#player-game-score')
    this.avatar = $('#player-avatar')
    this.name = $('#player-name')
    this.game.autoHook(this)
  }
  
  PersonalStatusDisplay.prototype = {
    onPersonalInfoReceived: function(player) {
      this.score.text('' + player.globalScore)
      this.gameScore.text('' + player.gameScore)
      this.name.text(player.displayName)
      this.avatar.attr('src', player.displayPicture) 
      
    },
    onGlobalScoreChanged: function(data) {
      this.score.text('' + data.score) 
      this.gameScore.text('' + data.gameScore)
    }
  }

  exports.PersonalStatusDisplay = PersonalStatusDisplay
}(this))
