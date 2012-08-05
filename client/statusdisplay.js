(function(exports) {
  var StatusDisplay = function(game) {
    this.clientCount = $('#client-count')
    this.clientStatus = $('#client-status')
    game.autoHook(this)
  }
  StatusDisplay.prototype = {
    onStatusUpdate: function(data) {
      this.updateStatusMessage(data)
      this.updatePlayerCount(data)
    },
    onRoundEnded: function(data) {
      this.setStatusMessageTo('Waiting for the next round')
    },
    onNeedAuth: function() {
      window.location = '/login'
    },
    onRejected: function() {
      this.setStatusMessageTo('Multiple logins from the same account forbidden to prevent cheating')
    },
    updateStatusMessage: function(data) {
      switch(data.status) {
        case 'drawing':
          return this.setStatusMessageTo('Drawing the word ' + data.word)
        case 'guessing':
          return this.setStatusMessageToGuessing(data) 
        case 'waiting':
          return this.setStatusMessageTo('Waiting for other players to join')
      }
    },
    updatePlayerCount: function(data) {
      if(data.clientCount === 1)
        this.setCountMessageTo('You are the only player, invite your friends to join')
      else
        this.setCountMessageTo('There are ' + data.clientCount + ' players online')
    },
    setCountMessageTo: function(message) {
      this.clientCount.text(message)
    },
    setStatusMessageToGuessing: function(data) {
      var content = 
        $('<span/>')
          .append(
            $('<img/>')
            .attr('src', data.player.displayPicture) 
            .css('height', '25px'))
         .append(
             $('<h4/>').text(data.player.displayName + ' is drawing'))
      this.clientStatus.html(content)
    },
    setStatusMessageTo: function(message) {
      this.clientStatus.text(message)
    }
  }
  exports.StatusDisplay = StatusDisplay
}(this));

