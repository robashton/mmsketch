var  config = require('./src/config')
   , GameServer = require('./src/gameserver')
   , Balancing = require('./src/balancing')
   , passport = require('passport')
   , express = require('express')
   , path = require('path')
   , WEBROOT = path.join(path.dirname(__filename), 'site')
   , MemoryStore = require('connect').middleware.session.MemoryStore

var app = express.createServer()
  , sessions = new MemoryStore()

app.configure(function() {
  app.use(express.bodyParser())
  app.use(express.cookieParser())
  app.use(express.session({ key: 'express.sid', secret: config.secret, store: sessions}))
  app.use(express.methodOverride())
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(app.router)
  app.use(express.static(WEBROOT))
})
app.WEBROOT = WEBROOT

app.listen(process.env.port || config.port, notifyListenersReady)

var balancing = new Balancing(app, sessions)

require('./routes/index')(app, balancing.game)

balancing.game.gamelogger.on('RoundSaved', function(id) {
  if(process.send)
    try { process.send({ command: 'lastround', id: id}) } catch(e) { console.log(e)}
})
function notifyListenersReady() {
  if(process.send)
    process.send({ command: 'ready'})
}

process.on('message', function(msg) {
  if(msg.command === 'SetGlobalScore')
    balancing.game.persistence.setGlobalScoreForPlayer(msg.userid, msg.score)
})
