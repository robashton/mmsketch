
(function(exports) {

  var ArtPad = function(Canvas) {
    this.lastPosition = null
    this.selectedBrush = null
    this.canvas = new Canvas('surface', 800, 600)
    this.context = this.canvas.context
    this.selectedColour = null
    this.history = []
    this.totalDistanceMoved = 0
    this.distanceLastMoved = 0
    this.numberOfSteps = 0
    this.averageDistanceMoved = 0
    this.status = null
    this.clear()
    this.offscreen = new Canvas('offscreen1', 100, 100)
    this.offscreencontext = this.offscreen.context
    this.paintBrushImage = Canvas.createImage('img/paintbrush.png')
    var pad = this
    this.paintBrushImage.onload = function() {
    pad.offscreencontext.clearRect(0, 0, 100, 100)
    pad.offscreencontext.drawImage(
      pad.paintBrushImage,
      0, 0, 100, 100)

    }
  }

  ArtPad.prototype = {
    clear: function() {
      this.context.fillStyle = '#FFF'
      this.context.globalAlpha = 1.0
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
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
        quads[0] = calculateQuadFrom(pad.history[index++], pad.history[index], 0.25)

      while(index < pad.history.length-1) {
        quads.push(calculateQuadFrom(pad.history[index++], pad.history[index], 0.25))
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
      if(pad.history.length < 2) return
      var quad = calculateQuadFrom(pad.history[0], pad.history[1], 3.0) 
      pad.history = []

      var rh, gh, bh = '',
          r, g, b = 0

      var colour = pad.selectedColour
      if(colour.length === 4) {
        rh = colour[1] + colour[1]
        gh = colour[2] + colour[2]
        bh = colour[3] + colour[3]
      } else {
        rh = colour.substr(1, 2)
        gh = colour.substr(3, 2)
        bh = colour.substr(5, 2)
      }

      r = parseInt(rh, 16)
      g = parseInt(gh, 16)
      b = parseInt(bh, 16)

      var source = pad.offscreencontext.getImageData(0, 0, 100, 100)
      for(var i = 0;  i < 100 ; i++) {
        for(var j = 0 ; j < 100 ; j++) {
          var index = (i + j * 100) * 4
          source.data[index] = r 
          source.data[index+1] = g 
          source.data[index+2] = b 
        }
      }

      pad.offscreencontext.putImageData(source, 0, 0) 
      pad.context.globalAlpha = 0.02
      pad.context.drawImage(pad.offscreen.canvas,
        quad.cx - 50, quad.cy - 50, 100, 100)
    },
    pencil: function(from, to, pad) {
      if(pad.history.length < 5) return


      pad.context.globalAlpha = 1.0 / (pad.averageDistanceMoved / 5)

      pad.context.lineWidth = 2 
      pad.context.strokeStyle = pad.selectedColour
      pad.context.beginPath()
      pad.context.moveTo(pad.history[0].x, pad.history[0].y)

      for(var i = 1; i < pad.history.length; i++)
        pad.context.lineTo(pad.history[i].x, pad.history[i].y)
      pad.context.stroke()

      var lastItem = pad.history[pad.history.length-1]
      pad.history = [ lastItem ]
    }
  }

  function blendRgb(one, two, out) {
    rgb2hls(one)
    rgb2hls(two)

    // If we're blending with white, then we want to 
    // interpolate from the same colour as we're drawing
    if(one[1] >= 0.9)
      one[0] = two[0]

    // If the destination is really light then we probably
    // don't want to
    //
    // Blend one part paint with 19 parts canvas
    out[0] = 0.05 * (one[0] * 19 + two[0])

    // Blend the lightness, one part paint, 19 parts canvas
    out[1] = 0.05 * (one[1] * 19 + two[1])

    // Just add the saturation
    out[2] = 0.5 * (one[2] + two[2])

    // If our paint is transparent, then don't draw anything
    if(two[3] === 0)
      out[3] = 0
    else
      out[3] = 255 

    out = hls2rgb(out)
    return out
  }

  function rgb2hls(rgb) {
    rgb[0] /= 255.0
    rgb[1] /= 255.0
    rgb[2] /= 255.0

    var maxc = Math.max(rgb[0], rgb[1], rgb[2]),
        minc = Math.min(rgb[0], rgb[1], rgb[2]),
        l = (minc + maxc) / 2.0,
        span = maxc - minc,
        h = 0,
        s = 0,
        rc,gc,bc = 0

    if(minc === maxc) {
      rgb[0] = 0
      rgb[1] = l
      rgb[2] = 0
      return;
    }

    if(l <= 0.5)
      s = span / (maxc + minc)
    else
      s = span / (2.0 - maxc - minc)

    rc = (maxc - rgb[0]) / span
    gc = (maxc - rgb[1]) / span
    bc = (maxc - rgb[2]) / span

    if(rgb[0] === maxc)
      h = bc - gc
    else if(rgb[1] === maxc)
      h = 2.0 + rc - bc
    else
      h = 4.0 + gc - rc

    h = (h / 6.0) % 1.0
    rgb[0] = h
    rgb[1] = l
    rgb[2] = s
  }

  function hls2rgb(hls) {
    var third = 1.0 / 3.0,
        m2 = 0,
        m1 = 0

    if(hls[2] === 0) 
      return [hls[1] * 255, hls[1] * 255, hls[1] * 255, hls[3]]

    if(hls[1] <= 0.5)
      m2 = hls[1] * (1.0 + hls[2])
    else
      m2 = hls[1] + hls[2] - (hls[1] * hls[2])

    m1 = 2.0 * hls[1] - m2
    return [_v(m1, m2, hls[0] + third),
            _v(m1, m2, hls[0])        ,
            _v(m1, m2, hls[0] - third),
            hls[3]]
  }

  function _v(m1, m2, hue) {
    var sixth = 1.0 / 6.0,
        twothirds = 2.0 / 3.0,
        result = 0

    hue = hue % 1.0

    if(hue < 0)
      hue += 1.0

    if(hue < sixth)
      result = m1 + (m2-m1) * hue * 6.0
    else if(hue < 0.5)
      result = m2
    else if(hue < twothirds)
      result = m1 + (m2-m1) * (twothirds-hue) * 6.0
    else
      result = m1

    result *= 255.0
    return result
  }

  ArtPad.hls2rgb = hls2rgb
  ArtPad.rgb2hls = rgb2hls
  ArtPad.blendRgb = blendRgb

  if(typeof module !== 'undefined' && module.exports) 
    module.exports = ArtPad
  else
    exports.ArtPad = ArtPad

}( this))
