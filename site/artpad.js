
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
      this.context.save()
      Brushes[this.selectedBrush](from, to, this)
      this.context.restore()
    },
    setBrush: function(brush) {
      this.selectedBrush = brush
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
    }
  }

  var Brushes = {
    circle: function(from, to, pad) {
      if(pad.history.length < 10) return
      pad.context.strokeStyle = pad.selectedColour 
      pad.context.lineWidth = 10 
      pad.context.globalAlpha = 1
      pad.context.lineJoin = 'bevel'
      pad.context.lineCap = 'round'
      pad.context.beginPath()
      pad.context.moveTo(pad.history[0].x, pad.history[0].y)
      for(var i = 1; i < pad.history.length; i++) {
        pad.context.lineTo(pad.history[i].x, pad.history[i].y)
      }
      pad.history = []
      pad.history.push(to)
      pad.context.stroke()
    },
    paint: function(from, to, pad) {
      pad.context.strokeStyle = pad.selectedColour 
      pad.context.lineWidth = 50 
      pad.context.globalAlpha = 0.1 
      pad.context.lineJoin = 'bevel'
      pad.context.lineCap = 'round'
      pad.context.beginPath()
      pad.context.moveTo(from.x, from.y)
      pad.context.lineTo(to.x, to.y)
      pad.context.stroke()
    },
    pencil: function(from, to, pad) {
      Brushes.circle(from, to, pad)
    }
  }

  if(typeof module !== 'undefined' && module.exports) 
    module.exports = ArtPad
  else
    exports.ArtPad = ArtPad

}( this))
