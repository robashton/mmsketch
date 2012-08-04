var GameServer = require('./gameserver')
  , _ = require('underscore')
  , Eventable = require('./eventable')
  , socketio = require('socket.io')
  , AuthStore = null
  , Persistence = null
  , config = require('./config')

var Balancing = function(app, sessions) {
  Eventable.call(this)
  var io = socketio.listen(app)
  this.io = io
  this.persistence = new Persistence()
  this.games = []
  this.authentication = new AuthStore(sessions, this.persistence)
  this.roomSize = config.roomSize
  io.set('log level', 0)
  io.set('authorization', this.handleAuthorization.bind(this))
  io.on('connection', this.handleNewSocket.bind(this))
}

Balancing.prototype = {
  getPlayers: function(gameIndex) {
    if(this.games.length === 0) return []
    return this.games[gameIndex].game.getPlayers()
  },
  handleNewSocket: function(socket) {
    var availableServer = null
    for(var i = 0; i < this.games.length; i++) {
      if(this.games[i].game.playerCount < this.roomSize) {
        availableServer = this.games[i]
        break;
      }
    }

    if(!availableServer) {
      availableServer = new GameServer(this.io, this.sessions, this.persistence)
      this.games.push(availableServer)
      this.hookServerEvents(availableServer)
    }
    console.log('games count', this.games.length)
    availableServer.game.newSocket(socket)
  },
  hookServerEvents: function(server) {
    server.game.on('PlayerJoined', this.onPlayerJoined, this)
    server.game.on('PlayerLeft', this.onPlayerLeft, this)
    server.gamelogger.on('RoundSaved', this.onRoundSaved, this)
  },
  onPlayerJoined: function(player, sender) {
    this.raise('PlayerJoined', player, sender)
  },
  onPlayerLeft: function(player, sender) {
    this.raise('PlayerLeft', player, sender)
  },
  RoundSaved: function(player, sender) {
    this.raise('RoundSaved', player, sender)
  },

  handleAuthorization: function(data, accept) {
    this.authentication.get(data.headers, function(err, session) {
      if(err || !session) {
        return accept("Couldn't find session, please re-login", false)
      }
      if(!session.passport.user)
        return accept('Not logged in yet, please log in!', false)
      data.user = session.passport.user
      accept(null, true)
    })
  },
}

_.extend(Balancing.prototype, Eventable.prototype)

if(process.env.test) {
  AuthStore = require('./mocks/testauthenticationstore')

  if(process.env.redis === true)
    Persistence = require('./redispersistence')
  else
    Persistence = require('./mocks/inmemorypersistence')

} else {
  if(process.env.offline)
    AuthStore = require('./mocks/offlineauthenticationstore')
  else
    AuthStore = require('./expressauthenticationstore')
  Persistence = require('./redispersistence')
}

module.exports = Balancing
