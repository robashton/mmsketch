var  config = require('./src/config')
   , GameServer = require('./src/gameserver')
   , passport = require('passport')
   , express = require('express')
   , path = require('path')
   , WEBROOT = path.join(path.dirname(__filename), 'site');

var game = new GameServer();
var app = express.createServer()
app.configure(function() {
  app.use(express.bodyParser())
  app.use(express.cookieParser())
  app.use(express.session({ key: 'express.sid', secret: config.secret, store: game.sessions}))
  app.use(express.methodOverride())
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(app.router)
  app.use(express.static(WEBROOT))
})
require('./routes/index')(app)

app.listen(process.env.port || config.port)
game.bootstrap(app)
