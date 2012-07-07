(function(exports) {
  var Input = function(game) {
    this.game = game
    this.textInputContainer = $('#client-input-container')
    this.textInput = $('#client-input')
    this.textInputButton = $('#client-input-button')
    this.paintInputContainer = $('#client-paintbrush-container')
    game.autoHook(this)
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
    }
  }

  exports.Input = Input
}).call(this, this)
