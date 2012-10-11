  (function(exports) {

  var ArtPadInput  = function(game) {
    this.game = game
    this.canvas = document.getElementById('surface')
    this.context = this.canvas.getContext('2d')
    this.pad = new ArtPad(Canvas)
    this.colourContainer = $('#paintbrush-colours')
    this.brushContainer = $('#paintbrush-brushes')
    this.colours = {}
    this.brushes = {}
    this.game.autoHook(this)
    this.createPalette()
    this.selectColour('#000')
    this.selectBrush('circle')
    this.hookDrawingInput()
  }

  ArtPadInput.prototype = {
    hookDrawingInput: function() {
      var self = this
      $('#surface')
       .hammer({
        prevent_default: true,
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
    onDragStart: function(ev) {
      var position = this.screenToCanvas(ev.position)
      this.game.sendDrawingStart(position)
    },
    onDrag: function(ev) {
      var position = this.screenToCanvas(ev.position)
      this.game.sendDrawingMove(position) 
    },
    onDragEnd: function(ev) {
      this.game.sendDrawingEnd()
    },
    onRoundStarted: function() {
      this.pad.clear()
    },
    onDrawingStart: function(position) {
      this.pad.startDrawing(position)
    },
    onDrawingMove: function(position) {
      this.pad.draw(position)
    },
    onDrawingEnd: function(data) {
      this.pad.stopDrawing()
    },
    onBrushSelected: function(brush) {
      this.selectBrush(brush)
    },
    onColourSelected: function(colour) {
      this.selectColour(colour)
    },
    createPalette: function() {
      this.addColour('#FFF')
      this.addColour('#000')
      this.addColour('#F00')
      this.addColour('#0F0')
      this.addColour('#00F')
      this.addColour('#FF0')
      this.addColour('#F0F')
      this.addColour('#0FF')
      this.addColour('#FFA500')
      this.addBrush('pen')
      this.addBrush('pencil')
      this.addBrush('brush')
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
      this.pad.setBrushColour(hex)
    },
    addBrush: function(brush) {
      var element = $('<span/>')
            .addClass('paintbrush-brush')
            .addClass(brush)
            .data('brush', brush)
          .append( 
            $('<img/>')
            .attr('src', '/img/' + brush + '.png'))
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
      this.pad.setBrush(brush)
    },
    screenToCanvas: function(pos) {
      var canvasWidth = this.canvas.width
      var canvasHeight = this.canvas.height
      var screenWidth = $(this.canvas).width()
      var screenHeight = $(this.canvas).height()

      var xmod = canvasWidth / screenWidth
      var ymod = canvasHeight / screenHeight
      
      return {
        x: pos.x * xmod,
        y: pos.y * ymod
      }
    }
  }

  exports.ArtPadInput = ArtPadInput
}(this));
