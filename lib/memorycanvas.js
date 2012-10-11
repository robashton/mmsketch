define(function(require) {
  var Canvas = require('canvas')
    , fs = require('fs')

  var MemoryCanvas = function(id, width, height) {
    this.canvas = new Canvas(width, height)
    this.width = width
    this.height = height
    this.context = this.canvas.getContext('2d')
  }

  MemoryCanvas.prototype = {

  }

  MemoryCanvas.createImage = function(path) {
    var img = new Canvas.Image()
    fs.readFile('site/' + path, function(err, data) {
      img.src = data
    })
    return img
  }
  return Canvas
})
