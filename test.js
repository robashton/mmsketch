var pad = require('./src/artpad.js')

var canvas = [ 255, 255, 255, 255 ]
var paint = [255, 0, 0, 255]

var result = [0,0,0,0]

for(var i = 0; i < 10; i++) {
  console.log(canvas)
  result = pad.blendRgb(canvas, paint, result)
  canvas[0] = parseInt(result[0])
  canvas[1] = parseInt(result[1])
  canvas[2] = parseInt(result[2])
  canvas[3] = parseInt(result[3])
  paint[0] = 255
  paint[1] = 0
  paint[2] = 0
  paint[3] = 255
}
