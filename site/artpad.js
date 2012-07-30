
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
    this.numberOfSteps = 0
    this.averageDistanceMoved = 0
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
      this.lastQuad = null
      this.numberOfSteps = 0
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
      this.numberOfSteps++
      var diffx = position.x - this.lastPosition.x
      var diffy = position.y - this.lastPosition.y
      this.distanceLastMoved = Math.sqrt(diffx * diffx + diffy * diffy)
      this.totalDistanceMoved += this.distanceLastMoved
      this.averageDistanceMoved = (this.distanceLastMoved + this.averageDistanceMoved * 4.0) / 5.0
      position.mag = this.averageDistanceMoved
      this.history.push(position)
    }
  }

  function calculateQuadFrom(from, to, width) {
    var dx = to.x - from.x
      , dy = to.y - from.y
      , dmag = Math.sqrt((dx * dx) + (dy * dy))
    
     dx /= dmag
     dy /= dmag

     var nl = { x: -dy, y: dx }
     ,  nr = { x: dy, y: -dx }
     ,  bl = { x: from.x + (width * from.mag * nl.x),
               y: from.y + (width * from.mag * nl.y) }
     ,  br = { x: from.x + (width * from.mag * nr.x),
               y: from.y + (width * from.mag * nr.y) }
     ,  tl = { x: to.x + (  width * to.mag *   nl.x),
               y: to.y + (  width * to.mag *   nl.y) }
     ,  tr = { x: to.x + (  width * to.mag *   nr.x),
               y: to.y + (  width * to.mag *   nr.y) }
    return {
      bl: bl,
      br: br,
      tl: tl,
      tr: tr,
      cx: (bl.x + tr.x) / 2,
      cy: (bl.y + tr.y) / 2,
      width: Math.abs(bl.x - tr.x)
    }
  }

  var Brushes = {
    circle: function(from, to, pad) {
      if(pad.history.length < 5) return

      var quads = []
      var index = 0
      if(pad.lastQuad)
        quads[0] = pad.lastQuad
      else
        quads[0] = calculateQuadFrom(pad.history[index++], pad.history[index], 0.5)

      while(index < pad.history.length-1) {
        quads.push(calculateQuadFrom(pad.history[index++], pad.history[index], 0.5))
      }

      pad.context.strokeStyle = pad.selectedColour 
      pad.context.fillStyle = pad.selectedColour
      pad.context.lineWidth = 1 
      pad.context.globalAlpha = 1.0 
      pad.context.lineJoin = 'miter'

      pad.context.beginPath()
      pad.context.moveTo(quads[0].tl.x, quads[0].tl.y)
      
      for(var i = 1 ; i < quads.length; i++)
        pad.context.quadraticCurveTo(quads[i].bl.x, quads[i].bl.y, quads[i].tl.x, quads[i].tl.y)
      
      pad.context.lineTo(quads[quads.length-1].tr.x, quads[quads.length-1].tr.y)

      for(i = quads.length-1 ; i > 0 ; i--)
        pad.context.quadraticCurveTo(quads[i].br.x, quads[i].br.y, quads[i-1].tr.x, quads[i-1].tr.y)

      pad.context.lineTo(quads[0].tl.x, quads[0].tl.y)

      pad.context.closePath()
      pad.context.fill()
      pad.context.stroke()

      if(pad.status === 'starting') {
        pad.status = 'drawing'
      }

      pad.lastQuad = quads[quads.length-1]
      var lastHistory = pad.history
      pad.history = []
      pad.history.push(lastHistory.pop())
    },
    paint: function(from, to, pad) {
      var quad = calculateQuadFrom(from, to, 3.0) 
      pad.context.fillStyle = pad.selectedColour
      pad.context.globalAlpha = 0.03
      pad.context.beginPath()
      pad.context.arc(quad.cx, quad.cy, quad.width / 2.0, 0, Math.PI * 2, true)
      pad.context.closePath()
      pad.context.fill()
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
