var config = require('../src/config')

module.exports = function(app, game) {
  var playerData = [],
      recentRounds = [],
      lobby = game.lobby
    
  app.get('/players', function(req, res) {
    res.send(playerData) 
  })

  app.get('/round/:id', function(req, res) {
    game.persistence.getRound(req.params.id, function(err, round) {
      res.send(round) 
    })
  })

  app.get('/recent', function(req, res) {
    res.send(recentRounds)
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
    var players = lobby.getPlayers()
    for(var i in players) {
      var player = players[i]
      playerData.push(player.getJSON())
    }
  }
  refreshPlayerData()

  lobby.on('PlayerJoined', refreshPlayerData)
  lobby.on('PlayerLeft', refreshPlayerData)
  game.gamelogger.on('RoundSaved', onRoundSaved)
}
