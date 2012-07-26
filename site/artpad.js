
(function(exports) {

  var ArtPad = function(canvas, context) {
    this.lastPosition = null
    this.selectedBrush = null
    this.canvas = canvas
    this.context = context
    this.selectedColour = null
    this.history = []
    this.totalDistanceMoved = 0
    this.distanceLastMoved = 0
  }

  ArtPad.prototype = {
    clear: function() {
      this.context.fillStyle = '#FFF'
      this.context.globalAlpha = 1.0
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    },
    startDrawing: function(position) {
      this.lastPosition = position
      this.totalDistanceMoved = 0
      this.distanceLastMoved = 0
    },
    draw: function(position) {
      this.addToDistances(position)
      this.drawLine(this.lastPosition, position)
      this.lastPosition = position
    },
    stopDrawing: function() {
      this.lastPosition = null
      this.history = []
    },
    drawLine: function(from, to) { 
      this.context.strokeStyle = this.selectedColour 
      this.context.lineWidth = this.selectedBrush
      this.context.globalAlpha = 1
      this.context.lineJoin = 'bevel'
      this.context.beginPath()
      this.context.moveTo(this.history[0].x, this.history[0].y)
      for(var i = 1; i < this.history.length; i++) {
        this.context.lineTo(this.history[i].x, this.history[i].y)
      }
      this.context.stroke()
    },
    setBrushThickness: function(thickness) {
      this.selectedBrush = thickness
    },
    setBrushColour: function(colour) {
      this.selectedColour = colour
    },
    addToDistances: function(position) {
      var diffx = position.x - this.lastPosition.x
      var diffy = position.y - this.lastPosition.y
      this.distanceLastMoved = Math.sqrt( diffx * diffx + diffy * diffy)
      this.totalDistanceMoved += this.distanceLastMoved
      this.history.push(position)
      if(this.history.length > 5)
        this.history.shift()
    }
  }

  if(typeof module !== 'undefined' && module.exports) 
    module.exports = ArtPad
  else
    exports.ArtPad = ArtPad

}( this))
