(function(exports) {
  var StatusDisplay = function(game) {
    this.clientCount = $('#client-count')
    this.clientStatus = $('#client-status')
    this.clientFeedback = $('#client-feedback')
    game.autoHook(this)
  }
  StatusDisplay.prototype = {
    onStatusUpdate: function(data) {
      this.updateStatusMessage(data)
      this.updatePlayerCount(data)
    },
    onWrongGuess: function(word) {
      this.addMessage(word + ' is not the word')
    },
    onMyCorrectGuess: function(data) {
      this.addMessage('You guessed ' +  data.word + ' correctly!')
    },
    onOtherCorrectGuess: function(data) {
      this.addRichMessage(
        $('<span/>')
          .append(
            $('<img/>')
              .attr('src', data.player.displayPicture))
          .append(
            $('<p/>').text(data.player.displayName + 
              ' guessed the word correctly!'))
      )
    },
    onRoundEnded: function(data) {
      this.setStatusMessageTo('Waiting for the next round')
      if(!data.winner)
        this.addPlayerGuessedFirstMessage(data)
      else
        this.addMessage('Nobody guessed the word ' + data.word)
    },
    onNeedAuth: function() {
      window.location = '/login'
    },
    onRejected: function() {
      this.setStatusMessageTo('Multiple logins from the same account forbidden to prevent cheating')
    },
    addPlayerGuessedFirstMessage: function(data) {
      this.addRichMessage(
        $('<span/>')
          .append(
            $('<img/>')
              .attr('src', data.player.displayPicture))
          .append(
            $('<p/>').text(data.player.displayName + 
              ' guessed the word ' + data.word + 'first'))
      )
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
    addMessage: function(message) {
      this.clientFeedback.append(
          $('<span/>')
            .append(
              $('<p/>').text(message))
      )
    },
    addRichMessage: function(html) {
      this.clientFeedback.append(html)
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
}).call(this, this)

