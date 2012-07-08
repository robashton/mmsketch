
(function(exports) {

  var ArtPad = function(game) {
    this.game = game
    this.lastPosition = null
    this.canvas = document.getElementById('surface')
    this.context = this.canvas.getContext('2d')
    this.colourContainer = $('#paintbrush-colours')
    this.brushContainer = $('#paintbrush-brushes')
    this.selectedBrush = null
    this.selectedColour = null
    this.colours = {}
    this.brushes = {}
    this.game.autoHook(this)
    this.createPalette()
    this.selectColour('#000')
    this.selectBrush(2)
    this.hookDrawingInput()
  }

  ArtPad.prototype = {
    createPalette: function() {
      this.addColour('#FFF')
      this.addColour('#000')
      this.addColour('#F00')
      this.addColour('#0F0')
      this.addColour('#00F')
      this.addColour('#FF0')
      this.addColour('#F0F')
      this.addColour('#0FF')
      this.addBrush(1)
      this.addBrush(2)
      this.addBrush(3)
      this.addBrush(4)
      this.addBrush(5)
      this.addBrush(6)
      this.addBrush(7)
      this.addBrush(8)
    },
    addColour: function(hex) {
      var element = $('<span/>')
          .attr('data-colour', hex)
          .css('background-color', hex)
          .addClass('paintbrush-colour')
      this.colourContainer.append(element)
      this.colours[hex] = element
      return element;
    },
    selectColour: function(hex) {
      var colour = this.colours[hex]
      if(!colour) return
      if(this.selectedColour)
        this.selectedColour.removeClass('selected')
      this.selectedColour = colour
      this.selectedColour.addClass('selected')
      $('.paintbrush-brush').css('background-color', hex)
    },
    addBrush: function(brush) {
      var pixels = brush * 5
      var halfPixels = pixels / 2
      var containerHeight = this.brushContainer.height()
      var element = $('<span/>')
            .attr('data-brush', brush)
            .css('height', pixels + 'px')
            .css('width', pixels + 'px')
            .css('border-radius', halfPixels + 'px') 
            .css('-webkit-border-radius',  halfPixels + 'px')
            .css('-moz-border-radius', halfPixels + 'px') 
            .css('margin-top', (containerHeight - pixels)/2  + 'px')
            .addClass('paintbrush-brush')
      this.brushContainer.append(element)
      this.brushes[brush] = element
      return element
    },
    selectBrush: function(brush) {
      var element = this.brushes[brush]
      if(!element) return
      if(this.selectedBrush)
        this.selectedBrush.removeClass('selected')
      this.selectedBrush = element
      this.selectedBrush.addClass('selected')
    },
    onRoundStarted: function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    },
    onDrawingStart: function(position) {
      this.lastPosition = position
    },
    onDrawingMove: function(position) {
      this.drawLine(this.lastPosition, position)
      this.lastPosition = position
    },
    onDrawingEnd: function(data) {
      this.lastPosition = null
    },
    drawLine: function(from, to) { 
      this.context.strokeStyle = '#000' 
      this.context.beginPath()
      this.context.moveTo(from.x, from.y)
      this.context.lineTo(to.x, to.y)
      this.context.stroke()
    },
    hookDrawingInput: function() {
      var self = this
      $('#surface')
       .hammer({
        prevent_default: true   
       })
      .on({
        dragstart: _.bind(this.onDragStart, this),
        drag: _.bind(this.onDrag, this),
        dragend: _.bind(this.onDragEnd, this)
       })
      $('.paintbrush-brush')
        .hammer({ prevent_defaults: true })
        .on({tap: function() {
          var brush = $(this).data('brush')
          self.game.sendSelectBrush(brush)
        }})
      $('.paintbrush-colour')
        .hammer({ prevent_defaults: true})
        .on({tap: function() {
          var colour = $(this).data('colour')
          self.game.sendSelectColour(colour)
        }})
    },
    onBrushSelected: function(brush) {
      this.selectBrush(brush)
    },
    onColourSelected: function(colour) {
      this.selectColour(colour)
    },
    onDragStart: function(ev) {
      this.game.sendDrawingStart(ev.position)
    },
    onDrag: function(ev) {
      this.game.sendDrawingMove(ev.position) 
    },
    onDragEnd: function(ev) {
      this.game.sendDrawingEnd(ev.position)
    }
  }
  exports.ArtPad = ArtPad
}).call(this, this)
