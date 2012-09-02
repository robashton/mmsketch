(function(exports) {
  
    _ = (typeof _ === 'undefined') ?  require('underscore') : _

  var EventContainer = function(defaultContext) {
    this.handlers = [];
    this.defaultContext = defaultContext;
  }; 
  
  EventContainer.prototype = {
    raise: function(source, data) {
     var handlerLength = this.handlers.length;
     for(var i = 0; i < handlerLength; i++) {
        var handler = this.handlers[i];
        handler.method.call(handler.context || this.defaultContext, data, source);   
     }
    },
    add: function(method, context) {
      this.handlers.push({
        method: method,
        context: context      
      });
    },
    remove: function(method, context) {
      this.handlers = _(this.handlers).filter(function(item) {
        return item.method !== method || item.context !== context;
      });
    }
  };
  var Eventable = function() {
    this.eventListeners = {};
    this.allContainer = new EventContainer(this);
    this.eventDepth = 0;
  };
  
  Eventable.prototype = {
    autoHook: function(container) {
      for(var key in container) { 
        if(key.indexOf('on') === 0) {
          this.on(key.substr(2), container[key], container);
        }   
      }
    },
    autoUnhook: function(container) {
      for(var key in container) { 
        if(key.indexOf('on') === 0) {
          this.off(key.substr(2), container[key], container);
        }   
      }
    },
    once: function(eventName, callback, context) {
      var self = this;
      var wrappedCallback = function(data, sender) {
        callback.call(this, data, sender);
        self.off(eventName, wrappedCallback, context);
      };
      this.on(eventName, wrappedCallback, context);
    },
    
    on: function(eventName, callback, context) {
      this.eventContainerFor(eventName).add(callback, context);
    },
    
    off: function(eventName, callback, context) {
      this.eventContainerFor(eventName).remove(callback, context);
    },

    onAny: function(callback, context) {
      this.allContainer.add(callback, context);
    },

    raise: function(eventName, data, sender) {
      this.audit(eventName, data);
      var container = this.eventListeners[eventName];

      if(container)
        container.raise(sender || this, data);
      
      this.allContainer.raise(sender || this, {
        event: eventName,
        data: data
      });
    },
    
    audit: function(eventName, data) {
      
    },

    eventContainerFor: function(eventName) {
      var container = this.eventListeners[eventName];
      if(!container) {
        container =  new EventContainer(this);
        this.eventListeners[eventName] = container;
      }
      return container;
    }
  };
  
  if(typeof module !== 'undefined' && module.exports) 
    module.exports = Eventable
  else
    exports.Eventable = Eventable
      
}).call(this, this);
(function(exports) {
  var StatusDisplay = function(game) {
    this.clientCount = $('#client-count')
    this.clientStatus = $('#client-status')
    game.autoHook(this)
  }
  StatusDisplay.prototype = {
    onStatusUpdate: function(data) {
      this.updateStatusMessage(data)
      this.updatePlayerCount(data)
    },
    onRoundEnded: function(data) {
      this.setStatusMessageTo('Waiting for the next round')
    },
    onNeedAuth: function() {
      window.location = '/login'
    },
    onRejected: function() {
      this.setStatusMessageTo('Multiple logins from the same account forbidden to prevent cheating')
    },
    updateStatusMessage: function(data) {
      switch(data.status) {
        case 'drawing':
          return this.setStatusMessageTo('Drawing the word ' + data.word)
        case 'guessing':
          return this.setStatusMessageToGuessing(data) 
        case 'waiting':
          return this.setStatusMessageTo('Waiting for other players to join')
      }
    },
    updatePlayerCount: function(data) {
      if(data.clientCount === 1)
        this.setCountMessageTo('You are the only player, invite your friends to join')
      else
        this.setCountMessageTo('There are ' + data.clientCount + ' players online')
    },
    setCountMessageTo: function(message) {
      this.clientCount.text(message)
    },
    setStatusMessageToGuessing: function(data) {
      var content = 
        $('<span/>')
          .append(
            $('<img/>')
            .attr('src', data.player.displayPicture) 
            .css('height', '25px'))
         .append(
             $('<h4/>').text(data.player.displayName + ' is drawing'))
      this.clientStatus.html(content)
    },
    setStatusMessageTo: function(message) {
      this.clientStatus.text(message)
    }
  }
  exports.StatusDisplay = StatusDisplay
}(this));

(function(exports) {
  var FeedbackDisplay = function(game) {
    this.feedbackContainer = $('#feedback-container')
    this.clientFeedback = $('#client-feedback')
    this.game = game
    this.game.autoHook(this)
  }

  FeedbackDisplay.prototype = {
    onWrongGuess: function(data) {
      this.addMessage(
        data.player.displayPicture,
        data.player.displayName + ': ' + data.word)
    },
    onMyCorrectGuess: function(data) {
      this.addMessage('img/happyface.png', 'You guessed ' +  data.word + ' correctly! Now let\'s wait for the slow mo\'s')
    },
    onOtherCorrectGuess: function(data) {
      this.addMessage(
        data.player.displayPicture,
        data.player.displayName + ' guessed the word correctly')
    },
    onRoundEnded: function(data) {
      if(data.winner)
        this.addMessage('img/happyface.png', 'The word was correctly guessed as ' + data.word)
      else
        this.addMessage('img/shockedface.png', 'Nobody guessed the word ' + data.word)
    },
    addPlayerGuessedFirstMessage: function(data) {
      this.addMessage(
        data.player.displayPicture,
        data.player.displayName + 'guessed the word ' + data.word + 'first')
    },
    addMessage: function(picture, message) {
      var html =
        $('<span/>')
          .append(
            $('<img/>')
              .attr('src', picture)
          )
          .append($('<p/>').text(message))
      this.clientFeedback.append(html)
      this.feedbackContainer.get(0).scrollTop = this.feedbackContainer.get(0).scrollHeight
    }  
  }

  exports.FeedbackDisplay = FeedbackDisplay
}(this));
(function(exports) {
  var FeedbackTabs = function() {
    this.clientFeedbackTab = $('#client-feedback-tab')
    this.clientFeedback = $('#client-feedback')
    this.roomFeedbackTab = $('#room-feedback-tab')
    this.roomFeedback = $('#room-feedback')
    this.clientFeedbackTab.click(_.bind(this.showClientFeedback, this))
    this.roomFeedbackTab.click(_.bind(this.showRoomFeedback, this))
    this.showClientFeedback()
  }

  FeedbackTabs.prototype = {
    showClientFeedback: function() {
      this.clientFeedbackTab.addClass('active')
      this.roomFeedbackTab.removeClass('active')
      this.clientFeedback.show()
      this.roomFeedback.hide()
    },
    showRoomFeedback: function() {
      this.clientFeedbackTab.removeClass('active')
      this.roomFeedbackTab.addClass('active')
      this.clientFeedback.hide()
      this.roomFeedback.show()
    }
  }
  exports.FeedbackTabs = FeedbackTabs
})(this);
(function(exports) {
  var PlayerListDisplay = function(game) {
    this.game = game
    this.game.autoHook(this)
    this.initialised = false
    this.playerElements = {}
    this.playerList = $('#room-feedback')
  }

  PlayerListDisplay.prototype = {
    onJoinedGame: function(data) {
      for(var i in data)
        this.addPlayer(data[i])
      this.initialised = true
    },
    onScoresUpdated: function(data) {
      for(var i in data) {
        var item = data[i]
        this.updatePlayerScore(item.player, item.score)
      }
    },
    updatePlayerScore: function(player, score) {
      var element = this.playerElements[player]
      if(!element) return
      element.find('.score').text(score)

      var target = this.findTargetElementAfterScoring(score, element.prev()) 
      if(target)
        element.insertBefore(target)

    },
    findTargetElementAfterScoring: function(score, current, target) {
      if(current.length === 0) return target

      var scoreText = current.find('.score').text()
      var previousScore = parseInt(scoreText, 10)
      if(previousScore < score) {
        target = current
        current  = target.prev()
        return this.findTargetElementAfterScoring(score, current, target)
      }
      return target
    },
    onPlayerJoined: function(data) {
      if(!this.initialised) return
      this.addPlayer(data)
    },
    onPlayerLeft: function(data) {
      if(!this.initialised) return
      this.removePlayer(data)
    },
    addPlayer: function(player) {
      if(this.playerElements[player.id]) return
      var element = 
        $('<span/>')
          .append(
            $('<img/>').attr('src', player.displayPicture)
          )
          .append(
            $('<p/>').text(player.displayName)
          )
          .append(
            $('<p/>').html('( <span class="score">' + player.gameScore + '</span> )')
          )
          .data('userid', player.id)
       this.playerList.append(element)
       this.playerElements[player.id] = element
    },
    removePlayer: function(player) {
      var element = this.playerElements[player.id]
      if(!element) return
      delete this.playerElements[player.id]
      element.remove()
    }
  }
  exports.PlayerListDisplay = PlayerListDisplay
}(this));
(function(exports) {
  
  var Sharing = function(game) {
    this.game = game
    this.game.autoHook(this)
    this.lastRoundId = null
    this.lastArtist = null
    this.shareButton = $('#share-drawing')
    this.shareButton.on('click', _.bind(this.onShareClicked, this))
  }

  Sharing.prototype = {
    onRoundStarted: function() {
      this.shareButton.hide()
    },
    onRoundEnded: function(data) {
      this.lastWord = data.word
    },
    onLastRoundId: function(id) {
      this.lastRoundId = id
      this.shareButton.show()
    },
    onShareClicked: function() {
      var obj = {
        method: 'feed',
        link: 'http://wedrawthings.com/viewround/' + this.lastRoundId,
        picture: 'http://wedrawthings.com/drawings/' + this.lastRoundId,
        name: 'We Draw Things',
        caption: 'A drawing of "' + this.lastWord + '"',
        display: 'popup'
      };

      FB.ui(obj, function() {

      });
      }
  }
  exports.Sharing = Sharing

}(this));
(function(exports) {

  var Game = function() {
    Eventable.call(this)
    this.socket = null
    this.started = false
    this.roundstarted = false
    this.status = 'waiting'
  }

  Game.prototype = {
    start: function() {
      this.socket = io.connect()
      this.socket.on('status', _.bind(this.onServerStatus, this))
      this.socket.on('wrong', _.bind(this.onWrongGuess, this))
      this.socket.on('correct', _.bind(this.onCorrectGuess, this))
      this.socket.on('startround', _.bind(this.onRoundStarted, this))
      this.socket.on('endround', _.bind(this.onRoundEnded, this))
      this.socket.on('reject', _.bind(this.onReject, this))
      this.socket.on('error', _.bind(this.onError, this))
      this.socket.on('drawingstart', _.bind(this.onDrawingStart, this))
      this.socket.on('drawingmove', _.bind(this.onDrawingMove, this))
      this.socket.on('drawingend', _.bind(this.onDrawingEnd, this))
      this.socket.on('countdown', _.bind(this.onCountdown, this))
      this.socket.on('selectbrush', _.bind(this.onBrushSelected, this))
      this.socket.on('selectcolour', _.bind(this.onColourSelected, this))
      this.socket.on('you', _.bind(this.onPersonalInfoReceived, this))
      this.socket.on('globalscorechanged', _.bind(this.onGlobalScoreChanged, this))
      this.socket.on('playerjoined', _.bind(this.onPlayerJoined, this))
      this.socket.on('playerleft', _.bind(this.onPlayerLeft, this))
      this.socket.on('scorechanges', _.bind(this.onScoreChanges, this))
      this.socket.on('lastroundid', _.bind(this.onLastRoundId, this))
      this.socket.on('joinedgame', _.bind(this.onJoinedGame, this))
    },
    stop: function() {
      this.socket.disconnect()
    },
    submitWord: function(word) {
      this.socket.emit('guess', word)
    },
    onLastRoundId: function(id) {
      this.raise('LastRoundId', id)
    },
    onPlayerJoined: function(player) {
      this.raise('PlayerJoined', player)
    },
    onPlayerLeft: function(player) {
      this.raise('PlayerLeft', player)
    },
    onJoinedGame: function(data) {
      this.raise('JoinedGame', data)
    },
    onPersonalInfoReceived: function(player) {
      this.raise('PersonalInfoReceived', player)
    },
    onGlobalScoreChanged: function(data) {
      this.raise('GlobalScoreChanged', data)
    },
    onScoreChanges: function(changes) {
      this.raise('ScoresUpdated', changes)
    },
    onReject: function() {
      this.raise('Rejected')
      this.status = 'rejected'
    },
    onError: function(msg) { 
      if(msg === 'handshake error')
        this.raise('NeedAuth')
    },
    onCountdown: function(time) {
      this.raise('Countdown', time)
    },
    onServerStatus: function(data) {
      this.status = data.status
      this.clientCount = data.clientCount
      this.raise('StatusUpdate', data)
      if(!this.started) {
        this.started = true
        this.raise('Started')
      }
    },
    onWrongGuess: function(word) {
      this.raise('WrongGuess', word)
    },
    onCorrectGuess: function(data) {
      if(data.win) {
        this.status = 'waiting'
        this.raise('MyCorrectGuess', data)
      } else 
        this.raise('OtherCorrectGuess', data)
    },
    onRoundStarted: function() {
      this.raise('RoundStarted')
      if(this.status === 'drawing') {
        this.sendSelectColour('#000')
        this.sendSelectBrush('brush')
      }
    },
    onRoundEnded: function(data) {
      this.raise('RoundEnded', data)
    },
    isDrawing: function() {
      return this.status === 'drawing'
    },
    sendDrawingStart: function(position) {
      if(!this.isDrawing()) return
      this.onDrawingStart(position)
      this.socket.emit('drawingstart', position)
    },
    sendDrawingMove: function(position) {
      if(!this.isDrawing()) return
      this.onDrawingMove(position)
      this.socket.emit('drawingmove', position)
    },
    sendDrawingEnd: function(position) {
      if(!this.isDrawing()) return
      this.onDrawingEnd(position)
      this.socket.emit('drawingend', position)
    },
    sendSelectBrush: function(brush) {
      if(!this.isDrawing()) return
      this.onBrushSelected(brush)
      this.socket.emit('selectbrush', brush)
    },
    sendSelectColour: function(colour) {
      if(!this.isDrawing()) return
      this.onColourSelected(colour)
      this.socket.emit('selectcolour', colour)
    },
    onDrawingStart: function(position) {
      this.raise('DrawingStart', position)
    },
    onDrawingMove: function(position) {
      this.raise('DrawingMove', position)
    },
    onDrawingEnd: function(position) {
      this.raise('DrawingEnd', position)
    },
    onBrushSelected: function(brush) {
      this.raise('BrushSelected', brush)
    },
    onColourSelected: function(colour) {
      this.raise('ColourSelected', colour)
    }
  }
  _.extend(Game.prototype, Eventable.prototype)

  exports.Game = Game
}(this));
(function(exports) {
  var Input = function(game) {
    this.game = game
    this.textInputContainer = $('#client-input-container')
    this.textInput = $('#client-input')
    this.textInputButton = $('#client-input-button')
    this.paintInputContainer = $('#client-paintbrush-container')
    game.autoHook(this)
    this.textInputButton.click(_.bind(this.onInputButtonClick, this))
    this.textInput.keydown(_.bind(this.onInputKeyDown, this))
  }
  Input.prototype = {
    onStatusUpdate: function(data) {
      switch(data.status) {
        case 'waiting': 
          return this.statusWaiting()
        case 'drawing': 
          return this.statusDrawing()
        case 'guessing':
          return this.statusGuessing()
      }
    },
    onMyCorrectGuess: function() {
      this.statusWaiting()
    },
    statusWaiting: function() {
      this.textInputContainer.hide()
      this.paintInputContainer.hide()
    },
    statusDrawing: function() {
      this.paintInputContainer.show()
      this.textInputContainer.hide()
    },
    statusGuessing: function() {
      this.paintInputContainer.hide()
      this.textInputContainer.show()
      this.textInput.focus()
    },
    onInputButtonClick: function() {
      this.submitText()   
    },
    onInputKeyDown: function(e) {
      if(e.keyCode === 13)
        this.submitText()
    },
    submitText: function() {
      var val = this.textInput.val()
      this.textInput.val('')
      this.game.submitWord(val)
      this.textInput.focus()
    }
  }

  exports.Input = Input
}).call(this, this);
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
(function(exports) {

  var ArtPad = function(Canvas) {
    this.lastPosition = null
    this.selectedBrush = null
    this.canvas = new Canvas('surface', 800, 600)
    this.context = this.canvas.context
    this.selectedColour = null
    this.history = []
    this.totalDistanceMoved = 0
    this.distanceLastMoved = 0
    this.numberOfSteps = 0
    this.averageDistanceMoved = 0
    this.status = null
    this.offscreen = new Canvas('offscreen1', 100, 100)
    this.offscreencontext = this.offscreen.context
    this.paintBrushImage = Canvas.createImage('img/paintbrush.png')
    var pad = this
    this.paintBrushImage.onload = function() {
      pad.offscreencontext.clearRect(0, 0, 100, 100)
      pad.offscreencontext.drawImage(pad.paintBrushImage, 0, 0, 100, 100)
    }
    this.clear()
  }

  ArtPad.prototype = {
    clear: function() {
      this.context.fillStyle = '#FFF'
      this.context.globalAlpha = 1.0
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    },
    startDrawing: function(position) {
      this.lastPosition = position
      this.totalDistanceMoved = 0
      this.distanceLastMoved = 0
      this.status = 'starting'
    },
    draw: function(position) {
      this.addToDistances(position)
      this.drawLine(this.lastPosition, position)
      this.lastPosition = position
    },
    stopDrawing: function() {
      this.status = 'ending'
      this.drawLine(this.lastPosition, this.lastPosition)
      this.lastPosition = null
      this.history = []
      this.lastQuad = null
      this.numberOfSteps = 0
    },
    drawLine: function(from, to) { 
      this.context.save()
      if(Brushes[this.selectedBrush])
        Brushes[this.selectedBrush](from, to, this)
      this.context.restore()
    },
    setBrush: function(brush) {
      this.selectedBrush = brush
    },
    setBrushColour: function(colour) {
      this.selectedColour = colour
    },
    addToDistances: function(position) {
      this.numberOfSteps++
      var diffx = position.x - this.lastPosition.x
      var diffy = position.y - this.lastPosition.y
      this.distanceLastMoved = Math.sqrt(diffx * diffx + diffy * diffy)
      this.totalDistanceMoved += this.distanceLastMoved
      this.averageDistanceMoved = (this.distanceLastMoved + this.averageDistanceMoved * 4.0) / 5.0
      position.mag = this.averageDistanceMoved
      this.history.push(position)
    }
  }

  function calculateQuadFrom(from, to, width) {
    var dx = (to.x - from.x) || 0.01
      , dy = (to.y - from.y) || 0.01
      , dmag = Math.sqrt((dx * dx) + (dy * dy))

    
     dx /= dmag
     dy /= dmag

     var nl = { x: -dy, y: dx }
     ,  nr = { x: dy, y: -dx }
     ,  bl = { x: from.x + (width * from.mag * nl.x),
               y: from.y + (width * from.mag * nl.y) }
     ,  br = { x: from.x + (width * from.mag * nr.x),
               y: from.y + (width * from.mag * nr.y) }
     ,  tl = { x: to.x + (  width * to.mag *   nl.x),
               y: to.y + (  width * to.mag *   nl.y) }
     ,  tr = { x: to.x + (  width * to.mag *   nr.x),
               y: to.y + (  width * to.mag *   nr.y) }
    var quad = {
      bl: bl,
      br: br,
      tl: tl,
      tr: tr,
      cx: (bl.x + tr.x) / 2,
      cy: (bl.y + tr.y) / 2,
      width: Math.abs(bl.x - tr.x)
    }
    return quad
  }

  var Brushes = {
    pen: function(from, to, pad) {
      if(pad.history.length < 5) return

      var quads = []
      var index = 0
      if(pad.lastQuad)
        quads[0] = pad.lastQuad
      else
        quads[0] = calculateQuadFrom(pad.history[index++], pad.history[index], 0.25)

      while(index < pad.history.length-1) {
        quads.push(calculateQuadFrom(pad.history[index++], pad.history[index], 0.25))
      }

      pad.context.strokeStyle = pad.selectedColour 
      pad.context.fillStyle = pad.selectedColour
      pad.context.lineWidth = 1 
      pad.context.globalAlpha = 1.0 
      pad.context.lineJoin = 'round'

      
      for(var i = 1 ; i < quads.length; i++)
        pad.context.quadraticCurveTo(quads[i].bl.x, quads[i].bl.y, quads[i].tl.x, quads[i].tl.y)
      
      pad.context.lineTo(quads[quads.length-1].tr.x, quads[quads.length-1].tr.y)

      for(i = quads.length-1 ; i > 0 ; i--)
        pad.context.quadraticCurveTo(quads[i].br.x, quads[i].br.y, quads[i-1].tr.x, quads[i-1].tr.y)

      pad.context.lineTo(quads[0].tl.x, quads[0].tl.y)

      pad.context.closePath()
      pad.context.fill()
      pad.context.stroke()

      if(pad.status === 'starting') {
        pad.status = 'drawing'
      }

      pad.lastQuad = quads[quads.length-1]
      var lastHistory = pad.history
      pad.history = []
      pad.history.push(lastHistory.pop())
    },
    brush: function(from, to, pad) {
      if(pad.history.length < 2) return
      var quad = calculateQuadFrom(pad.history[0], pad.history[1], 3.0) 
      pad.history = []

      var rh, gh, bh = '',
          r, g, b = 0

      var colour = pad.selectedColour
      if(colour.length === 4) {
        rh = colour[1] + colour[1]
        gh = colour[2] + colour[2]
        bh = colour[3] + colour[3]
      } else {
        rh = colour.substr(1, 2)
        gh = colour.substr(3, 2)
        bh = colour.substr(5, 2)
      }

      r = parseInt(rh, 16)
      g = parseInt(gh, 16)
      b = parseInt(bh, 16)

      var dx = parseInt(quad.cx - 50, 10)
        , dy = parseInt(quad.cy - 50, 10)
        , dw = 100
        , dh = 100
        , sx = 0
        , sy = 0
        , sw = 100
        , sh = 100


      // We need to do this adjustment
      // because node-canvas crashes outside of boundaries, goddamit
      if(dx < 0) {
        dw += dx
        sx -= dx
        sw += dx
        dx = 0
       
      }

      if(dy < 0) {
        dh += dy
        sy -= dy
        sh += dy
        dy = 0
      }
      
      var diffw = (dx + dw) - pad.canvas.width
      var diffy = (dy + dh) - pad.canvas.height
      if(diffw > 0)  {
        dw -= diffw
        sw -= diffw
      }

      if(diffy > 0) {
        dh -= diffy
        sh -= diffy
      }

      var source = pad.offscreencontext.getImageData(sx, sy, sw, sh)
      var destination = pad.context.getImageData(dx, dy, dw, dh)

      // You'd have thought that just doing a drawImage with a globalAlpha would be faster
      // Cos you know, it's native and stuff - but no, doing direct pixel blending works better
      // because chrome appears to glitch out doing successive drawImage with a canvas element
      // as a source
      for(var i = 0;  i < sw ; i++) {
        for(var j = 0 ; j < sh ; j++) {
          var index = (i + j * sw) * 4
          var sourceMix = (source.data[index + 3] * 0.02) / 255
          if(sourceMix < 0.01)
            sourceMix = 0
          var destinationMix = 1.0 - sourceMix

          var dr = destination.data[index]
          var dg = destination.data[index+1]
          var db = destination.data[index+2]
          var da = destination.data[index+3]

          destination.data[index] = parseInt((r * sourceMix) + (dr * destinationMix), 10)
          destination.data[index+1] = parseInt((g * sourceMix) + (dg * destinationMix), 10)
          destination.data[index+2] = parseInt((b * sourceMix) + (db * destinationMix), 10) 
          destination.data[index+3] = parseInt((255 * sourceMix) + (da * destinationMix), 10) 
        }
      }
      pad.context.putImageData(destination, dx, dy)
    },
    pencil: function(from, to, pad) {
      if(pad.history.length < 5) return

      pad.context.globalAlpha = 1.0 / (pad.averageDistanceMoved / 5)
      pad.context.lineWidth = 2 
      pad.context.strokeStyle = pad.selectedColour
      pad.context.beginPath()
      pad.context.moveTo(pad.history[0].x, pad.history[0].y)

      for(var i = 1; i < pad.history.length; i++)
        pad.context.lineTo(pad.history[i].x, pad.history[i].y)
      pad.context.stroke()

      var lastItem = pad.history[pad.history.length-1]
      pad.history = [ lastItem ]
    }
  }

  function blendRgb(one, two, out) {
    rgb2hls(one)
    rgb2hls(two)

    // If we're blending with white, then we want to 
    // interpolate from the same colour as we're drawing
    if(one[1] >= 0.9)
      one[0] = two[0]

    // If the destination is really light then we probably
    // don't want to
    //
    // Blend one part paint with 19 parts canvas
    out[0] = 0.05 * (one[0] * 19 + two[0])

    // Blend the lightness, one part paint, 19 parts canvas
    out[1] = 0.05 * (one[1] * 19 + two[1])

    // Just add the saturation
    out[2] = 0.5 * (one[2] + two[2])

    // If our paint is transparent, then don't draw anything
    if(two[3] === 0)
      out[3] = 0
    else
      out[3] = 255 

    out = hls2rgb(out)
    return out
  }

  function rgb2hls(rgb) {
    rgb[0] /= 255.0
    rgb[1] /= 255.0
    rgb[2] /= 255.0

    var maxc = Math.max(rgb[0], rgb[1], rgb[2]),
        minc = Math.min(rgb[0], rgb[1], rgb[2]),
        l = (minc + maxc) / 2.0,
        span = maxc - minc,
        h = 0,
        s = 0,
        rc,gc,bc = 0

    if(minc === maxc) {
      rgb[0] = 0
      rgb[1] = l
      rgb[2] = 0
      return;
    }

    if(l <= 0.5)
      s = span / (maxc + minc)
    else
      s = span / (2.0 - maxc - minc)

    rc = (maxc - rgb[0]) / span
    gc = (maxc - rgb[1]) / span
    bc = (maxc - rgb[2]) / span

    if(rgb[0] === maxc)
      h = bc - gc
    else if(rgb[1] === maxc)
      h = 2.0 + rc - bc
    else
      h = 4.0 + gc - rc

    h = (h / 6.0) % 1.0
    rgb[0] = h
    rgb[1] = l
    rgb[2] = s
  }

  function hls2rgb(hls) {
    var third = 1.0 / 3.0,
        m2 = 0,
        m1 = 0

    if(hls[2] === 0) 
      return [hls[1] * 255, hls[1] * 255, hls[1] * 255, hls[3]]

    if(hls[1] <= 0.5)
      m2 = hls[1] * (1.0 + hls[2])
    else
      m2 = hls[1] + hls[2] - (hls[1] * hls[2])

    m1 = 2.0 * hls[1] - m2
    return [_v(m1, m2, hls[0] + third),
            _v(m1, m2, hls[0])        ,
            _v(m1, m2, hls[0] - third),
            hls[3]]
  }

  function _v(m1, m2, hue) {
    var sixth = 1.0 / 6.0,
        twothirds = 2.0 / 3.0,
        result = 0

    hue = hue % 1.0

    if(hue < 0)
      hue += 1.0

    if(hue < sixth)
      result = m1 + (m2-m1) * hue * 6.0
    else if(hue < 0.5)
      result = m2
    else if(hue < twothirds)
      result = m1 + (m2-m1) * (twothirds-hue) * 6.0
    else
      result = m1

    result *= 255.0
    return result
  }

  ArtPad.hls2rgb = hls2rgb
  ArtPad.rgb2hls = rgb2hls
  ArtPad.blendRgb = blendRgb

  if(typeof module !== 'undefined' && module.exports) 
    module.exports = ArtPad
  else
    exports.ArtPad = ArtPad

}( this));
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
(function(exports) {
  var Timer = function(game) {
    this.game = game;
    this.timerText = $('#timer-text')
    this.game.autoHook(this)
  }

  Timer.prototype = {
    onStatusUpdate: function(data) {
      if(data.status === 'waiting')
        this.timerText.hide()
      else
        this.timerText.show()
    },
    onRoundEnded: function() {
      this.timerText.text('Next round starting shortly')
    },
    onCountdown: function(timeLeft) {
      this.timerText.text(timeLeft + ' seconds left') 
    }
  }

  exports.Timer = Timer
}.call(this, this));
(function(exports) {

  var PersonalStatusDisplay = function(game) {
    this.game = game;
    this.score = $('#player-score')
    this.gameScore = $('#player-game-score')
    this.avatar = $('#player-avatar')
    this.name = $('#player-name')
    this.game.autoHook(this)
  }
  
  PersonalStatusDisplay.prototype = {
    onPersonalInfoReceived: function(player) {
      this.score.text('' + player.globalScore)
      this.gameScore.text('' + player.gameScore)
      this.name.text(player.displayName)
      this.avatar.attr('src', player.displayPicture) 
      
    },
    onGlobalScoreChanged: function(data) {
      this.score.text('' + data.score) 
      this.gameScore.text('' + data.gameScore)
    }
  }

  exports.PersonalStatusDisplay = PersonalStatusDisplay
}(this));
(function(exports) {
  var game = null
  ,   statusDisplay = null
  ,   feedbackDisplay = null
  ,   roomScoresDisplay = null
  ,   personalStatusDisplay = null
  ,   feedbackTabs = null
  ,   playerListDisplay = null
  ,   sharing = null
  ,   input = null
  ,   timer = null

  exports.closeSockets = function() {
    game.stop()
  }

  function onGameStarted() {
    $('#loading').hide()
    $('#content').show()
  }

  if(TEST) {
    var testScript = document.createElement('script')
    var head = document.getElementsByTagName('head')[0]
    testScript.setAttribute('src', 'test.js')
    head.appendChild(testScript)
    testScript.onload = function() {
      $(document).ready(startGame)
    }
  } else {
    $(document).ready(startGame)
  }

  function startGame() {
    game = new Game()
    statusDisplay = new StatusDisplay(game)
    feedbackDisplay = new FeedbackDisplay(game)
    personalStatusDisplay = new PersonalStatusDisplay(game)
    playerListDisplay = new PlayerListDisplay(game)
    sharing = new Sharing(game)
    feedbackTabs = new FeedbackTabs()
    input = new Input(game)
    exports.artPad = new ArtPadInput(game)
    timer = new Timer(game)
    game.on('Started', onGameStarted)
    game.start()
  }
}(window));
