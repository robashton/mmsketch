(function(exports) {
  var PlayerListDisplay = function(game) {
    this.game = game
    this.game.autoHook(this)
    this.initialised = false
    this.playerElements = {}
    this.playerList = $('#room-feedback')
  }

  PlayerListDisplay.prototype = {
    onStarted: function() {
      this.downloadInitialList()
    },
    downloadInitialList: function() {
      var self = this
      $.getJSON('/players', function(data) {
        for(var i in data)
          self.addPlayer(data[i])
        self.initialised = true
      })
    },
    onScoresUpdated: function(data) {
      for(var i in data) {
        var item = data[i]
        this.updatePlayerScore(item.player, item.score)
      }
    },
    updatePlayerScore: function(player, score) {
      var element = this.playerElements[player]
      if(!element) return
      element.find('.score').text(score)

      var target = this.findTargetElementAfterScoring(score, element.prev()) 
      if(target)
        element.insertBefore(target)

    },
    findTargetElementAfterScoring: function(score, current, target) {
      if(current.length === 0) return target

      var scoreText = current.find('.score').text()
      var previousScore = parseInt(scoreText, 10)
      if(previousScore < score) {
        target = current
        current  = target.prev()
        return this.findTargetElementAfterScoring(score, current, target)
      }
      return target
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
      if(this.playerElements[player.id]) return
      var element = 
        $('<span/>')
          .append(
            $('<img/>').attr('src', player.displayPicture)
          )
          .append(
            $('<p/>').text(player.displayName)
          )
          .append(
            $('<p/>').addClass('score').text("" + player.gameScore)
          )
          .data('userid', player.id)
       this.playerList.append(element)
       this.playerElements[player.id] = element
    },
    removePlayer: function(player) {
      var element = this.playerElements[player.id]
      if(!element) return
      delete this.playerElements[player.id]
      element.remove()
    }
  }
  exports.PlayerListDisplay = PlayerListDisplay
}(this))

