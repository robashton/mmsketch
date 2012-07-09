(function(exports) {
  var FeedbackDisplay = function(game) {
    this.clientFeedback = $('#client-feedback')
    this.game = game
    this.game.autoHook(this)
  }

  FeedbackDisplay.prototype = {
    onWrongGuess: function(word) {
      this.addMessage(word + ' is not the word')
    },
    onMyCorrectGuess: function(data) {
      this.addMessage('You guessed ' +  data.word + ' correctly!')
    },
    onOtherCorrectGuess: function(data) {
      this.addRichMessage(
        data.player.displayPicture,
        data.player.displayName + ' guessed the word correctly')
    },
    onRoundEnded: function(data) {
      if(data.winner)
        this.addMessage('The word was correctly guessed as ' + data.word)
      else
        this.addMessage('Nobody guessed the word ' + data.word)
    },
    addPlayerGuessedFirstMessage: function(data) {
      this.addRichMessage(
          data.player.displayPicture,
          data.player.displayName + 'guessed the word ' + data.word + 'first')
    },
    addMessage: function(message) {
      this.clientFeedback.append(
          $('<span/>')
            .append(
              $('<p/>').text(message))
      )
    },
    addRichMessage: function(picture, message) {
      var html =
        $('<span/>')
          .append(
            $('<img/>')
              .attr('src', picture))
          .append($('<p/>').text(message))
      this.clientFeedback.append(html)
    }  
  }

  exports.FeedbackDisplay = FeedbackDisplay
}).call(this, this)
