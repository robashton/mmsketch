_ = require('underscore')
find_artist = require('./util').find_artist
ManualContext = require('./context')

Scenario "Guessers trying to send drawing commands", ->
  context = new ManualContext()
  bob = null
  alice = null
  artist = null
  guesser = null

  Given "alice and bob are playing a game together", (done) ->
    context.start ->
      bob = context.add_client_called 'bob'
      alice = context.add_client_called 'alice'
      context.wait_for_all_clients ->
        artist = find_artist [bob, alice]
        guesser = if bob is artist then alice else bob
        done()

  When "the guessers tries to send start drawing commands", (done) ->
    artist.pad.reset()
    guesser.pad.reset()
    guesser.pad.game.sendDrawingStart({x: 5, y: 5})
    context.wait_for_sockets(done)
      
  Then "the artist sees nothing", ->
    artist.pad.sawDrawStart(5,5).should.equal(false)

  When "the guesser tries to send move drawing commands", (done) ->
    guesser.pad.game.sendDrawingMove({x: 10, y: 10})
    context.wait_for_sockets(done)
  
  Then "the artist sees nothing", ->
    artist.pad.sawDrawMove(10,10).should.equal(false)

  When "the guesser tries to send finish drawing commands", (done) ->
    guesser.pad.game.sendDrawingEnd()
    context.wait_for_sockets(done)

  Then "the artist sees nothing", ->
    artist.pad.sawDrawEnd().should.equal(false)

  When "the guesser tries to send brush commands", (done) ->
    guesser.pad.game.sendSelectBrush 0
    context.wait_for_sockets done

  Then "the artist sees nothing", ->
    (artist.pad.sawBrushChosen 0).should.equal(false)

  When "the guesser tries to send colour commands", (done) ->
    guesser.pad.game.sendSelectColour '#FFF'
    context.wait_for_sockets done

  Then "the artist sees nothing", ->
    (artist.pad.sawColourChosen '#FFF').should.equal(false)

