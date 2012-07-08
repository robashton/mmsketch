(function(exports) {
  var Timer = function(game) {
    this.game = game;
    this.timerText = $('#timer-text')
    this.game.autoHook(this)
  }

  Timer.prototype = {
    onCountdown: function(timeLeft) {
      this.timerText.text(timeLeft + ' seconds left') 
    }
  }

  exports.Timer = Timer
}).call(this, this)
