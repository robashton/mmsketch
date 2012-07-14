var InMemoryPersistence = function() {
  this.scores = {}
  this.users = {}
  process.on('message', this.onMessage.bind(this))
}

InMemoryPersistence.prototype = {
  getGlobalScoreForPlayer: function(id, cb) {
    var score = this.scores[id] || 0
    process.nextTick(function() {
      cb(score)
    })
  },
  setGlobalScoreForPlayer: function(id, score, cb) {
    this.scores[id] = score
    if(cb) process.nextTick(cb)
  },
  savePlayer: function(id, data) {
    this.users[id] = data
  },
  getPlayer: function(id, cb) {
    cb(this.users[id])
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
