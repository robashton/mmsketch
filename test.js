var pad = require('./src/artpad.js')

var magentargb = [255, 0, 255, 255]
var magentahls = pad.rgb2hls(magentargb)

console.log(magentahls)

magentargb = pad.hls2rgb(magentahls)

console.log(magentargb)
