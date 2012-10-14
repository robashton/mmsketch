define(function(require) {
  var Tools = require('./tools')
  var ArtpadInput = require('./artpadinput')
  var ArtPad = require('artpad')

  var tools = new Tools()
  var input = new ArtpadInput()
  var artpad = typeof TEST !== 'undefined' ? null : new ArtPad()

  tools.on('BrushSelected', function(brush) {
    if(artpad) { artpad.setBrush(brush) }
  })

  tools.on('ColourSelected', function(colour) {
    if(artpad) { artpad.setBrushColour(colour) }
  })

  input.on('DrawingStarted', function(position) {
    if(artpad) { artpad.startDrawing(position) }
  })

  input.on('DrawingMoved', function(position) {
    if(artpad) { artpad.draw(position) }
  })

  input.on('DrawingEnded', function() {
    if(artpad) { artpad.stopDrawing() }
  })
})
