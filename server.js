var config = require('./src/config')
var GameServer = require('./src/gameserver')

var server = new GameServer()
server.listen(process.env.port || config.port)
