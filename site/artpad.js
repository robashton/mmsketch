
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
    this.offscreen1 = document.createElement('canvas')
    this.offscreen1.width = 100
    this.offscreen1.height = 100
    this.offscreencontext1 = this.offscreen.getContext('2d')
    this.offscreen2 = document.createElement('canvas')
    this.offscreen2.width = 100
    this.offscreen2.height = 100
    this.offscreencontext2 = this.offscreen.getContext('2d')
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
      var quad = calculateQuadFrom(from, to, 3.0) 
      pad.context.fillStyle = pad.selectedColour
      pad.context.globalAlpha = 0.01

      // Okay, so first we draw to another canvas
      // rationale: We can actually make this canvas smaller
      // before getting the image data
      pad.offscreencontext1.globalAlpha = 1.0
      pad.offscreencontext1.clearRect(0, 0, 100, 100)
      pad.offscreencontext1.drawImage(
        pad.canvas,
        quad.cx - 50, quad.cy - 50, 100, 100,
        0, 0, 100, 100)


      // Then we draw our desired picture to our other canvas too
      pad.offscreencontext2.beginPath()
      pad.offscreencontext2.arc(50, 50, 50, 0, Math.PI * 2, true)
      pad.offscreencontext2.closePath()
      pad.offscreencontext2.fill()

      // Then we get the pixel data from that offscreen canvas
      var one = pad.offscreencontext.createImageData(100, 100);
      var two = pad.offscreencontext.createImageData(100, 100);
      
      var pixelOne = [0,0,0,0];
      var pixelTwo = [0,0,0,0];
      var pixelOutput = [0,0,0,0];

      // Then for every pixel
      for(var i = 0 ; i < 100 ; i++) {
        for(var j = 0; j < 100 ; j++) {
          var index = (i + j * 100) * 4

          // We fill the array for that pixel
          for(var p = 0; p < 4; p++) {
            pixelOne[p] = one[index + p]
            pixelTwo[p] = two[index + p]
          }
          // We blend the fuckers
          blendRgb(pixelOne, pixelTwo, pixelOutput)

          // And we write back to canvas one array
          for(p = 0; p < 4; p++)
            one[index + p] = pixelOutput[p]
        }
      }

      // Then we copy back into canvas one
      pad.offscreencontext1.putImageData(one, 0, 0);

      // Then draw that on top of the original canvas
      pad.context.drawImage(
        pad.offscreencontext1,
        0, 0, 100, 100,
        quad.cx - 50, quad.cy - 50, 100, 100)
    },
    pencil: function(from, to, pad) {
      Brushes.circle(from, to, pad)
    }
  }

  function blendRgb(one, two, out) {
    rgb2hsl(one)
    rgb2hsl(two)

    for(var i = 0 ; i < 3 ; i++)
      out[i] = (one[i] + two[i]) * 0.5

    hsl2rgb(out)
  }

  function rgb2hsl(rgb) {
    var r = rgb[0]/255,
        g = rgb[1]/255,
        b = rgb[2]/255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        delta = max - min,
        h, s, l;

    if (max === min)
      h = 0;
    else if (r === max) 
      h = (g - b) / delta; 
    else if (g === max)
      h = 2 + (b - r) / delta; 
    else if (b === max)
      h = 4 + (r - g)/ delta;

    h = Math.min(h * 60, 360);

    if (h < 0)
      h += 360;

    l = (min + max) / 2;

    if (max === min)
      s = 0;
    else if (l <= 0.5)
      s = delta / (max + min);
    else
      s = delta / (2 - max - min);

    rgb[0] = h;
    rgb[1] = s * 100;
    rgb[2] = l * 100;
  }

  function hsl2rgb(hsl) {
    var h = hsl[0] / 360,
        s = hsl[1] / 100,
        l = hsl[2] / 100,
        t1, t2, t3, rgb, val;

    if (s === 0) {
      val = l * 255;
      h[0] = val;
      h[1] = val;
      h[2] = val;
      return;
    }

    if (l < 0.5)
      t2 = l * (1 + s);
    else
      t2 = l + s - l * s;
    t1 = 2 * l - t2;

    rgb = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
      t3 = h + 1 / 3 * - (i - 1);
      t3 < 0 && t3++;
      t3 > 1 && t3--;

      if (6 * t3 < 1)
        val = t1 + (t2 - t1) * 6 * t3;
      else if (2 * t3 < 1)
        val = t2;
      else if (3 * t3 < 2)
        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
      else
        val = t1;

      hsl[i] = val * 255;
    }
  }

  if(typeof module !== 'undefined' && module.exports) 
    module.exports = ArtPad
  else
    exports.ArtPad = ArtPad

}( this))
