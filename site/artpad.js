
(function(exports) {

  var ArtPad = function(canvas, context) {
    this.lastPosition = null
    this.selectedBrush = null
    this.canvas = canvas
    this.context = context
    this.selectedColour = null
  }

  ArtPad.prototype = {
    clear: function() {
      this.context.fillStyle = '#FFF'
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    },
    startDrawing: function(position) {
      this.lastPosition = position
      this.drawLine(position, position)
    },
    draw: function(position) {
      this.drawLine(this.lastPosition, position)
      this.lastPosition = position
    },
    stopDrawing: function() {
      this.lastPosition = null
    },
    drawLine: function(from, to) { 
      this.context.strokeStyle = this.selectedColour 
      this.context.lineWidth = this.selectedBrush 
      this.context.lineCap = 'round'
      this.context.lineJoin = 'bevel'
      this.context.beginPath()
      this.context.moveTo(from.x, from.y)
      this.context.lineTo(to.x, to.y)
      this.context.stroke()
    },
    setBrushThickness: function(thickness) {
      this.selectedBrush = thickness
    },
    setBrushColour: function(colour) {
      this.selectedColour = colour
    }
  }

  if(typeof module !== 'undefined' && module.exports) 
    module.exports = ArtPad
  else
    exports.ArtPad = ArtPad

}( this))
