var GameServer = require('./src/gameserver')

var server = new GameServer()
server.listen(process.env.port || 8004)
