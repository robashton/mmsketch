(function(exports) {
  var Input = function(game) {
    this.game = game
    this.textInputContainer = $('#client-input-container')
    this.textInput = $('#client-input')
    this.textInputButton = $('#client-input-button')
    this.paintInputContainer = $('#client-paintbrush-container')
    game.autoHook(this)
    this.textInputButton.click(_.bind(this.onInputButtonClick, this))
    this.textInput.keydown(_.bind(this.onInputKeyDown, this))
  }
  Input.prototype = {
    onStatusUpdate: function(data) {
      switch(data.status) {
        case 'waiting': 
          return this.statusWaiting()
        case 'drawing': 
          return this.statusDrawing()
        case 'guessing':
          return this.statusGuessing()
      }
    },
    onMyCorrectGuess: function() {
      this.statusWaiting()
    },
    statusWaiting: function() {
      this.textInputContainer.hide()
      this.paintInputContainer.hide()
    },
    statusDrawing: function() {
      this.paintInputContainer.show()
      this.textInputContainer.hide()
    },
    statusGuessing: function() {
      this.paintInputContainer.hide()
      this.textInputContainer.show()
      this.textInput.focus()
    },
    onInputButtonClick: function() {
      this.submitText()   
    },
    onInputKeyDown: function(e) {
      if(e.keyCode === 13)
        this.submitText()
    },
    submitText: function() {
      var val = this.textInput.val()
      this.textInput.val('')
      this.game.submitWord(val)
      this.textInput.focus()
    }
  }

  exports.Input = Input
}).call(this, this);
