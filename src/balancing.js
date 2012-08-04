var GameServer = require('./gameserver')
  , socketio = require('socket.io')
  , AuthStore = null
  , Persistence = null

var Balancing = function(app, sessions) {
  var io = socketio.listen(app)
  this.io = io
  this.persistence = new Persistence()
  this.game = new GameServer(io, sessions, this.persistence)
  this.authentication = new AuthStore(sessions, this.persistence)
  io.set('log level', 0)
  io.set('authorization', this.handleAuthorization.bind(this))
  io.on('connection', this.handleNewSocket.bind(this))
}

Balancing.prototype = {
  handleNewSocket: function(socket) {
    this.game.game.newSocket(socket)
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
