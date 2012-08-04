var config = require('../src/config')

module.exports = function(app, server) {
  var playerData = [],
      recentRounds = [],
      game = server.game
    
  app.get('/players', function(req, res) {
    if(!req.user)
      return res.end(401)
    res.send(playerData[req.user.gameIndex]) 
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

  function refreshPlayerData(changedPlayer) {
    var localPlayerData = []
    var players = server.getPlayers(changedPlayer.gameIndex)
    for(var i in players) {
      var player = players[i]
      localPlayerData.push(player.getJSON())
    }
   playerData[changedPlayer.gameIndex] = localPlayerData
  }

  server.on('PlayerJoined', refreshPlayerData)
  server.on('PlayerLeft', refreshPlayerData)
  server.on('RoundSaved', onRoundSaved)
}
