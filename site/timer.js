(function(exports) {
  var Timer = function(game) {
    this.game = game;
    this.timerText = $('#timer-text')
    this.game.autoHook(this)
  }

  Timer.prototype = {
    onRoundEnded: function() {
      this.timerText.text('Next round starting shortly')
    },
    onCountdown: function(timeLeft) {
      this.timerText.text(timeLeft + ' seconds left') 
    }
  }

  exports.Timer = Timer
}).call(this, this)
