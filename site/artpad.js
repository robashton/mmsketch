
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
      position.mag = this.totalDistanceMoved / this.numberOfSteps 
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
      tr: tr
    }
  }

  var Brushes = {
    circle: function(from, to, pad) {
      if(pad.lastQuad && pad.history.length < 3) return
      if(!pad.lastQuad && pad.history.length < 4) return

      var quads = []

      var quadOne,
          quadTwo,
          quadThree = null
      var index = 0
      if(pad.lastQuad)
        quadOne = pad.lastQuad
      else
        quadOne = calculateQuadFrom(pad.history[index++], pad.history[index], 0.5)
      quadTwo = calculateQuadFrom(pad.history[index++], pad.history[index], 0.5)
      quadThree = calculateQuadFrom(pad.history[index++], pad.history[index], 0.5)

      pad.context.strokeStyle = pad.selectedColour 
      pad.context.fillStyle = pad.selectedColour
      pad.context.lineWidth = 1 
      pad.context.globalAlpha = 1.0 
      pad.context.lineJoin = 'round'

      pad.context.beginPath()
      pad.context.moveTo(quadOne.tl.x, quadOne.tl.y)
      pad.context.quadraticCurveTo(quadTwo.bl.x, quadTwo.bl.y, quadTwo.tl.x, quadTwo.tl.y)
      pad.context.quadraticCurveTo(quadThree.bl.x, quadThree.bl.y, quadThree.tl.x, quadThree.tl.y)
      pad.context.lineTo(quadThree.tr.x, quadThree.tr.y)
      pad.context.quadraticCurveTo(quadThree.br.x, quadThree.br.y, quadTwo.tr.x, quadTwo.tr.y)
      pad.context.quadraticCurveTo(quadTwo.br.x, quadTwo.br.y, quadOne.tr.x, quadOne.tr.y)
      pad.context.lineTo(quadOne.tl.x, quadOne.tl.y)

      pad.context.closePath()
      pad.context.fill()
      pad.context.stroke()

      if(pad.status === 'starting') {
        pad.status = 'drawing'
      }

      pad.lastQuad = quadThree
      var lastHistory = pad.history
      pad.history = []
      pad.history.push(lastHistory.pop())
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
