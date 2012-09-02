(function(exports) {

  var ReplayGame = function(events) {
    Eventable.call(this)
    this.events = events
    this.intervalTime = 0
    this.current = 0
    this.playNextEvent = _.bind(this.playNextEvent, this)
  }

  ReplayGame.prototype = {
    start: function() {
      this.intervalTime = 10000 / this.events.length
      this.current = 0
      this.playNextEvent()
    },
    playNextEvent: function() {
      if(this.current >= this.events.length) return
      var ev = this.events[this.current++]
      var mapped = this.map[ev.event]
      try {
      this.raise(mapped, ev.data)
      } catch(ex) {
        console.log(ex)
      }
      setTimeout(this.playNextEvent, this.intervalTime)
    },
    map: {
      'drawingstart': 'DrawingStart',
      'drawingmove': 'DrawingMove',
      'drawingend' : 'DrawingEnd',
      'selectbrush' : 'BrushSelected',
      'selectcolour' : 'ColourSelected'

    }
  }

  _.extend(ReplayGame.prototype, Eventable.prototype)


  exports.ReplayGame = ReplayGame
}(this));
