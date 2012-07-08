(function(exports) {

  var ArtPad = function(game) {
    this.game = game
    this.game.autoHook(this)
    this.reset()
  }

  ArtPad.prototype = {
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
    was_wiped: function() {
      return this.wiped;
    },
    reset: function() {
      this.drawingStart = null
      this.drawingMove = null
      this.drawingEnded = false
      this.wiped = false
    }
  }
  exports.ArtPad = ArtPad
  
}).call(this, window)
