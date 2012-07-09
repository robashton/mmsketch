var config = require('./config')

var TimedGameEnder = function(game) {
  this.game = game
  this.gameTime = config.roundTime
  this.intervalTime = config.roundIntervalTime 
  this.lastStartTime = null
  this.running = false
  this.game.autoHook(this)
  setInterval(this.onTick.bind(this), 1000)
}

TimedGameEnder.prototype = {
  onRoundStarted: function() {
    this.lastStartTime = new Date() 
    this.running = true
  },
  onRoundEnded: function() {
    this.lastStartTime = null
    this.running = false
  },
  onTick: function() {
    if(!this.running) return
    var now = new Date()
    var diff = this.gameTime - Math.floor((now - this.lastStartTime) / 1000);
    if(diff <= 0)
      this.game.nextGame(this.intervalTime)
    else 
      this.warnClientsOfImpendingDoom(diff)
  },
  warnClientsOfImpendingDoom: function(timeLeft) {
    this.game.notifyClientsOfTimeLeft(timeLeft)
  }
}

module.exports = TimedGameEnder
