var ManualGameEnder = function(lobby) {
  process.on('message', function(m) {
    if(m.command === 'next-game')
      lobby.nextGame(0)
  })
}

ManualGameEnder.prototype = {

}


module.exports = ManualGameEnder
