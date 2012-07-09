(function(exports) {
  var FeedbackDisplay = function(game) {
    this.clientFeedback = $('#client-feedback')
    this.game = game
    this.game.autoHook(this)
  }

  FeedbackDisplay.prototype = {
    onWrongGuess: function(word) {
      this.addMessage('img/sadface.png', word + ' is not the word, guess again!')
    },
    onMyCorrectGuess: function(data) {
      this.addMessage('img/happyface.png', 'You guessed ' +  data.word + ' correctly! Now let\'s wait for the slow mo\'s')
    },
    onOtherCorrectGuess: function(data) {
      this.addMessage(
        data.player.displayPicture,
        data.player.displayName + ' guessed the word correctly')
    },
    onRoundEnded: function(data) {
      if(data.winner)
        this.addMessage('img/happyface.png', 'The word was correctly guessed as ' + data.word)
      else
        this.addMessage('img/shockedface.png', 'Nobody guessed the word ' + data.word)
    },
    addPlayerGuessedFirstMessage: function(data) {
      this.addMessage(
        data.player.displayPicture,
        data.player.displayName + 'guessed the word ' + data.word + 'first')
    },
    addMessage: function(picture, message) {
      var html =
        $('<span/>')
          .append(
            $('<img/>')
              .attr('src', picture)
          )
          .append($('<p/>').text(message))
      this.clientFeedback.append(html)
    }  
  }

  exports.FeedbackDisplay = FeedbackDisplay
}).call(this, this)
