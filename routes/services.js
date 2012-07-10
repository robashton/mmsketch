module.exports = function(app, game) {
  var playerData = []
    
  app.get('/players', function(req, res) {
    res.send(playerData) 
  })

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
}
