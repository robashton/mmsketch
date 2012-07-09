(function(exports) {

  var PersonalStatusDisplay = function(game) {
    this.game = game;
    this.game.autoHook(this)
  }
  
  PersonalStatusDisplay.prototype = {
    onScoreChanged: function(score) {
      
    }
  }

  exports.PersonalStatusDisplay = PersonalStatusDisplay
}).call(this, this)
