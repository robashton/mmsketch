
exports.find_artist = (players) ->
  artist = null
  for player in players
    if(player.isActive() and player.isDrawing())
      artist = player
  return artist

