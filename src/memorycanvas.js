var Canvas = require('canvas')

var MemoryCanvas = function(id, width, height) {
  this.canvas = new Canvas(width, height)
  this.width = width
  this.height = height
  this.context = this.canvas.getContext('2d')
}

MemoryCanvas.prototype = {}
module.exports = MemoryCanvas
