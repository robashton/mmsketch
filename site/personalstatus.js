(function(exports) {

  var PersonalStatusDisplay = function(game) {
    this.game = game;
    this.score = $('#player-score')
    this.avatar = $('#player-avatar')
    this.name = $('#player-name')
    this.game.autoHook(this)
  }
  
  PersonalStatusDisplay.prototype = {
    onPersonalInfoReceived: function(player) {
      this.score.text(player.globalScore)
      this.name.text(player.displayName)
      this.avatar.attr('src', player.displayPicture) 
      
    },
    onScoreChanged: function(score) {
      this.score.text(score) 
    }
  }

  exports.PersonalStatusDisplay = PersonalStatusDisplay
}).call(this, this)
