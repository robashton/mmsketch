var InMemoryPersistence = function() {
  this.scores = {}
  this.rounds = []
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
  createRound: function(player, word, cb) {
    this.rounds.push({
      player: player,
      events: [],
      word: word
    })
    var id = this.rounds.length-1
    process.nextTick(function(){ 
      cb(id)
    })
  },
  getRound: function(id, cb) {
    var round = this.rounds[id]
    var user = this.users[round.player]
    process.nextTick(function() {
      cb(null, {
        player: user,
        events: round.events,
        word: round.word
      })
    })
  },
  logDrawEvent: function(roundId, ev) {
    this.rounds[roundId].events.push(ev)
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
