var redis = require('redis'),
    config = require('./config'),
    client = redis.createClient(config.redisport)

var RedisPersistence = function() {
  
}

RedisPersistence.prototype = {
  getGlobalScoreForPlayer: function(id, cb) {
    var rid  = this.keyForUser(id)
    client.get(rid, function(err, value) {
      cb(value || 0)
    })
  },
  savePlayer: function(id, data, cb) {
    var rid = this.keyForUser(id)
    client.hmset(rid, data, function(err) {
      if(cb) cb(err) 
    });
  },
  getPlayer: function(id, cb) {
    var rid = this.keyForUser(id)
    client.hgetall(rid, function(err, data) {
      cb(data)
    })
  },
  setGlobalScoreForPlayer: function(id, score, cb) {
    var rid = this.keyForUser(id)
    client.hset(rid, 'score', score, cb)
  },
  keyForScoreId: function(id) {
    return 'user:' + id + ':score'
  },
  keyForUser: function(id) {
    return 'user:' + id
  }
}

module.exports = RedisPersistence
