define(function(require) {
  var Eventable = require('eventable')

  var Tools  = function() {
    Eventable.call(this)
    this.colourContainer = $('#paintbrush-colours')
    this.brushContainer = $('#paintbrush-brushes')
    this.colours = {}
    this.brushes = {}
    this.createPalette()
    this.selectColour('#000')
    this.selectBrush('circle')
    this.hookToolEvents()
    this.on('BrushSelected', this.onBrushSelected, this)
    this.on('ColourSelected', this.onColourSelected, this)
  }

  Tools.prototype = {
    hookToolEvents: function() {
      var self = this
      $('.paintbrush-brush')
        .hammer({ prevent_defaults: true })
        .on({tap: function() {
          var brush = $(this).data('brush')
          self.selectBrush(brush)
        }})
      $('.paintbrush-colour')
        .hammer({ prevent_defaults: true})
        .on({tap: function() {
          var colour = $(this).data('colour')
          self.selectColour(colour)
        }})
    },
    selectColour: function(colour) {
      this.raise('ColourSelected', colour)
    },
    selectBrush: function(brush) {
      this.raise('BrushSelected', brush)
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
    onColourSelected: function(hex) {
      var colour = this.colours[hex]
      if(!colour) return
      if(this.selectedColour)
        this.selectedColour.removeClass('selected')
      this.selectedColour = colour
      this.selectedColour.addClass('selected')
    },
    onBrushSelected: function(brush) {
      var element = this.brushes[brush]
      if(!element) return
      if(this.selectedBrush)
        this.selectedBrush.removeClass('selected')
      this.selectedBrush = element
      this.selectedBrush.addClass('selected')
      this.pad.setBrush(brush)
    },
  }
  _.extend(Tools.prototype, Eventable.prototype)
  return Tools
})
