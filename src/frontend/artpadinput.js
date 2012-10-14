define(function(require) {
  var Eventable = require('eventable')

  var ArtPadInput  = function() {
    Eventable.call(this)
    this.canvas = document.getElementById('surface')
    this.hookDrawingInput()
  }

  ArtPadInput.prototype = {
    hookDrawingInput: function() {
      $(this.canvas)
       .hammer({
        prevent_default: true,
       })
      .on({
        dragstart: _.bind(this.onDragStart, this),
        drag: _.bind(this.onDrag, this),
        dragend: _.bind(this.onDragEnd, this)
       })
    },
    onDragStart: function(ev) {
      var position = this.screenToCanvas(ev.position)
      this.raise('DrawingStarted', position)
    },
    onDrag: function(ev) {
      var position = this.screenToCanvas(ev.position)
      this.raise('DrawingMoved', position)
    },
    onDragEnd: function(ev) {
      this.raise('DrawingEnded')
    },
    screenToCanvas: function(pos) {
      var canvasWidth = this.canvas.width
      var canvasHeight = this.canvas.height
      var screenWidth = $(this.canvas).width()
      var screenHeight = $(this.canvas).height()

      var xmod = canvasWidth / screenWidth
      var ymod = canvasHeight / screenHeight
      
      return {
        x: pos.x * xmod,
        y: pos.y * ymod
      }
    }
  }
  _.extend(ArtPadInput.prototype, Eventable.prototype)
  return ArtPadInput
})
