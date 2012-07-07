
(function(exports) {

  var ArtPad = function(game) {
    this.game = game
    this.lastPosition = null
    this.canvas = document.getElementById('surface')
    this.context = this.canvas.getContext('2d')
    this.game.autoHook(this)
    this.hookDrawingInput()
  }

  ArtPad.prototype = {
    onDrawingStart: function(data) {
      this.lastPosition = data.position
    },
    onDrawingMove: function(data) {
      this.drawLine(this.lastPosition, data.position)
      this.lastPosition = data.position
    },
    onDrawingEnd: function(data) {
      this.lastPosition = null
    },
    drawLine: function(from, to) { 
      this.context.strokeStyle = '#000' 
      this.context.beginPath()
      this.context.moveTo(from.x, from.y)
      this.context.lineTo(to.x, to.y)
      this.context.stroke()
    },
    hookDrawingInput: function() {
      $('surface')
       .hammer({
        prevent_default: true   
       })
      .on({
        dragstart: _.bind(this.onDragStart, this),
        drag: _.bind(this.onDrag, this)
        dragend: _.bind(this.onDragEnd, this)
       })
    },
    onDragStart: function() {
      this.game.sendDrawingStart(ev.position)
    },
    onDrag: function() {
      this.game.sendDrawingMove(ev.position) 
    },
    onDragEnd: function() {
      this.game.sendDrawingEnd(ev.position)
    }
  }
  exports.ArtPad = ArtPad
}).call(this, this)
