(function(exports) {
  var Canvas = function(id, width, height) {
    this.canvas = document.getElementById(id) || document.createElement('canvas')
    this.canvas.width = width || this.canvas.width
    this.canvas.height = height || this.canvas.height
    this.context = this.canvas.getContext('2d')
    this.width = width
    this.height = height
  }
  Canvas.prototype =  {
  }
  Canvas.createImage = function(path) {
    var img = new Image()
    img.src = '/' + path
    return img
  }
  exports.Canvas = Canvas
}(window));
