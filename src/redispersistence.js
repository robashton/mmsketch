var redis = require('redis'),
    config = require('./config'),
    client = null

var RedisPersistence = function() {
  if(!client)
    client = redis.createClient(config.redisport)
}

RedisPersistence.prototype = {
  createRound: function(player, word, cb) {
    var playerKey = this.keyForUser(player)
    this.nextId('round', function(id) {
      client.hmset(id, {
        player: playerKey,
        word: word
      }, function(err) {
        cb(id)
      })
    })
  },
  logDrawEvent: function(roundId, ev) {
    client.rpush(roundId + ':events', JSON.stringify(ev))
  },
  getRound: function(id, cb) {
    client.hgetall(id, function(err, round) {
      if(err) throw err
      if(!round) return cb(null, null)
      client.hgetall(round.player, function(err, player) {
        if(err) throw err
        client.lrange(id + ':events', 0, 1000, function(err, events) {
          if(err) throw err
          var parsedEvents = []
          for(var i in events)
            parsedEvents.push( JSON.parse( events[i] ))
          cb(err, {
            player: player,
            events: parsedEvents,
            word: round.word
          })
        })
      })
    })
  },
  savePlayer: function(id, data, cb) {
    var rid = this.keyForUser(id)
    client.hmset(rid, data, function(err) {
      if(err) throw err
      if(cb) cb() 
    });
  },
  getPlayer: function(id, cb) {
    var rid = this.keyForUser(id)
    client.hgetall(rid, function(err, data) {
      cb(data)
    })
  },
  getGlobalScoreForPlayer: function(id, cb) {
    var rid  = this.keyForUser(id)
    client.hget(rid, 'score', function(err, value) {
      if(value)
        return cb(parseInt(value, 10))
      return cb(0)
    })
  },
  setGlobalScoreForPlayer: function(id, score, cb) {
    var rid = this.keyForUser(id)
    console.log('Setting score', id, score)
    client.hset(rid, 'score', score, function(err) {
      if(err) throw err
      if(cb) cb()
    })
  },
  nextId: function(type, cb) {
    client.incr('next.' + type + '.id', function(err, id) {
      cb(type + ':' + id)
    })
  },
  keyForScoreId: function(id) {
    return 'user:' + id + ':score'
  },
  keyForUser: function(id) {
    return 'user:' + id
  }
}

module.exports = RedisPersistence
