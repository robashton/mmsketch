
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
    this.status = null
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
      this.status = 'starting'
    },
    draw: function(position) {
      this.addToDistances(position)
      this.drawLine(this.lastPosition, position)
      this.lastPosition = position
    },
    stopDrawing: function() {
      this.status = 'ending'
      this.drawLine(this.lastPosition, this.lastPosition)
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
      var brushSize = pad.status === 'starting' || pad.status === 'ending' ? 3 : pad.totalDistanceMoved * 0.2
      if(pad.history.length < 5 && pad.status !== 'ending') return
      
      pad.context.strokeStyle = pad.selectedColour 
      pad.context.lineWidth = brushSize 
      pad.context.globalAlpha = 1
      pad.context.lineJoin = 'round'
      pad.context.beginPath()
      pad.context.moveTo(pad.history[0].x, pad.history[0].y)
      for(var i = 1; i < pad.history.length; i++) {
        pad.context.lineTo(pad.history[i].x, pad.history[i].y)
      }
      pad.context.stroke()

      if(pad.status !== 'starting' && pad.history.length > 0) {
        // Fill in the size changes
        // Should be able to work out the direction
        // And the distance either size
        // and draw then fill a path that blends the two sizes together
        // LOL
        pad.context.strokeStyle = '#F00'
        pad.context.lineWidth = 2 

        var patchFrom = pad.lastHistory[0]
          , patchTo = pad.history[0]
          , dx = patchTo.x - patchFrom.x
          , dy = patchTo.y - patchFrom.y
          , dmag = Math.sqrt((dx * dx) + (dy * dy))
        
         dx /= dmag
         dy /= dmag

         var nl = { x: -dy, y: dx }
         ,  nr = { x: dy, y: -dx }
         ,  bl = { x: patchFrom.x + (0.5 * pad.lastBrushSize * nl.x),
                   y: patchFrom.y + (0.5 * pad.lastBrushSize * nl.y) }
         ,  br = { x: patchFrom.x + (0.5 * pad.lastBrushSize * nr.x),
                   y: patchFrom.y + (0.5 * pad.lastBrushSize * nr.y) }
         ,  tl = { x: patchTo.x + (  0.5 *      brushSize *    nl.x),
                   y: patchTo.y + (  0.5 *      brushSize *    nl.y) }
         ,  tr = { x: patchTo.x + (  0.5 *      brushSize *    nr.x),
                   y: patchTo.y + (  0.5 *      brushSize *    nr.y) }

         pad.context.beginPath()
         pad.context.moveTo(bl.x, bl.y)
         pad.context.lineTo(tl.x, tl.y)
         pad.context.lineTo(tr.x, tr.y)
         pad.context.lineTo(br.x, br.y)
         pad.context.stroke()

      }

      pad.lastHistory = pad.history
      pad.lastBrushSize = brushSize
      pad.history = []
      pad.totalDistanceMoved = 0
      pad.lastBrushSize = brushSize
      pad.history.push(to)
      if(pad.status === 'starting') {
        pad.status = 'drawing'
      }
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
