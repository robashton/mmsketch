
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
    this.offscreen1 = new Canvas('offscreen1', 100, 100)
    this.offscreencontext1 = this.offscreen1.context
    this.offscreen2 = new Canvas('offscreen2', 100, 100)
    this.offscreencontext2 = this.offscreen2.context
    this.offscreen3 = new Canvas('offscreen3', 100, 100)
    this.offscreencontext3 = this.offscreen3.context
    this.clear()
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

      // Okay, so first we draw to another canvas
      // rationale: We can actually make this canvas smaller
      // before getting the image data
      pad.offscreencontext3.clearRect(0, 0, 100, 100)
      pad.offscreencontext2.clearRect(0, 0, 100, 100)
      pad.offscreencontext1.clearRect(0, 0, 100, 100)

      pad.offscreencontext1.drawImage(
        pad.canvas.canvas,
        quad.cx - 50, quad.cy - 50, 100, 100, 
        0, 0, 100, 100)

      // Then we draw our desired picture to our other canvas too
      pad.offscreencontext2.fillStyle = pad.selectedColour
      pad.offscreencontext2.beginPath()
      pad.offscreencontext2.arc(50, 50, 50, 0, Math.PI * 2, true)
      pad.offscreencontext2.closePath()
      pad.offscreencontext2.fill()

      // Then we get the pixel data from that offscreen canvas
      var one = pad.offscreencontext1.getImageData(0, 0, 100, 100);
      var two = pad.offscreencontext2.getImageData(0, 0, 100, 100);
      
      var pixelOne = [0,0,0,0];
      var pixelTwo = [0,0,0,0];
      var pixelOutput = [0,0,0,0];

      // Then for every pixel
      for(var i = 0 ; i < 100 ; i++) {
        for(var j = 0; j < 100 ; j++) {
          var index = (i + j * 100) * 4

          // We fill the array for that pixel
          for(var p = 0; p < 4; p++) {
            pixelOne[p] = one.data[index + p]
            pixelTwo[p] = two.data[index + p]
          }

          // We blend the fuckers
          pixelOutput = blendRgb(pixelOne, pixelTwo, pixelOutput)

          // And we write back to canvas one array
          for(p = 0; p < 4; p++)
            one.data[index + p] = pixelOutput[p]
        }
      }
      pad.offscreencontext3.putImageData(one, 0, 0)

      // Then draw that on top of the original canvas
      pad.context.drawImage(
        pad.offscreen3.canvas,
        0, 0, 100, 100,
        quad.cx - 50, quad.cy - 50, 100, 100)
    },
    pencil: function(from, to, pad) {
      Brushes.circle(from, to, pad)
    }
  }

  function blendRgb(one, two, out) {
    one = rgb2hls(one)
    two = rgb2hls(two)

    var pi = 3.1415
    out[0] = 0.0

    if(one[3] === 0 && two[3] === 0) {
      out[0] = 0
      out[1] = 0
      out[2] = 0
      out[3] = 0 
    }
    else if(one[3] === 0 && two[3] !== 0) {
      out[0] = two[0]
      out[1] = two[1]
      out[2] = two[2]
      out[3] = two[3] 
    }
    else if(two[3] === 0 && one[3] !== 0) {
      out[0] = one[0]
      out[1] = one[1]
      out[2] = one[2]
      out[3] = one[3] 
    }
    else {
      out[1] = 0.5 * (one[1] + two[1])
      out[2] = (one[2] * two[2])
      out[3] = Math.min(one[3] + two[3], 255)
      var x = Math.cos(2.0 * pi * one[0]) + Math.cos(2.0 * pi * two[0])
      var y = Math.sin(2.0 * pi * one[0]) + Math.sin(2.0 * pi * two[0])

      if(x !== 0 || y !== 0) {
        out[0] = Math.atan2(y, x) / (2.0 * pi)
      } else {
        out[2] = 0.0
      }
    }

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

    if(minc === maxc) return [ 0, l, 0, rgb[3]]

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
    return [h, l, s, rgb[3]]
  }

  function hls2rgb(hls) {
    var third = 1.0 / 3.0,
        m2 = 0,
        m1 = 0

    if(hls[2] === 0) 
      return [hls[1], hls[1], hls[1], hls[3]]

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
      hue = hue + 1.0
    
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
