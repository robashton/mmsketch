module.exports = function(app, game) {
  var playerData = [],
      lobby = game.lobby
    
  app.get('/players', function(req, res) {
    res.send(playerData) 
  })

  app.get('/round/:id', function(req, res) {
    game.persistence.getRound(req.params.id, function(err, round) {
      res.send(round) 
    })
  })

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
}
