var config = require('../src/config')

module.exports = function(app, server) {
  var playerData = [],
      recentRounds = [],
      game = server.game
    
  app.get('/players', function(req, res) {
    res.send(playerData) 
  })

  app.get('/round/:id', function(req, res) {
    server.persistence.getRound(req.params.id, function(err, round) {
      res.send(round) 
    })
  })

  app.get('/recent', function(req, res) {
    res.send(recentRounds)
  })

  app.get('/drawings/:id', function(req, res) {
    res.sendfile(config.imageDir + req.params.id + '.png')
  })

  app.get('/config', function(req, res) {
    res.send({
      appId: config.fbclientid
    })
  })

  function onRoundSaved(id) {
    if(recentRounds.length > 25)
      recentRounds.shift()
    recentRounds.unshift(id)
  }

  function refreshPlayerData() {
    playerData = []
    var players = game.getPlayers()
    for(var i in players) {
      var player = players[i]
      playerData.push(player.getJSON())
    }
  }
  refreshPlayerData()

  game.on('PlayerJoined', refreshPlayerData)
  game.on('PlayerLeft', refreshPlayerData)
  server.gamelogger.on('RoundSaved', onRoundSaved)
}
