(function(exports) {
  var PlayerListDisplay = function(game) {
    this.game = game
    this.game.autoHook(this)
    this.downloadInitialList()
  }

  PlayerListDisplay.prototype = {
    downloadInitialList: function() {
      var self = this
      $.getJSON('/players', function(data) {
        for(i in data)
          self.addPlayer(data[i])
      })
    },
    onPlayerJoined: function(data) {
      self.addPlayer(data)
    },
    onPlayerLeft: function(data) {
      self.removePlayer(data)
    },
    addPlayer: function(player) {

    },
    removePlayer: function(player) {

    }
  }
})(this)

