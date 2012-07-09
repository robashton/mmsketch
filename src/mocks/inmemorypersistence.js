var InMemoryPersistence = function() {
  this.scores = {}
  process.on('message', this.onMessage.bind(this))
}

InMemoryPersistence.prototype = {
  getGlobalScoreForPlayer: function(id, cb) {
    var score = this.scores[id] || 0
    process.nextTick(function() {
      cb(score)
    })
  },
  onMessage: function(msg) {
    var handler = this['handle' + msg.command]    
    if(handler)
      handler.call(this, msg)
  },
  handleSetGlobalScore: function(msg) {
    this.scores[msg.userid] = msg.score
  }
}


module.exports = InMemoryPersistence