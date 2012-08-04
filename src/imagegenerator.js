var MemoryCanvas = require('./memorycanvas'),
    ArtPad = require('./artpad'),
    fs = require('fs'),
    config = require('./config')

var ImageGenerator = function(server) {
  this.server = server
  this.game = server.game
  this.logger = server.gamelogger
  this.pad = new ArtPad(MemoryCanvas)
  this.game.on('RoundStarted', this.onRoundStarted.bind(this))
  this.logger.on('RoundSaved', this.onRoundSaved.bind(this))
  this.onPlayerDrawEvent = this.onPlayerDrawEvent.bind(this)
}

ImageGenerator.prototype = {
  onRoundStarted: function() {
    this.currentArtist = this.game.currentArtist
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
      , stream = this.pad.canvas.canvas.createPNGStream();

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
