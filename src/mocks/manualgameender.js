var ManualGameEnder = function(game) {
  process.on('message', function(m) {
    if(m.command === 'next-game')
      game.nextGame(0)
  })
}

ManualGameEnder.prototype = {

}


module.exports = ManualGameEnder
