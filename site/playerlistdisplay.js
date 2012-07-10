(function(exports) {
  var PlayerListDisplay = function(game) {
    this.game = game
    this.game.autoHook(this)
    this.initialised = false
    this.playerElements = {}
    this.playerList = $('#room-feedback')
    this.downloadInitialList()
  }

  PlayerListDisplay.prototype = {
    downloadInitialList: function() {
      var self = this
      $.getJSON('/players', function(data) {
        for(i in data)
          self.addPlayer(data[i])
        self.initialised = true
      })
    },
    onPlayerJoined: function(data) {
      if(!this.initialised) return
      this.addPlayer(data)
    },
    onPlayerLeft: function(data) {
      if(!this.initialised) return
      this.removePlayer(data)
    },
    addPlayer: function(player) {
      var element = 
        $('<span/>')
          .append(
            $('<img/>').attr('src', player.displayPicture)
          )
          .append(
            $('<p/>').text(player.displayName)
          )
          .data('userid', player.id)
       this.playerList.append(element)
       this.playerElements[player.id] = element
    },
    removePlayer: function(player) {
      var element = this.playerElements[player.id]
      console.log('Removing shit')
      delete this.playerElements[player.id]
      element.remove()
    }
  }
  exports.PlayerListDisplay = PlayerListDisplay
})(this)

