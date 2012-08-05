(function(exports) {

  var ArtPadInput = function(game) {
    this.game = game
    this.game.autoHook(this)
    this.reset()
  }

  ArtPadInput.prototype = {
    onDrawingStart: function(position) {
      this.drawingStart = position
    },
    onDrawingMove: function(position) {
      this.drawingMove = position
    },
    onDrawingEnd: function() {
      this.drawingEnded = true
    },
    onRoundStarted: function() {
      this.wiped = true
    },
    onBrushSelected: function(brush) {
      this.chosenBrush = brush
    },
    onColourSelected: function(colour) {
      this.chosenColour = colour
    },
    doDrawStart: function(x, y) {
      this.game.sendDrawingStart({
        x: x,
        y: y
      })
    },
    doDrawMove: function(x, y) {
      this.game.sendDrawingMove({
        x: x,
        y: y
      })
    },
    doChooseBrush: function(brush) {
      this.game.sendSelectBrush(brush)
    },  
    doChooseColour: function(colour) {
      this.game.sendSelectColour(colour)
    },
    doDrawEnd: function() {
      this.game.sendDrawingEnd()
    },
    sawDrawStart: function(x,y) {
      return !!this.drawingStart && 
             this.drawingStart.x === x &&
             this.drawingStart.y === y
    },
    sawDrawMove: function(x, y) {
      return !!this.drawingMove &&
             this.drawingMove.x === x &&
             this.drawingMove.y === y
    },
    sawDrawEnd: function() {
      return !!this.drawingEnded
    },
    sawBrushChosen: function(brush) {
      return this.chosenBrush === brush
    },
    sawColourChosen: function(colour) {
      return this.chosenColour === colour
    },
    was_wiped: function() {
      return this.wiped;
    },
    reset: function() {
      this.drawingStart = null
      this.drawingMove = null
      this.drawingEnded = false
      this.chosenColour = null
      this.chosenBrush = null
      this.wiped = false
    }
  }
  exports.ArtPadInput = ArtPadInput
  
}(window));
