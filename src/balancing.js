var GameServer = require('./gameserver')
  , _ = require('underscore')
  , Eventable = require('./eventable')
  , socketio = require('socket.io')
  , AuthStore = null
  , Persistence = null
  , config = require('./config')
  , winston = require('winston')

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
  handleNewSocket: function(socket) {
    var availableServer = null
    for(var i = 0; i < this.games.length; i++) {
      if(this.games[i].game.playerCount < this.roomSize) {
        availableServer = this.games[i]
        break;
      }
    }

    if(!availableServer) {
      winston.log('Creating a new server, there are currently ', this.games.length)
      availableServer = new GameServer(
        this.io, 
        this.games.length, 
        this.sessions, 
        this.persistence)

      this.games.push(availableServer)
      this.hookServerEvents(availableServer)
    }
    else
      winston.log('Using an existing server for player, there are ', this.games.length)
    availableServer.game.newSocket(socket)
  },
  hookServerEvents: function(server) {
    server.gamelogger.on('RoundSaved', this.onRoundSaved, this)
  },
  onRoundSaved: function(player, sender) {
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
  }
}

_.extend(Balancing.prototype, Eventable.prototype)

if(process.env.test) {
  winston.log('Starting in mode "test"')
  AuthStore = require('./mocks/testauthenticationstore')

  if(process.env.redis === true) {
    Persistence = require('./redispersistence')
    winston.log('Using redis persistence')
  }
  else {
    Persistence = require('./mocks/inmemorypersistence')
    winston.log('Using in memory persistence')
  }

} else {
  winston.log('Starting in mode "non-test"')
  if(process.env.offline) {
    AuthStore = require('./mocks/offlineauthenticationstore')
    winston.log('Starting in offline mode')
  }
  else {
    AuthStore = require('./expressauthenticationstore')
    winston.log('Using express authentication store')
  }
  Persistence = require('./redispersistence')
}

module.exports = Balancing
