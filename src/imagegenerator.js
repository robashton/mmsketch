var Canvas = require('canvas'),
    ArtPad = require('./artpad'),
    fs = require('fs'),
    config = require('./config')

var ImageGenerator = function(game) {
  this.game = game
  this.lobby = game.lobby
  this.logger = game.gamelogger
  this.canvas = new Canvas(800, 600)
  this.context = this.canvas.getContext('2d')
  this.pad = new ArtPad(this.canvas, this.context)
  this.lobby.on('RoundStarted', this.onRoundStarted.bind(this))
  this.logger.on('RoundSaved', this.onRoundSaved.bind(this))
  this.onPlayerDrawEvent = this.onPlayerDrawEvent.bind(this)
}

ImageGenerator.prototype = {
  onRoundStarted: function() {
    this.currentArtist = this.lobby.currentArtist
    this.currentArtist.on('DrawingEvent', this.onPlayerDrawEvent)
  },
  onRoundSaved: function(id) {
    var self = this
    this.currentArtist.off('DrawingEvent', this.onPlayerDrawEvent) 
    this.saveImageData(id, function() {
      self.resetImageData()
    })
  },
  onPlayerDrawEvent: function(ev) {
    switch(ev.event) {
      case 'drawingstart':
        return this.pad.startDrawing(ev.data)
      case 'drawingmove':
        return this.pad.draw(ev.data)
      case 'drawingend':
        return this.pad.stopDrawing()
      case 'selectbrush':
        return this.pad.setBrush(ev.data)
      case 'selectcolour':
        return this.pad.setBrushColour(ev.data)
    }
  },
  saveImageData: function(id, cb) {
    var out = fs.createWriteStream(config.imageDir + id + '.png')
      , stream = this.canvas.createPNGStream();

    stream.on('data', function(chunk){
      out.write(chunk);
    });
    stream.on('end', function(){
      if(cb) cb()
    });
  },
  resetImageData: function() {
    this.pad.clear()
  }
}


module.exports = ImageGenerator
