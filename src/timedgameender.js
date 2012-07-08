
var TimedGameEnder = function(game, gameTime, intervalTime) {
  this.game = game
  this.gameTime = gameTime
  this.intervalTime = intervalTime * 1000
  this.lastStartTime = null
  this.running = false
  this.game.on('GameStarted', this.onGameStarted.bind(this))
  this.game.on('GameEnded', this.onGameEnded.bind(this))
  setInterval(this.onTick.bind(this), 1000)
}

TimedGameEnder.prototype = {
  onGameStarted: function() {
    this.lastStartTime = new Date() 
    this.running = true
  },
  onGameEnded: function() {
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
