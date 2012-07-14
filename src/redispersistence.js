var redis = require('redis'),
    config = require('./config'),
    client = redis.createClient(config.redisport)

var RedisPersistence = function() {
  
}

RedisPersistence.prototype = {
  getGlobalScoreForPlayer: function(id, cb) {
    var rid  = this.keyForId(id)
    client.get(rid, function(err, value) {
      cb(value || 0)
    })
  },
  setGlobalScoreForPlayer: function(id, score, cb) {
    var rid = this.keyForId(id)
    client.set(rid, score, cb)
  },
  keyForId: function(id) {
    return 'score:' + id
  },
}

module.exports = RedisPersistence
